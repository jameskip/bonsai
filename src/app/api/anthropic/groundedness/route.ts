import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  getAnthropicClient,
  readClientApiKey,
  BONSAI_MODEL,
} from "@/lib/anthropic";

export const runtime = "nodejs";

type GroundednessBody = {
  context: string;
  answer: string;
};

const GROUNDEDNESS_SYSTEM = `You are a strict groundedness judge for a retrieval-augmented system.

Process:
1. Decompose the answer into atomic factual claims (one fact per claim).
2. For each claim, classify against the context as exactly one of:
   - "grounded"     — the context directly supports the claim.
   - "contradicted" — the context directly contradicts the claim.
   - "unsupported"  — the context neither supports nor contradicts the claim (the claim was invented or extrapolated).
3. For each claim, quote the exact context span that supports or contradicts it. If unsupported, write "<not in context>".
4. Be conservative: if the context only partially supports a claim, mark it "unsupported".
5. Do not reward fluent or confident phrasing.

Return strict JSON conforming to the provided schema.`;

const groundednessSchema = {
  type: "object" as const,
  additionalProperties: false,
  properties: {
    groundedness_rate: {
      type: "number",
      description: "Fraction of claims that are grounded, 0.0 to 1.0.",
    },
    claims: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          claim: { type: "string" },
          verdict: {
            type: "string",
            enum: ["grounded", "contradicted", "unsupported"],
          },
          evidence_quote: { type: "string" },
        },
        required: ["claim", "verdict", "evidence_quote"],
      },
    },
  },
  required: ["groundedness_rate", "claims"],
};

export async function POST(req: Request) {
  let body: GroundednessBody;
  try {
    body = (await req.json()) as GroundednessBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.context || !body.answer) {
    return NextResponse.json(
      { error: "Body must include `context` and `answer`." },
      { status: 400 }
    );
  }

  const client = (() => {
    try {
      return getAnthropicClient(readClientApiKey(req));
    } catch (e) {
      return e as Error;
    }
  })();
  if (client instanceof Error) {
    return NextResponse.json({ error: client.message }, { status: 401 });
  }

  const userContent = `# Context\n<<<\n${body.context}\n>>>\n\n# Answer to score\n<<<\n${body.answer}\n>>>`;

  try {
    const response = await client.messages.create({
      model: BONSAI_MODEL,
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "medium",
        format: {
          type: "json_schema",
          schema: groundednessSchema,
        },
      },
      system: [
        {
          type: "text",
          text: GROUNDEDNESS_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userContent }],
    });

    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text"
    );
    if (!textBlock) {
      return NextResponse.json(
        { error: "Judge returned no text block.", stop_reason: response.stop_reason },
        { status: 502 }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      return NextResponse.json(
        { error: "Judge returned non-JSON output.", raw: textBlock.text },
        { status: 502 }
      );
    }

    return NextResponse.json({
      result: parsed,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cache_read_input_tokens: response.usage.cache_read_input_tokens,
        cache_creation_input_tokens: response.usage.cache_creation_input_tokens,
      },
      stop_reason: response.stop_reason,
    });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        {
          error:
            "Anthropic authentication failed. Check that your API key is valid (you can update it on the Labs page).",
        },
        { status: 401 }
      );
    }
    if (e instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Rate limited." }, { status: 429 });
    }
    if (e instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Anthropic API error (${e.status}): ${e.message}` },
        { status: 502 }
      );
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
