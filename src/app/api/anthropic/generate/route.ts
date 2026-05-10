import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, QA4AI_MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";

type GenerateBody = {
  system?: string;
  prompt: string;
  style?: "concise" | "verbose";
};

const STYLE_NUDGE: Record<NonNullable<GenerateBody["style"]>, string> = {
  concise:
    "Respond in two sentences or fewer. Use plain prose, no formatting, no preamble.",
  verbose:
    "Respond thoroughly with structure: a heading, bullet points, multiple paragraphs, and a closing summary. Be expansive.",
};

export async function POST(req: Request) {
  let body: GenerateBody;
  try {
    body = (await req.json()) as GenerateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.prompt) {
    return NextResponse.json({ error: "Body must include `prompt`." }, { status: 400 });
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

  const systemText = [
    body.system ?? "You are a helpful assistant in a teaching demo about QA for AI.",
    body.style ? `\n\nStyle directive: ${STYLE_NUDGE[body.style]}` : "",
  ].join("");

  try {
    const response = await client.messages.create({
      model: QA4AI_MODEL,
      max_tokens: 1024,
      output_config: { effort: "low" },
      system: [
        {
          type: "text",
          text: systemText,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: body.prompt }],
    });

    const textBlocks = response.content.filter(
      (b): b is Anthropic.TextBlock => b.type === "text"
    );
    const text = textBlocks.map((b) => b.text).join("\n");

    return NextResponse.json({
      text,
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
