import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, QA4AI_MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";

type JudgeBody = {
  candidate: string;
  context?: string;
  criteria: { id: string; description: string }[];
};

const JUDGE_SYSTEM = `You are a rigorous evaluator scoring a candidate response against an explicit rubric.

Rules you must follow:
1. Score each criterion independently. Do not let one criterion influence another.
2. For each criterion, return a binary verdict ("pass" or "fail") AND quote the exact text from the candidate that supports your verdict (or write "<no relevant text>" if the criterion is not addressed).
3. Be terse. Reasoning is one sentence. Evidence is a direct quote.
4. Do NOT reward verbosity, formatting, or confidence. Only reward whether the criterion is met.
5. Never invent quotes. If you cannot find supporting text, say so explicitly.

Return strict JSON conforming to the provided schema.`;

const judgeSchema = {
  type: "object" as const,
  additionalProperties: false,
  properties: {
    overall_pass_rate: {
      type: "number",
      description: "Fraction of criteria passed, 0.0 to 1.0.",
    },
    verdicts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          criterion_id: { type: "string" },
          verdict: { type: "string", enum: ["pass", "fail"] },
          evidence_quote: {
            type: "string",
            description: "Exact quote from candidate, or '<no relevant text>'.",
          },
          reasoning: {
            type: "string",
            description: "One sentence explaining the verdict.",
          },
        },
        required: ["criterion_id", "verdict", "evidence_quote", "reasoning"],
      },
    },
  },
  required: ["overall_pass_rate", "verdicts"],
};

export async function POST(req: Request) {
  let body: JudgeBody;
  try {
    body = (await req.json()) as JudgeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.candidate || !Array.isArray(body.criteria) || body.criteria.length === 0) {
    return NextResponse.json(
      { error: "Body must include `candidate` (string) and `criteria` (non-empty array)." },
      { status: 400 }
    );
  }

  const client = (() => {
    try {
      return getAnthropic();
    } catch (e) {
      return e as Error;
    }
  })();
  if (client instanceof Error) {
    return NextResponse.json({ error: client.message }, { status: 500 });
  }

  const userContent = [
    body.context ? `# Context\n${body.context}\n` : "",
    `# Criteria (score each independently)\n${body.criteria
      .map((c, i) => `${i + 1}. [${c.id}] ${c.description}`)
      .join("\n")}\n`,
    `# Candidate response (this is what you are scoring)\n<<<\n${body.candidate}\n>>>`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await client.messages.create({
      model: QA4AI_MODEL,
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "medium",
        format: {
          type: "json_schema",
          schema: judgeSchema,
        },
      },
      system: [
        {
          type: "text",
          text: JUDGE_SYSTEM,
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
        { error: "Anthropic auth failed. Check ANTHROPIC_API_KEY." },
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
