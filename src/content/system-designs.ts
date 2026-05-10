export type DesignNode = {
  id: string;
  label: string;
  kind: "input" | "process" | "store" | "model" | "output" | "judge";
  description: string;
};

export type DesignEdge = {
  from: string;
  to: string;
  label?: string;
};

export type SystemDesign = {
  slug: string;
  title: string;
  tagline: string;
  problem: string;
  goals: string[];
  nonGoals: string[];
  nodes: DesignNode[];
  edges: DesignEdge[];
  walkthrough: { heading: string; body: string }[];
  tradeoffs: { decision: string; chose: string; over: string; because: string }[];
  metrics: string[];
};

export const designs: SystemDesign[] = [
  {
    slug: "eval-pipeline",
    title: "Offline Eval Pipeline",
    tagline: "From prompt PR to a defensible quality verdict in under 10 minutes.",
    problem:
      "Engineers change prompts, retrieval, or model versions dozens of times per week. Each change can silently regress quality. We need a CI-grade pipeline that produces a per-PR quality report, gates merges, and stores all results for trend analysis.",
    goals: [
      "Run on every PR in <10 minutes for the smoke set, <30 min for the full suite.",
      "Report per-slice deltas vs. production baseline with statistical significance.",
      "Cache judge calls aggressively — most cases are unchanged across runs.",
      "Provide trace links so reviewers can audit any failure in one click.",
    ],
    nonGoals: [
      "Online (production) quality monitoring — covered separately.",
      "Human-in-the-loop labeling — handled by triage tooling.",
    ],
    nodes: [
      { id: "pr", label: "PR / commit", kind: "input", description: "Prompt, retrieval config, tool, or model change." },
      { id: "runner", label: "Eval Runner", kind: "process", description: "Loads case set, fans out generation, applies scoring." },
      { id: "cases", label: "Case Store", kind: "store", description: "Versioned dataset: prod traces, bug reports, red-team, synthetic." },
      { id: "model", label: "System Under Test", kind: "model", description: "The candidate stack: prompt + retriever + tools + model." },
      { id: "judge", label: "Judge Pool", kind: "judge", description: "Programmatic checks + LLM judges with cached verdicts." },
      { id: "results", label: "Results Warehouse", kind: "store", description: "Append-only store of every run, sliceable by tag/version/case." },
      { id: "report", label: "PR Report", kind: "output", description: "Delta-vs-baseline, slice regressions, trace drill-downs." },
    ],
    edges: [
      { from: "pr", to: "runner", label: "trigger" },
      { from: "cases", to: "runner", label: "load" },
      { from: "runner", to: "model", label: "generate" },
      { from: "model", to: "runner", label: "outputs + traces" },
      { from: "runner", to: "judge", label: "score" },
      { from: "judge", to: "results", label: "verdicts" },
      { from: "results", to: "report", label: "compare" },
    ],
    walkthrough: [
      {
        heading: "1. PR triggers the runner",
        body:
          "A GitHub Action invokes the runner with the candidate config (prompt + model version + retriever rev + tool schemas). The runner deterministically picks a case set: a fast 'smoke' set (~50 cases, 2 min) on every commit, the full set (~2000 cases, 25 min) on PR-ready and on main.",
      },
      {
        heading: "2. Generation with traces",
        body:
          "Each case is run with n=3 samples. Every call captures the full trace: prompt, retrieval results, tool calls, model version, latency, tokens. Traces are stored with a content-addressed hash so judge results can be cached.",
      },
      {
        heading: "3. Scoring with cached judges",
        body:
          "For each (case, output) we run the rubric's checks: programmatic (regex, schema), LLM-as-judge (per-criterion structured output), and pairwise vs. baseline (for win-rate metrics). Judge calls are cached by hash(judge_prompt, output) — most PRs only invalidate ~10% of cases.",
      },
      {
        heading: "4. Statistical comparison",
        body:
          "We compare candidate vs. baseline on the same case set with paired bootstrap. Per slice (case tag), we report the delta and 95% CI. The PR report flags slices where the CI excludes zero, separating signal from noise.",
      },
      {
        heading: "5. Gate and merge",
        body:
          "Gates: zero regression on the safety slice; no other slice regresses by >2σ; headline metric does not regress at p<0.05. Below those, merge is blocked with an actionable diff. Above those, merge is allowed and a canary plan is auto-attached.",
      },
    ],
    tradeoffs: [
      {
        decision: "Cache judge verdicts by output hash",
        chose: "Aggressive caching",
        over: "Re-judge every run",
        because: "90%+ of cases are unchanged across PRs; re-judging burns budget and adds variance.",
      },
      {
        decision: "Paired bootstrap, not raw mean diff",
        chose: "Paired statistical test",
        over: "Threshold on absolute mean",
        because: "Eval scores have non-trivial variance; raw deltas produce false alarms and missed regressions.",
      },
      {
        decision: "Smoke set on every commit, full set on ready",
        chose: "Two-tier suite",
        over: "Full suite always",
        because: "Engineering velocity matters; smoke catches 80% of regressions in <2 minutes.",
      },
    ],
    metrics: [
      "p50 / p95 PR turnaround time",
      "Judge cache hit rate",
      "Per-slice regression detection rate (validated on synthetic regressions)",
      "False-alarm rate on no-op PRs",
    ],
  },
  {
    slug: "rag-eval-architecture",
    title: "RAG Evaluation Architecture",
    tagline: "Score retrieval and generation independently, then jointly.",
    problem:
      "End-to-end RAG metrics conflate retrieval and generation failures. We need an evaluation harness that produces independent scores for the retriever, the generator, and the integrated system, with adversarial cases for each.",
    goals: [
      "Retrieval scores: recall@k, MRR, context precision per slice.",
      "Generation scores: groundedness, faithfulness, answer relevance.",
      "Adversarial coverage: counterfactual docs, prompt injection in retrieved content, missing gold doc.",
    ],
    nonGoals: [
      "Index build / freshness — covered by a separate ingestion pipeline.",
    ],
    nodes: [
      { id: "qset", label: "Question Set", kind: "input", description: "Labeled (question, gold_doc_ids, expected_behavior) tuples." },
      { id: "retriever", label: "Retriever", kind: "model", description: "BM25 + dense + reranker; the candidate stack." },
      { id: "rmetrics", label: "Retrieval Scorer", kind: "process", description: "Computes recall@k, MRR, nDCG, context precision." },
      { id: "generator", label: "Generator", kind: "model", description: "LLM with retrieved context in prompt." },
      { id: "gjudge", label: "Generation Judge", kind: "judge", description: "Per-claim groundedness + faithfulness + relevance via structured LLM." },
      { id: "advgen", label: "Adversarial Case Gen", kind: "process", description: "Inserts contradicting / injected / irrelevant docs." },
      { id: "report", label: "Sliced Report", kind: "output", description: "Retrieval, generation, and joint metrics by question type." },
    ],
    edges: [
      { from: "qset", to: "retriever", label: "queries" },
      { from: "retriever", to: "rmetrics", label: "ranked docs" },
      { from: "qset", to: "rmetrics", label: "gold ids" },
      { from: "retriever", to: "generator", label: "context" },
      { from: "advgen", to: "generator", label: "perturbed context" },
      { from: "generator", to: "gjudge", label: "answer + claims" },
      { from: "gjudge", to: "report" },
      { from: "rmetrics", to: "report" },
    ],
    walkthrough: [
      {
        heading: "1. Score retrieval in isolation",
        body:
          "Run the retriever on every question and compute recall@k for k ∈ {1,3,5,10}, MRR, and context precision against the labeled gold doc IDs. This score depends only on the retriever — it does not move when you change the LLM.",
      },
      {
        heading: "2. Score generation with controlled context",
        body:
          "Pass each question to the generator with three context conditions: (a) gold context only, (b) retrieved context, (c) adversarially perturbed context. The judge scores per-claim groundedness and faithfulness, plus answer relevance. Differences across conditions isolate generator failures vs. retrieval failures.",
      },
      {
        heading: "3. Adversarial perturbations",
        body:
          "The case generator builds: counterfactual variants (one doc contradicts the rest), injection variants (a doc contains 'ignore previous instructions...'), missing-gold variants (gold doc removed; correct behavior is to refuse), and irrelevant-only variants (no relevant doc; correct behavior is to refuse or escalate).",
      },
      {
        heading: "4. Sliced reporting",
        body:
          "Report metrics sliced by question type (factoid, multi-hop, comparison), domain, and adversarial condition. A regression in 'multi-hop with missing gold doc' is a different story from a regression in 'factoid with clean retrieval' — the report makes that visible.",
      },
    ],
    tradeoffs: [
      {
        decision: "Dual scoring (gold context vs retrieved context)",
        chose: "Run generator twice per case",
        over: "Single retrieved-context run",
        because: "Decouples generator quality from retriever quality; doubles cost but enables attribution.",
      },
      {
        decision: "Per-claim citations required",
        chose: "Structured output with per-claim citations",
        over: "Free-text answers",
        because: "Per-claim citations let the judge score groundedness mechanically; free-text requires fuzzy matching.",
      },
    ],
    metrics: [
      "Recall@k, MRR, context precision per slice",
      "Groundedness, faithfulness, answer relevance",
      "Refusal rate on missing-gold cases",
      "Injection-attack resistance rate",
    ],
  },
  {
    slug: "agent-eval-harness",
    title: "Agent Evaluation Harness",
    tagline: "Reproducible trajectories in containerized environments.",
    problem:
      "Tool-using agents take long, branching trajectories that touch real APIs. We need an environment where every eval run is deterministic enough to attribute regressions to model/prompt changes, and rich enough to surface tool-specific failures.",
    goals: [
      "Snapshot-restore environments per case for full determinism.",
      "Trace every tool call with inputs/outputs/timings.",
      "Score plan quality, tool-selection accuracy, step efficiency, and final-task success.",
      "Support both mocked-tool and live-tool runs.",
    ],
    nonGoals: [
      "Multi-agent orchestration eval — covered separately.",
    ],
    nodes: [
      { id: "tasks", label: "Task Suite", kind: "input", description: "Versioned tasks: goal, success criteria, allowed tools." },
      { id: "env", label: "Sandbox Env", kind: "process", description: "Container with snapshot-restore (filesystem, mock APIs, browser, OS)." },
      { id: "agent", label: "Agent SUT", kind: "model", description: "Planner + tool-use loop; the candidate stack." },
      { id: "tools", label: "Tool Layer", kind: "process", description: "Mocked tools (recorded responses) or live (rate-limited)." },
      { id: "tracer", label: "Trajectory Logger", kind: "store", description: "Captures every step: thought, tool, args, observation." },
      { id: "tjudge", label: "Trajectory Judge", kind: "judge", description: "Per-step + overall scoring against rubric." },
      { id: "report", label: "Report", kind: "output", description: "Success rate, efficiency, failure mode taxonomy." },
    ],
    edges: [
      { from: "tasks", to: "env", label: "snapshot" },
      { from: "env", to: "agent", label: "initial state" },
      { from: "agent", to: "tools", label: "tool calls" },
      { from: "tools", to: "agent", label: "observations" },
      { from: "agent", to: "tracer", label: "trace" },
      { from: "tracer", to: "tjudge", label: "trajectory" },
      { from: "tasks", to: "tjudge", label: "success criteria" },
      { from: "tjudge", to: "report" },
    ],
    walkthrough: [
      {
        heading: "1. Snapshot the environment",
        body:
          "Each task starts from a sealed container snapshot: filesystem in a known state, mock APIs primed with deterministic responses, browser at a known URL. Restoring between runs eliminates 'works on my run' flakiness.",
      },
      {
        heading: "2. Run the agent with tracing",
        body:
          "The agent's thought, tool selection, args, and observations are logged at every step with monotonic timestamps. The trace is the unit of evaluation — outcomes alone don't tell you why something worked or failed.",
      },
      {
        heading: "3. Mock vs. live",
        body:
          "Mocked tools (recorded I/O) make runs cheap and deterministic — use these on every PR. Live runs (real APIs, rate-limited) catch integration drift — schedule nightly. When mocked and live diverge, the underlying tool changed; auto-file an issue.",
      },
      {
        heading: "4. Trajectory scoring",
        body:
          "The judge scores: tool-selection accuracy (per step, vs. allowed tools), parameter validity, step efficiency (steps used / minimum needed), recovery (handled tool errors gracefully?), termination (stopped at success vs. looped). Final-task success is graded with a task-specific verifier (file diff, DOM check, API state check).",
      },
      {
        heading: "5. Failure-mode taxonomy",
        body:
          "Failures are auto-classified: loop trap, goal drift, tool hallucination, premature commitment, cascading error. Track counts per release; a spike in 'goal drift' after a prompt change is a precise actionable signal.",
      },
    ],
    tradeoffs: [
      {
        decision: "Snapshot-restore containers per case",
        chose: "Heavy isolation",
        over: "Shared state with reset scripts",
        because: "Reset scripts always miss something; snapshots are the only way to hit determinism at scale.",
      },
      {
        decision: "Mocked tools by default; live nightly",
        chose: "Hybrid",
        over: "All-live",
        because: "Live APIs are slow, flaky, expensive; mocks let us run on every commit. Nightly live catches integration drift.",
      },
    ],
    metrics: [
      "Task success rate per task category",
      "Average steps per task; efficiency = optimal_steps / actual_steps",
      "Tool-selection accuracy",
      "Failure-mode distribution per release",
    ],
  },
  {
    slug: "observability-stack",
    title: "Production Observability for AI Systems",
    tagline: "Every request scored, every drift detected, every failure looped back.",
    problem:
      "Offline evals are a snapshot. Production is a stream. We need an observability stack that scores live traffic, detects drift, surfaces regressions in hours, and feeds curated cases back into the offline eval set.",
    goals: [
      "Per-request quality score from a cheap online judge.",
      "Distribution monitoring for inputs, outputs, and quality.",
      "Triage queue that turns user-reported failures into eval cases.",
      "Auto-rollback on online quality threshold breach.",
    ],
    nonGoals: [
      "Cost optimization — adjacent concern.",
    ],
    nodes: [
      { id: "user", label: "User Traffic", kind: "input", description: "Production requests with user feedback signals." },
      { id: "gateway", label: "API Gateway", kind: "process", description: "Routes traffic, applies version, attaches request ID." },
      { id: "stack", label: "Production Stack", kind: "model", description: "Prompt + retriever + tools + model — versioned." },
      { id: "logger", label: "Request Logger", kind: "store", description: "Full request, response, trace, version, latency, tokens, feedback." },
      { id: "online", label: "Online Judge", kind: "judge", description: "Cheap LLM judge scores a sample (~5%) of requests live." },
      { id: "monitors", label: "Drift Monitors", kind: "process", description: "PSI / KL on input embeddings, output stats, quality scores." },
      { id: "triage", label: "Triage Queue", kind: "store", description: "User-reported + auto-flagged cases for human review." },
      { id: "evals", label: "Offline Eval Set", kind: "store", description: "Curated regression cases — the canonical truth." },
      { id: "rollback", label: "Auto-Rollback", kind: "output", description: "Trips on quality / error rate thresholds; pins prior version." },
    ],
    edges: [
      { from: "user", to: "gateway", label: "request" },
      { from: "gateway", to: "stack" },
      { from: "stack", to: "logger" },
      { from: "logger", to: "online", label: "5% sample" },
      { from: "logger", to: "monitors", label: "stats" },
      { from: "online", to: "monitors", label: "quality" },
      { from: "monitors", to: "rollback", label: "threshold" },
      { from: "user", to: "triage", label: "thumbs/edit" },
      { from: "monitors", to: "triage", label: "drift slice" },
      { from: "triage", to: "evals", label: "labeled cases" },
    ],
    walkthrough: [
      {
        heading: "1. Log everything, version everything",
        body:
          "Every production request stores prompt, retrieval results, tool calls, response, trace, model version, prompt revision, latency, tokens, and any user feedback signal (thumbs, edits, abandonment). Version tags make rollback and post-hoc slicing possible.",
      },
      {
        heading: "2. Score a sample live",
        body:
          "A cheap LLM judge runs on ~5% of requests within seconds. The judge prompt is small and structured (rubric → JSON). The result is a per-request quality score that powers dashboards and alerting without grading every request.",
      },
      {
        heading: "3. Detect drift on three axes",
        body:
          "Input drift (embedding-distribution PSI vs. last week), output drift (length, refusal rate, format distribution), quality drift (online judge mean by version). Alerts fire when PSI > 0.2 on any axis or when judge quality drops by 2σ over a 1h window.",
      },
      {
        heading: "4. Triage and back to evals",
        body:
          "Drift slices and user-reported failures hit a triage queue. A human labels root cause (retrieval miss, hallucination, format break, safety) and the case is added to the offline eval set. Next PR runs against this updated set; the bug never returns.",
      },
      {
        heading: "5. Auto-rollback",
        body:
          "If online quality drops below a per-version SLO or error rate spikes, traffic is pinned to the previous version automatically. The team is paged with the diff and the affected slices. Manual override re-enables the new version.",
      },
    ],
    tradeoffs: [
      {
        decision: "Sample 5% for online judging",
        chose: "Sampling",
        over: "100% live judging",
        because: "Cost. 5% is enough to detect drift in <1h; 100% would double inference cost.",
      },
      {
        decision: "Auto-rollback on threshold",
        chose: "Automated",
        over: "Pager-then-manual",
        because: "Median time-to-mitigate beats median time-to-page; a false rollback is reversible, a continued bad rollout is not.",
      },
    ],
    metrics: [
      "Online judge quality score by version",
      "Input/output/quality PSI by slice",
      "Triage queue → eval-case conversion rate",
      "MTTR after rollback fires",
    ],
  },
  {
    slug: "ci-architecture",
    title: "CI/CD for Prompt and Model Releases",
    tagline: "Shadow → canary → full, with statistical gates the whole way.",
    problem:
      "Prompts, model versions, retrieval indices, and tool schemas are all release artifacts. We need a release pipeline that gates on offline evals, then validates online via shadow and canary, with automatic rollback.",
    goals: [
      "Block merges that regress safety or headline metrics with statistical significance.",
      "Run shadow comparisons before any user traffic shifts.",
      "Canary at 1% → 5% → 25% → 100% with quality and error gates at each step.",
      "Automatic rollback and full audit trail for every release.",
    ],
    nonGoals: [
      "Index ingestion pipeline.",
    ],
    nodes: [
      { id: "pr", label: "PR", kind: "input", description: "Prompt / model / tool change with author + reviewers." },
      { id: "offline", label: "Offline Evals", kind: "process", description: "Smoke + full suite; statistical gates per slice." },
      { id: "registry", label: "Artifact Registry", kind: "store", description: "Versioned prompts, model pins, tool schemas, eval results." },
      { id: "shadow", label: "Shadow Run", kind: "process", description: "Mirror production traffic; compare old vs. new offline." },
      { id: "canary", label: "Canary Controller", kind: "process", description: "Stepped rollout 1→5→25→100% with per-step gates." },
      { id: "monitors", label: "Online Monitors", kind: "judge", description: "Quality, error rate, latency, refusal rate by version." },
      { id: "rollback", label: "Rollback", kind: "output", description: "Repins prior version on threshold breach." },
    ],
    edges: [
      { from: "pr", to: "offline", label: "trigger" },
      { from: "offline", to: "registry", label: "artifact + report" },
      { from: "registry", to: "shadow", label: "deploy mirrored" },
      { from: "shadow", to: "monitors", label: "scores" },
      { from: "monitors", to: "canary", label: "promote" },
      { from: "canary", to: "monitors", label: "live %" },
      { from: "monitors", to: "rollback", label: "threshold" },
    ],
    walkthrough: [
      {
        heading: "1. Offline gates",
        body:
          "PR runs the full eval set with statistical comparison vs. production baseline. Gates: zero safety regression, no slice down >2σ, headline not down at p<0.05. PR is blocked otherwise; gates can be force-overridden with a recorded justification (counted in monthly release-quality KPIs).",
      },
      {
        heading: "2. Shadow validation",
        body:
          "After offline pass, the artifact deploys in shadow: a copy of production traffic is sent to both old and new versions, both responses are logged and judged, but only the old response is returned to users. Shadow runs for at least 1 hour or 10k requests. Online judge mean must not regress at p<0.01 to proceed.",
      },
      {
        heading: "3. Canary",
        body:
          "Canary controller routes 1% → 5% → 25% → 100% traffic, with each step held for ≥30 minutes. At every step we check: error rate, latency p95, online quality score, refusal rate, and a curated 'safety canary' set sampled live. Any threshold breach pins traffic and pages.",
      },
      {
        heading: "4. Audit and registry",
        body:
          "Every artifact (prompt SHA, model version, tool schema hash) lands in the registry with offline eval report, shadow scores, canary decisions, and final state. Compliance and post-mortems work directly off this registry; nothing is reconstructed from logs.",
      },
    ],
    tradeoffs: [
      {
        decision: "Shadow before any canary",
        chose: "Mandatory shadow",
        over: "Skip-shadow for low-risk changes",
        because: "Offline evals miss real-traffic distribution; shadow is the cheapest way to surface those gaps without users seeing them.",
      },
      {
        decision: "Force-override is allowed but counted",
        chose: "Audited override",
        over: "Hard block",
        because: "Hard blocks invite branch tricks; audited overrides preserve velocity while making misuse visible at the org level.",
      },
    ],
    metrics: [
      "PR merge → 100% rollout p50/p95",
      "Override rate per team per month",
      "Auto-rollback fire rate (and time-to-mitigate)",
      "Shadow-detected regressions per quarter",
    ],
  },
];

export function getDesign(slug: string): SystemDesign | undefined {
  return designs.find((d) => d.slug === slug);
}
