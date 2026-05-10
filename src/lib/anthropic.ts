import Anthropic from "@anthropic-ai/sdk";

let cached: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (cached) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing ANTHROPIC_API_KEY. Set it in .env.local before calling Anthropic-backed labs."
    );
  }
  cached = new Anthropic({ apiKey });
  return cached;
}

export const QA4AI_MODEL = "claude-opus-4-7";
