import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  getAnthropicClient,
  readClientApiKey,
  BONSAI_MODEL,
} from "@/lib/anthropic";

export const runtime = "nodejs";

type PairwiseBody = {
  prompt: string;
  first: string;
  second: string;
  criterion?: string;
};

const PAIRWISE_SYSTEM = `You are a pairwise judge. Two candidate responses ("first" and "second") were generated for the same user prompt. Pick the one that better satisfies the criterion. Be strict and ignore order, length, and confidence.

Rules:
1. Read the prompt and the stated criterion carefully.
2. Compare the two candidates only against the criterion. Do not reward verbosity or formatting.
3. Output strict JSON: which candidate wins ("first" | "second" | "tie") and a one-sentence reason that names the deciding factor.
4. "tie" is only allowed when both candidates are equivalently good or equivalently bad on the criterion.`;

const pairwiseSchema = {
  type: "object" as const,
  additionalProperties: false,
  properties: {
    winner: { type: "string", enum: ["first", "second", "tie"] },
    reasoning: {
      type: "string",
      description: "One sentence naming the deciding factor.",
    },
  },
  required: ["winner", "reasoning"],
};

export async function POST(req: Request) {
  let body: PairwiseBody;
  try {
    body = (await req.json()) as PairwiseBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.prompt || !body.first || !body.second) {
    return NextResponse.json(
      { error: "Body must include `prompt`, `first`, and `second` (all strings)." },
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

  const criterion =
    body.criterion?.trim() ||
    "Which response better answers the prompt with accurate, relevant, on-topic content?";

  const userContent = [
    `# Prompt\n${body.prompt}`,
    `# Criterion\n${criterion}`,
    `# Candidate "first"\n<<<\n${body.first}\n>>>`,
    `# Candidate "second"\n<<<\n${body.second}\n>>>`,
  ].join("\n\n");

  try {
    const response = await client.messages.create({
      model: BONSAI_MODEL,
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "low",
        format: {
          type: "json_schema",
          schema: pairwiseSchema,
        },
      },
      system: [
        {
          type: "text",
          text: PAIRWISE_SYSTEM,
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
        { error: "Pairwise judge returned no text block.", stop_reason: response.stop_reason },
        { status: 502 }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      return NextResponse.json(
        { error: "Pairwise judge returned non-JSON output.", raw: textBlock.text },
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
      return NextResponse.json(
        { error: "Rate limited by Anthropic. Try again shortly." },
        { status: 429 }
      );
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
