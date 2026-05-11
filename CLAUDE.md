# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Next.js version

This project is on **Next.js 16 + React 19 + Tailwind v4**. APIs, file conventions, and config formats differ from older versions you may have memorized. Before writing or editing Next.js, React, or Tailwind code, consult the bundled docs at `node_modules/next/dist/docs/` (start at `index.md`). Heed deprecation notices.

Examples of breaking changes already in use: dynamic-route `params` is a `Promise<{ slug: string }>` and must be awaited in `generateMetadata` and page components; ESLint config is the flat `eslint.config.mjs` format using `defineConfig` from `eslint/config`.

## Commands

- `npm run dev` — Next dev server on `localhost:3000`
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint (flat config)

No test runner is configured.

## Environment

Anthropic calls require an API key. Two paths, both supported simultaneously:

- **Server**: `ANTHROPIC_API_KEY` in `.env.local` (see `.env.example`).
- **BYOK (browser)**: user enters their key in the UI; stored in `localStorage` under `bonsai.anthropic_api_key`; sent per-request as `x-anthropic-key` header. Routes prefer the client-supplied key over the env var — see `getAnthropicClient` / `readClientApiKey` in `src/lib/anthropic.ts` and the client hook in `src/lib/api-key.ts`. The server uses the key once and does not persist or log it.

Curriculum, system designs, and quizzes work without any key. Only the labs hit Anthropic.

## Architecture

### Content is data, not Markdown

All teaching material is plain TypeScript data in `src/content/*.ts`:

- `curriculum.ts` — `Lesson[]` (the bulk of content; ~90KB)
- `labs.ts` — `Lab[]` metadata (lab UIs live in `src/components/labs/*.tsx`)
- `system-designs.ts` — `SystemDesign[]` with nodes/edges that render as Mermaid diagrams
- `quizzes.ts` — `Quiz[]`
- `blog.ts` — blog posts

Each module exports both the array and a `getX(slug)` lookup. Routes use these arrays in `generateStaticParams()` for static generation — adding an entry to the array is sufficient to create a page. To add content, edit these files; do not create new MDX/Markdown files.

### Lesson rendering: stepper vs. article

`src/app/curriculum/[slug]/page.tsx` chooses a renderer based on the lesson shape:

- If `lesson.blocks` is non-empty → `LessonStepper` (interactive, one block per step). Block kinds: `prose`, `list`, `checkpoint`, `slider`, `sortBins`, `pairwise`, `reveal`. Each kind has a renderer in `src/components/lesson-blocks/`.
- Otherwise → static article rendered from `lesson.sections`.

When adding a new block kind: extend the `LessonBlock` union in `curriculum.ts`, add a renderer under `lesson-blocks/`, and wire it into `BlockRenderer` in `lesson-stepper.tsx`.

### Anthropic API routes

Three Node-runtime routes under `src/app/api/anthropic/`:

- `judge/route.ts` — LLM-as-judge: scores a candidate against a rubric, returns strict JSON via `output_config.format = json_schema`, with `thinking: { type: "adaptive" }`.
- `generate/route.ts` — single-shot generation with a `style: "concise" | "verbose"` knob (used by the verbosity-bias demo).
- `groundedness/route.ts` — per-claim faithfulness checker.

Conventions every route follows (replicate when adding new ones):

- Import the model id from `src/lib/anthropic.ts` (`BONSAI_MODEL = "claude-opus-4-7"`). Do not hardcode model strings elsewhere.
- Mark the system block with `cache_control: { type: "ephemeral" }` so the static prefix is prompt-cached.
- Return `usage` including `cache_read_input_tokens` / `cache_creation_input_tokens` so the UI's usage strip can display cache hit rate.
- Map `Anthropic.AuthenticationError` → 401, `RateLimitError` → 429, other `APIError` → 502.
- Use `getAnthropicClient(readClientApiKey(req))` for BYOK fallthrough.

### Path alias

`@/*` → `src/*` (see `tsconfig.json`). Use it in imports rather than relative paths that cross top-level dirs.

### UI primitives

shadcn-style components in `src/components/ui/` (Radix + class-variance-authority + `cn()` helper from `src/lib/utils.ts`). Lab UIs in `src/components/labs/`, framed by `LabShell` which renders the header, learning objectives, and `ApiKeyManager`.

## Conventions

- Server-only modules (route handlers, anything reading env) must not be imported from `"use client"` components. The split is enforced by `src/lib/anthropic.ts` (server) vs. `src/lib/api-key.ts` (client, marked `"use client"`).
- When adding content with references, populate `references: Reference[]` on the lesson — `ReferenceList` renders them and the stepper exposes a jump-to-refs affordance.
- For diagrams, use the `<MermaidDiagram>` component; system-design pages auto-build the Mermaid source from `nodes`/`edges`.
