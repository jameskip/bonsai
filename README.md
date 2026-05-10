# qa4ai

QA for the AI age — a Next.js teaching app covering evals, LLM-as-judge, RAG and agent
testing, red-teaming, drift detection, system designs, and the frontier of AI quality.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- shadcn-style UI primitives (Radix)
- `@anthropic-ai/sdk` for live judge / generation labs
- Model: `claude-opus-4-7` with adaptive thinking, prompt caching, and structured outputs

## What's in here

- **`/curriculum`** — 9 lessons from foundations to frontier topics
- **`/labs`** — 4 interactive labs wired to live Claude calls:
  - LLM-as-judge with verbosity-bias demo
  - Rubric builder & dry-run
  - Prompt-injection sandbox with toggleable defenses
  - Groundedness checker (per-claim verdicts)
- **`/system-designs`** — 5 production architectures (eval pipeline, RAG harness, agent
  harness, observability stack, CI/CD)
- **`/quizzes`** — 3 scenario-quiz modules

## Getting started

```bash
npm install
cp .env.example .env.local
# add your Anthropic API key to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The labs require `ANTHROPIC_API_KEY` to be set. Curriculum, system designs, and quizzes
work without it.

## Design notes

- API routes proxy to Anthropic with prompt caching on the system prompt block, so
  repeated lab runs cost ~10% of the first call for the cached prefix.
- Judge prompts force per-criterion structured output with evidence quotes — the same
  pattern the curriculum recommends for production.
- Content lives in `src/content/*.ts` as plain TypeScript data — easy to extend.
