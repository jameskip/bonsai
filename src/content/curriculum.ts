export type LessonSection = {
  heading: string;
  body: string;
};

export type Lesson = {
  slug: string;
  title: string;
  tagline: string;
  level: "Foundations" | "Intermediate" | "Advanced" | "Frontier";
  estMinutes: number;
  topics: string[];
  intro: string;
  sections: LessonSection[];
  takeaways: string[];
  relatedLabs?: string[];
  relatedDesigns?: string[];
};

export const lessons: Lesson[] = [
  {
    slug: "what-is-qa-for-ai",
    title: "What is QA for AI?",
    tagline: "Why testing non-deterministic systems demands a new playbook.",
    level: "Foundations",
    estMinutes: 8,
    topics: ["mental-models", "non-determinism", "definitions"],
    intro:
      "Traditional QA assumes the system under test is deterministic: the same input always produces the same output. AI systems break that assumption. Outputs vary by sampling temperature, prompt phrasing, retrieval order, model version, and time of day. QA for AI is the discipline of producing reliable, defensible quality signals about systems whose outputs are probabilistic, open-ended, and continuously drifting.",
    sections: [
      {
        heading: "The four shifts from classical QA",
        body:
          "1) **From assertions to distributions.** A single pass/fail test is replaced by a measurement over a sample of generations. 2) **From oracles to judges.** There is rarely a single correct answer; we use rubrics, reference outputs, or LLM-as-judge to score. 3) **From defects to behaviors.** We catalog behaviors (refusals, hallucinations, format drift) instead of bugs. 4) **From release gates to continuous evaluation.** Models, prompts, retrieval indices, and tools change constantly — evals run on every change AND on a schedule.",
      },
      {
        heading: "What makes a good AI quality signal",
        body:
          "A useful signal is **stable** (low variance across runs), **actionable** (correlates with user-visible outcomes), **decomposable** (can attribute regression to a component: prompt, model, retrieval, tools), and **cheap enough to run on every PR**. The goal is not 100% pass rate; it is detecting *regressions you would care about* before users do.",
      },
      {
        heading: "The QA-for-AI taxonomy",
        body:
          "We group testing into seven layers: **unit prompts**, **component evals** (retriever recall, tool selection accuracy), **end-to-end evals** (task success rate), **safety and red-team**, **robustness** (perturbations, jailbreaks), **production observability** (online metrics, user feedback), and **continuous adversarial testing**. Every AI product needs all seven, just at different depths.",
      },
    ],
    takeaways: [
      "AI QA replaces single assertions with distributions and rubrics.",
      "Quality signals must be stable, actionable, and cheap.",
      "Seven layers, not one: unit → component → e2e → safety → robustness → production → adversarial.",
    ],
    relatedLabs: ["llm-as-judge"],
    relatedDesigns: ["eval-pipeline"],
  },
  {
    slug: "designing-evals",
    title: "Designing evals that actually catch regressions",
    tagline: "From vibes to a dataset that pays rent.",
    level: "Foundations",
    estMinutes: 12,
    topics: ["eval-design", "datasets", "rubrics"],
    intro:
      "Most teams start with 'vibes-based' evals — a few prompts the founder runs by hand. That's fine for week one and a liability by month three. A real eval set is a curated dataset, an explicit rubric, and a scoring function with known noise characteristics.",
    sections: [
      {
        heading: "Anatomy of an eval case",
        body:
          "Every case has: **input** (the user prompt or fixture), **context** (retrieved docs, tool state, prior turns), **expected behavior** (what good looks like — *not* a single golden string), **scoring method** (exact match, regex, embedding similarity, LLM-as-judge, programmatic check), and **metadata** (tag, severity, source — bug report, red team, synthetic). Without metadata you cannot slice or triage failures.",
      },
      {
        heading: "Where eval cases come from",
        body:
          "Five sources, in order of value: 1) **real production traces** (sampled and anonymized), 2) **bug reports and user complaints** (every escalation becomes a regression test), 3) **synthetic generation** (an LLM generates variations of known-hard cases), 4) **adversarial / red-team** (jailbreaks, prompt injection, contradictory context), 5) **handcrafted edge cases** (the team's intuition about failure modes). Most teams over-index on (5) and under-index on (1).",
      },
      {
        heading: "Rubrics over goldens",
        body:
          "Goldens (single correct outputs) work for closed-form tasks (extraction, classification). For open-ended generation, write a **rubric**: a list of criteria a good response must meet. Examples: 'cites at least one source from context', 'does not invent prices', 'maintains second-person voice', 'refuses if asked about a competitor'. Rubrics survive prompt changes; goldens don't.",
      },
      {
        heading: "Sample size and statistical power",
        body:
          "If your eval set has 30 cases and your pass rate is 80%, the 95% CI is roughly ±14 points. You cannot detect a 5-point regression. Aim for **at least 200 cases** for headline metrics and **30+ per slice** you want to track independently. Run with multiple samples per case (n=3 or n=5) and report mean ± stderr — a single sample hides variance.",
      },
    ],
    takeaways: [
      "Cases need input + context + expected behavior + scoring + metadata.",
      "Production traces and bug reports beat handcrafted edge cases.",
      "Rubrics scale; goldens break the moment the prompt changes.",
      "Aim for ≥200 cases and n≥3 samples per case for usable signal.",
    ],
    relatedLabs: ["rubric-builder", "llm-as-judge"],
    relatedDesigns: ["eval-pipeline"],
  },
  {
    slug: "llm-as-judge",
    title: "LLM-as-judge: useful, biased, calibratable",
    tagline: "Make a model grade another model — without lying to yourself.",
    level: "Intermediate",
    estMinutes: 10,
    topics: ["scoring", "judges", "calibration"],
    intro:
      "LLM-as-judge is the most cost-effective way to score open-ended generations at scale. It is also the most common source of false confidence in AI QA. The trick is to treat your judge like an unreliable contractor — measure it, calibrate it, and constrain it.",
    sections: [
      {
        heading: "Known biases of LLM judges",
        body:
          "Judges exhibit **position bias** (prefer the first option in a pairwise comparison), **verbosity bias** (longer = better), **self-preference** (a judge built on model X prefers X's outputs), **format bias** (well-formatted markdown scores higher even when wrong), and **leniency drift** (judges become more lenient as the rubric gets longer). Every judge prompt must be evaluated on a held-out set with human labels.",
      },
      {
        heading: "Building a defensible judge prompt",
        body:
          "Five rules: 1) **Force structured output** (JSON with explicit fields), 2) **Require evidence** ('quote the part of the response that violates criterion X'), 3) **Score one criterion at a time** — composite scores hide failures, 4) **Randomize order** in pairwise comparisons and average, 5) **Use a stronger model than the system under test** when feasible. A weaker judge produces noisier and more biased scores.",
      },
      {
        heading: "Calibration loop",
        body:
          "(a) Sample 100 cases. (b) Have humans label each on your rubric. (c) Run the judge. (d) Compute agreement (Cohen's κ for binary, Spearman for graded). (e) If agreement is < 0.6, the judge is not trustworthy — refine the prompt or upgrade the model. (f) Re-run quarterly because model versions drift. Without this loop, you are measuring the judge, not the system.",
      },
    ],
    takeaways: [
      "LLM judges are biased — measure agreement with human labels before trusting scores.",
      "Force structured output, require evidence, score one criterion at a time.",
      "Recalibrate quarterly; model versions drift.",
    ],
    relatedLabs: ["llm-as-judge"],
    relatedDesigns: ["eval-pipeline"],
  },
  {
    slug: "rag-evaluation",
    title: "Evaluating RAG: retrieval and generation are different problems",
    tagline: "If you grade end-to-end you'll never know what's broken.",
    level: "Intermediate",
    estMinutes: 11,
    topics: ["rag", "retrieval", "groundedness"],
    intro:
      "Retrieval-augmented generation has two failure surfaces: the retriever returns wrong docs, or the generator ignores/misuses correct docs. End-to-end metrics conflate both. A real RAG eval scores retrieval and generation separately, then jointly.",
    sections: [
      {
        heading: "Retrieval metrics that matter",
        body:
          "**Recall@k** (did the gold doc appear in top-k?) is the headline metric — if recall is low, generation is doomed. **MRR / nDCG** capture rank quality. **Context precision** (fraction of retrieved docs that are actually relevant) matters because irrelevant context distracts the generator and burns tokens. Track all three with a labeled question→docs dataset.",
      },
      {
        heading: "Groundedness, faithfulness, and answer relevance",
        body:
          "**Groundedness**: every claim in the answer is supported by the retrieved context. **Faithfulness**: the answer does not contradict the context. **Answer relevance**: the answer addresses the question (not just any true statement from the docs). All three can be scored with a structured LLM judge that takes (question, context, answer) and returns per-claim verdicts. Generate explicit per-claim citations to make this auditable.",
      },
      {
        heading: "Counterfactual and adversarial RAG tests",
        body:
          "Inject a doc that contradicts the others — does the model flag the contradiction or pick one at random? Inject an irrelevant doc — does the model still cite it? Remove the gold doc — does the model hallucinate or refuse? Inject prompt-injected content in a retrieved doc ('ignore previous instructions') — does the system detect it? These tests catch the failure modes that production RAG systems hit.",
      },
    ],
    takeaways: [
      "Score retrieval and generation separately, then jointly.",
      "Groundedness ≠ faithfulness ≠ answer relevance — track all three.",
      "Counterfactual and adversarial RAG cases catch what end-to-end metrics hide.",
    ],
    relatedDesigns: ["rag-eval-architecture"],
  },
  {
    slug: "agent-evaluation",
    title: "Agent evals: trajectories, not outcomes",
    tagline: "When the system uses tools, only grading the final answer is malpractice.",
    level: "Advanced",
    estMinutes: 13,
    topics: ["agents", "tool-use", "trajectories"],
    intro:
      "Agentic systems plan, call tools, observe results, and iterate. A correct final answer can hide an inefficient or unsafe trajectory; an incorrect final answer can come from a perfect plan that ran into a flaky tool. Outcome-only evals are insufficient.",
    sections: [
      {
        heading: "Trajectory-level metrics",
        body:
          "Score the **trace**, not just the result: tool selection accuracy (did it pick the right tool?), parameter accuracy (did it pass valid args?), step efficiency (turns to completion), recovery (did it handle a tool error?), and termination (did it stop when done — or loop?). Capture full traces (inputs, outputs, intermediate state) and run a structured judge over each step.",
      },
      {
        heading: "Failure modes unique to agents",
        body:
          "**Loop traps** (calling the same tool with the same args repeatedly), **goal drift** (the agent forgets the original task after several turns), **tool hallucination** (calling a tool that doesn't exist with the right schema), **premature commitment** (saying 'done' before validating), and **cascading errors** (one wrong subgoal contaminates everything downstream). Each needs its own targeted eval.",
      },
      {
        heading: "Sandbox vs. live evals",
        body:
          "Run trajectory evals in **sandboxed environments** with mocked tools to get cheap, deterministic, repeatable scores. Run **live evals** in a staging environment with real tools to catch integration drift. The sandbox catches regressions in reasoning; live catches regressions in the world (API changed, schema drifted, rate limits changed).",
      },
    ],
    takeaways: [
      "Score trajectories, not just final answers.",
      "Loops, goal drift, and tool hallucination are agent-specific failures — test each.",
      "Sandbox for reasoning regressions; live for integration drift.",
    ],
    relatedDesigns: ["agent-eval-harness"],
  },
  {
    slug: "red-teaming",
    title: "Red-teaming and adversarial testing",
    tagline: "If you don't break it, your users will.",
    level: "Advanced",
    estMinutes: 12,
    topics: ["red-team", "jailbreaks", "prompt-injection"],
    intro:
      "Red-teaming is structured adversarial testing: deliberately trying to make the system produce unsafe, off-policy, or incorrect outputs. Done well, it produces a regression suite that catches future failures. Done poorly, it's anecdote collection.",
    sections: [
      {
        heading: "Threat model first",
        body:
          "Before generating attacks, write down what you're defending: which user populations, which harms (PII leakage, prompt injection, harmful content, brand-off-tone, hallucinated facts, jailbreaks of safety policies). The threat model determines which attacks are in scope. A consumer chatbot and an internal coding agent have very different threat models.",
      },
      {
        heading: "Attack taxonomy",
        body:
          "**Direct prompt injection** ('ignore previous instructions'). **Indirect injection** (malicious content in retrieved or pasted material). **Jailbreaks** (role-play, encoding, hypothetical framings). **Data exfiltration** (extracting system prompts or user data). **Tool abuse** (tricking an agent into harmful tool calls). **Bias probing** (eliciting biased outputs across demographic axes). For each, build a labeled corpus and track pass-rate per release.",
      },
      {
        heading: "Automated red teams",
        body:
          "Run another LLM as the attacker. Give it a goal ('extract the system prompt') and a budget (10 turns), and let it iterate. Capture every successful attack as a regression case. Combine with **mutation testing** — take known attacks and ask an LLM to generate 100 variations. The point is to make red-teaming a continuous, automated input to the eval set, not a quarterly fire drill.",
      },
    ],
    takeaways: [
      "Threat model before attacks — scope determines coverage.",
      "Six attack classes: direct/indirect injection, jailbreaks, exfiltration, tool abuse, bias.",
      "Successful attacks are gold — they become regression tests forever.",
    ],
    relatedLabs: ["prompt-injection-lab"],
  },
  {
    slug: "drift-and-observability",
    title: "Drift, observability, and the production loop",
    tagline: "Pre-launch evals are necessary; production telemetry is sufficient.",
    level: "Advanced",
    estMinutes: 11,
    topics: ["observability", "drift", "production"],
    intro:
      "An eval set is a snapshot. Production is a stream. The job of production observability is to detect when the live distribution of inputs, outputs, or quality drifts from what your eval set covers — and to feed that signal back into evals.",
    sections: [
      {
        heading: "What to log",
        body:
          "For every request: prompt, model, tools called, retrieval results, response, latency, tokens, user feedback (thumbs, edits, abandonment), and a derived **online quality score** (a cheap LLM judge or heuristic). Tag with deployment version. Without per-request quality scoring you can only react to user complaints; with it, you can detect regressions in hours.",
      },
      {
        heading: "Detecting drift",
        body:
          "**Input drift**: the embedding distribution of incoming prompts shifts (new use cases). **Output drift**: response length, refusal rate, or format distribution changes. **Quality drift**: online judge scores trend down. Use simple population stability index (PSI) or KL divergence on weekly windows. Alert on shifts > 0.2 PSI on key metrics, and route the drifting slice into a triage queue.",
      },
      {
        heading: "The eval flywheel",
        body:
          "Production drift → triage queue → human label sample → new eval cases → fix prompt/model/retrieval → re-eval → deploy. The flywheel is the entire point — each user complaint becomes a permanent regression test. Teams that don't close this loop ship the same bug every six weeks.",
      },
    ],
    takeaways: [
      "Log every request with quality score, version, and feedback.",
      "Detect input, output, and quality drift on weekly windows.",
      "Close the loop: prod failure → labeled case → permanent eval.",
    ],
    relatedDesigns: ["observability-stack"],
  },
  {
    slug: "ci-for-prompts",
    title: "CI for prompts, models, and tools",
    tagline: "Treat prompts like code — but accept that the build is probabilistic.",
    level: "Intermediate",
    estMinutes: 9,
    topics: ["ci", "release", "promotion"],
    intro:
      "Prompts, model versions, retrieval indices, and tool schemas are all artifacts that need versioning, review, testing, and gradual rollout. The hard part: your test results are noisy, so a binary pass/fail gate doesn't work.",
    sections: [
      {
        heading: "What goes through CI",
        body:
          "Any change that can affect outputs: prompt edits, model version bumps, retrieval index rebuilds, tool schema changes, eval set updates. Each PR runs the eval suite at n=3 samples and reports **delta vs. baseline** (current production), not absolute scores. Reviewers see: which slices regressed, which improved, which moved within noise.",
      },
      {
        heading: "Promotion gates that respect noise",
        body:
          "Don't gate on 'pass rate > 0.9'. Gate on 'no slice regressed by more than 2σ'. Use the eval's known variance (computed from N samples on baseline) to size the regression threshold. For headline metrics, require **statistical significance** (paired bootstrap CI excludes zero) before declaring an improvement. For safety metrics, require **zero regression** on a curated red-team set.",
      },
      {
        heading: "Shadow and canary",
        body:
          "Before flipping the production prompt, run **shadow mode**: send a fraction of production traffic through both old and new, log both, judge both, compare online quality. Then **canary**: route 1% → 5% → 25% → 100% over hours/days, watching online quality and error rates. Auto-rollback on threshold breach. This catches regressions that offline evals miss.",
      },
    ],
    takeaways: [
      "Every prompt/model/tool change runs the eval suite — report deltas, not absolutes.",
      "Gates respect statistical noise: paired CIs and per-slice thresholds.",
      "Shadow → canary → full rollout, with auto-rollback on online quality drop.",
    ],
    relatedDesigns: ["ci-architecture"],
  },
  {
    slug: "frontier-topics",
    title: "Frontier topics: multi-modal, long-horizon, self-improving evals",
    tagline: "Where the field is heading in 2026 and beyond.",
    level: "Frontier",
    estMinutes: 14,
    topics: ["multimodal", "long-horizon", "self-improving"],
    intro:
      "The QA-for-AI playbook is being rewritten as systems become multi-modal, take longer-horizon actions, and increasingly evaluate themselves. This lesson surveys the unsolved problems and the techniques that are working in 2026.",
    sections: [
      {
        heading: "Multi-modal evals",
        body:
          "Image, audio, video, and document inputs add failure modes (visual hallucination, OCR errors, modality bleed-through where the model ignores the image). Evals need: **per-modality fixtures** (image+caption pairs, document+question pairs, audio+transcript pairs), **modality-specific judges** (vision-LMs to grade vision tasks), and **cross-modal consistency tests** (does the model give the same answer when the same content arrives as text, image of text, or PDF?).",
      },
      {
        heading: "Long-horizon and computer-use evals",
        body:
          "Computer-use agents perform tasks over hundreds of steps in a real OS or browser. Evals require **task suites** (e.g., WebArena, OSWorld), **deterministic environments** (containerized, snapshot-restore between runs), **per-step trajectory scoring**, and **human-in-the-loop** for tasks where automated grading is infeasible. The grading cost is the bottleneck — expect to spend more on eval infrastructure than on model serving.",
      },
      {
        heading: "Self-improving evals",
        body:
          "Recent work uses LLMs to **discover failure modes** (cluster production traces, propose hypotheses, generate targeted attacks), **synthesize eval cases** from natural-language descriptions of behaviors, and **iteratively refine rubrics** based on human disagreements. The risk: the same model writes the eval and is graded by it — actively guard against this with held-out human labels.",
      },
      {
        heading: "Open problems",
        body:
          "1) **Eval contamination** — public benchmarks leak into training data. 2) **Composability** — combining a 95% retriever with a 95% generator does not yield a 95% system; we lack good models of error propagation. 3) **User-experienced quality** — offline evals correlate weakly with engagement and trust; we need cheap online judges. 4) **Long-tail safety** — rare-but-catastrophic failures dominate risk but are statistically invisible in random samples. The frontier is solving these.",
      },
    ],
    takeaways: [
      "Multi-modal needs per-modality fixtures, modality-specific judges, and cross-modal consistency tests.",
      "Long-horizon evals are bottlenecked by deterministic environments and trajectory grading.",
      "Self-improving eval pipelines are powerful but require human-labeled checks to avoid model-judging-itself.",
      "Open problems: contamination, composability, online quality, long-tail safety.",
    ],
    relatedDesigns: ["agent-eval-harness", "observability-stack"],
  },
];

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}
