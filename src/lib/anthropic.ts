import Anthropic from "@anthropic-ai/sdk";

export const BONSAI_MODEL = "claude-opus-4-7";

const BYOK_HEADER = "x-anthropic-key";

export function getAnthropicClient(apiKey?: string): Anthropic {
  const key = apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "No Anthropic API key. Add one on the Labs page (stored only in your browser), or set ANTHROPIC_API_KEY in your server environment."
    );
  }
  return new Anthropic({ apiKey: key });
}

export function readClientApiKey(req: Request): string | undefined {
  const v = req.headers.get(BYOK_HEADER);
  return v && v.trim().length > 0 ? v.trim() : undefined;
}
