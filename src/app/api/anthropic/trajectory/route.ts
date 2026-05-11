import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  getAnthropicClient,
  readClientApiKey,
  BONSAI_MODEL,
} from "@/lib/anthropic";

export const runtime = "nodejs";

type Step = {
  index: number;
  tool: string;
  args: string;
  observation: string;
};

type TrajectoryBody = {
  task: string;
  steps: Step[];
  final_answer: string;
};

const TRAJECTORY_SYSTEM = `You are critiquing the trajectory of a tool-using agent. You will see the user task, an ordered list of tool calls with their observed outputs, and the agent's final answer.

Score the trajectory on three dimensions. Each dimension gets a pass/fail verdict AND evidence pointing at specific step indices.

Dimensions:
1. tool_selection — Did the agent pick correct tools for the task? Fails if the agent used a wrong tool, missed a needed tool, or used a tool that doesn't fit the question.
2. step_efficiency — Were the steps the minimum needed? Fails on redundant calls, repeated calls with the same args, or pointless calls whose outputs were not used.
3. grounding_in_trace — Is the final answer supported by what the steps observed? Fails if the agent invented details not present in any observation, contradicted observations, or hallucinated tool outputs not in the trace.

Rules:
- Refer to steps by their index (e.g., "step 2").
- Evidence is a quote from the observation OR a concrete description of what went wrong, plus the step index(es) involved.
- One sentence of reasoning per dimension. Be terse.
- Do NOT penalize an agent for things outside its trace (e.g., real-world facts you happen to know). Score only what the trajectory shows.

Return strict JSON conforming to the schema.`;

const trajectorySchema = {
  type: "object" as const,
  additionalProperties: false,
  properties: {
    overall_pass_rate: {
      type: "number",
      description: "Fraction of dimensions passed, 0.0 to 1.0.",
    },
    verdicts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          dimension: {
            type: "string",
            enum: ["tool_selection", "step_efficiency", "grounding_in_trace"],
          },
          verdict: { type: "string", enum: ["pass", "fail"] },
          step_indices: {
            type: "array",
            items: { type: "integer" },
            description: "Indices of the steps that the verdict is anchored on. Empty if dimension applies overall.",
          },
          evidence: {
            type: "string",
            description: "Quote or concrete description of what supports the verdict.",
          },
          reasoning: {
            type: "string",
            description: "One sentence explaining the verdict.",
          },
        },
        required: ["dimension", "verdict", "step_indices", "evidence", "reasoning"],
      },
    },
  },
  required: ["overall_pass_rate", "verdicts"],
};

export async function POST(req: Request) {
  let body: TrajectoryBody;
  try {
    body = (await req.json()) as TrajectoryBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.task || !Array.isArray(body.steps) || !body.final_answer) {
    return NextResponse.json(
      { error: "Body must include `task`, `steps` (array), and `final_answer`." },
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

  const stepText = body.steps
    .map(
      (s) =>
        `## Step ${s.index}\n- tool: ${s.tool}\n- args: ${s.args}\n- observation: ${s.observation}`
    )
    .join("\n\n");

  const userContent = [
    `# Task\n${body.task}`,
    `# Trace\n${stepText}`,
    `# Final answer\n<<<\n${body.final_answer}\n>>>`,
  ].join("\n\n");

  try {
    const response = await client.messages.create({
      model: BONSAI_MODEL,
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "medium",
        format: {
          type: "json_schema",
          schema: trajectorySchema,
        },
      },
      system: [
        {
          type: "text",
          text: TRAJECTORY_SYSTEM,
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
        {
          error: "Trajectory judge returned no text block.",
          stop_reason: response.stop_reason,
        },
        { status: 502 }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      return NextResponse.json(
        { error: "Trajectory judge returned non-JSON output.", raw: textBlock.text },
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
