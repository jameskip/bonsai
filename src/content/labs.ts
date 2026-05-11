export type Lab = {
  slug: string;
  title: string;
  tagline: string;
  estMinutes: number;
  level: "Foundations" | "Intermediate" | "Advanced";
  description: string;
  learningObjectives: string[];
  requiresApiKey: boolean;
};

export const labs: Lab[] = [
  {
    slug: "llm-as-judge",
    title: "Build an LLM-as-judge",
    tagline: "Author a rubric, judge a real generation, see the bias.",
    estMinutes: 10,
    level: "Intermediate",
    description:
      "Author a structured rubric, generate a candidate response with Claude, then run a judge call that scores the response per-criterion with evidence quotes. Toggle a 'verbose response' to see verbosity bias in action.",
    learningObjectives: [
      "Write a per-criterion rubric instead of a holistic score.",
      "Force structured JSON output from the judge.",
      "Observe verbosity bias by comparing scores on short vs. long responses.",
    ],
    requiresApiKey: true,
  },
  {
    slug: "rubric-builder",
    title: "Rubric builder & dry-run",
    tagline: "Iterate on a rubric and see how scores change live.",
    estMinutes: 8,
    level: "Foundations",
    description:
      "Drop a candidate output into the editor, write criteria, and watch a Claude judge score it under each rubric variant. Designed to teach rubric craft without needing infrastructure.",
    learningObjectives: [
      "Translate vague quality goals into checkable criteria.",
      "See how rubric phrasing changes scores.",
      "Recognize when a criterion needs evidence requirements vs. a binary check.",
    ],
    requiresApiKey: true,
  },
  {
    slug: "prompt-injection-lab",
    title: "Prompt-injection sandbox",
    tagline: "Attack a system prompt — and see the defenses.",
    estMinutes: 12,
    level: "Advanced",
    description:
      "A toy customer-support assistant runs with a fixed system prompt. Try direct and indirect injection attacks. Toggle defenses (input sanitization, output filtering, isolated tool channels) to see which attacks succeed.",
    learningObjectives: [
      "Distinguish direct from indirect prompt injection.",
      "See why input filtering alone is insufficient.",
      "Understand defense-in-depth for AI systems.",
    ],
    requiresApiKey: true,
  },
  {
    slug: "groundedness-checker",
    title: "Groundedness checker",
    tagline: "Score per-claim faithfulness against a context window.",
    estMinutes: 9,
    level: "Intermediate",
    description:
      "Paste a context document and a candidate answer. The lab decomposes the answer into claims, then runs a Claude judge to mark each claim grounded / contradicted / unsupported, with evidence quotes.",
    learningObjectives: [
      "Decompose answers into atomic claims.",
      "Distinguish grounded, contradicted, and unsupported claims.",
      "Build the per-claim citation pattern used in production RAG.",
    ],
    requiresApiKey: true,
  },
  {
    slug: "pairwise-bias",
    title: "Pairwise & positional bias",
    tagline: "Same content, swapped order — watch the judge change its mind.",
    estMinutes: 10,
    level: "Intermediate",
    description:
      "Two candidate responses (A and B), a pairwise judge that picks a winner, and a battery that runs both orderings. The lab reports A/B win counts and the positional gap — how often the first-shown candidate wins regardless of content.",
    learningObjectives: [
      "Recognize positional bias as a distinct failure mode of pairwise judges.",
      "Use order-swapped batteries to separate content quality from position effects.",
      "Decide when pairwise scoring is appropriate vs. rubric-based scoring.",
    ],
    requiresApiKey: true,
  },
  {
    slug: "agent-trajectory",
    title: "Agent trajectory critique",
    tagline: "Grade the agent's path, not just its answer.",
    estMinutes: 12,
    level: "Advanced",
    description:
      "Pre-canned agent traces with seeded failure modes — redundant tool calls, wrong-tool selection, hallucinated observations. A trajectory judge scores tool selection, step efficiency, and grounding-in-trace with evidence pointing at specific step indices.",
    learningObjectives: [
      "Evaluate agents at the trajectory level, not only the final answer.",
      "Distinguish failures of tool selection, efficiency, and grounding.",
      "See how often a correct answer hides a broken trajectory (and vice versa).",
    ],
    requiresApiKey: true,
  },
];

export function getLab(slug: string): Lab | undefined {
  return labs.find((l) => l.slug === slug);
}
