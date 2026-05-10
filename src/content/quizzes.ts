export type QuizQuestion = {
  id: string;
  prompt: string;
  options: { id: string; label: string; correct?: boolean }[];
  explanation: string;
};

export type Quiz = {
  slug: string;
  title: string;
  tagline: string;
  level: "Foundations" | "Intermediate" | "Advanced";
  estMinutes: number;
  questions: QuizQuestion[];
};

export const quizzes: Quiz[] = [
  {
    slug: "foundations",
    title: "Foundations of QA for AI",
    tagline: "Mental models, definitions, and the seven-layer taxonomy.",
    level: "Foundations",
    estMinutes: 5,
    questions: [
      {
        id: "q1",
        prompt:
          "You add a new prompt revision and the eval pass rate drops from 86% to 83% on a 50-case set. The team's standard deviation across re-runs is ~4 points. What's the right call?",
        options: [
          { id: "a", label: "Block the merge — clear regression." },
          {
            id: "b",
            label:
              "Don't block — the drop is within noise; expand to a larger case set or run more samples before deciding.",
            correct: true,
          },
          { id: "c", label: "Merge and monitor — 3 points doesn't matter." },
          { id: "d", label: "Roll back the previous release." },
        ],
        explanation:
          "With ~4-point variance, a 3-point delta on 50 cases is well within noise. The fix is more data (cases or samples), not a binary call on noisy signal. This is exactly why eval gates use paired bootstrap CIs, not raw deltas.",
      },
      {
        id: "q2",
        prompt: "Which is NOT a typical bias of LLM-as-judge?",
        options: [
          { id: "a", label: "Position bias (preferring the first option)." },
          { id: "b", label: "Verbosity bias (longer = better)." },
          { id: "c", label: "Self-preference (preferring outputs from the same model family)." },
          {
            id: "d",
            label: "Determinism bias (always producing the same score for the same input).",
            correct: true,
          },
        ],
        explanation:
          "LLM judges are *not* deterministic — that's the problem, not a bias. Position, verbosity, and self-preference biases are all well-documented in the literature.",
      },
      {
        id: "q3",
        prompt:
          "Your eval set is 30 hand-picked edge cases from team intuition. Pass rate is 90%. What's the most important next step?",
        options: [
          { id: "a", label: "Push for 95% pass rate by tweaking prompts." },
          {
            id: "b",
            label:
              "Add cases sampled from production traffic and bug reports — handpicked sets miss the long tail and overweight team biases.",
            correct: true,
          },
          { id: "c", label: "Switch to a different model." },
          { id: "d", label: "Add more handpicked cases until 100." },
        ],
        explanation:
          "Handpicked sets are a fine starting point and a terrible endpoint. Production traces and bug reports are how you discover the failure modes you didn't predict.",
      },
      {
        id: "q4",
        prompt: "Which sentence best captures the difference between groundedness and faithfulness in RAG eval?",
        options: [
          {
            id: "a",
            label:
              "Groundedness = every claim is supported by context; faithfulness = the answer doesn't contradict context. Both are needed.",
            correct: true,
          },
          { id: "b", label: "They mean the same thing." },
          { id: "c", label: "Groundedness is about the question; faithfulness is about the docs." },
          { id: "d", label: "Faithfulness is a subset of answer relevance." },
        ],
        explanation:
          "An answer can be faithful (no contradiction) but ungrounded (claims that aren't in the context — invented even if not contradicted). Both metrics are necessary.",
      },
      {
        id: "q5",
        prompt:
          "You're evaluating a tool-using agent. Final-task success rate is 85%. What's a critical signal you're probably missing?",
        options: [
          { id: "a", label: "Nothing — final-task success is the right metric." },
          {
            id: "b",
            label:
              "Trajectory metrics: tool-selection accuracy, step efficiency, recovery from tool errors, loop detection.",
            correct: true,
          },
          { id: "c", label: "User satisfaction surveys." },
          { id: "d", label: "Total token cost." },
        ],
        explanation:
          "Outcome-only evals can hide unsafe or inefficient trajectories that happen to land on the right answer. For agents, score the trace.",
      },
    ],
  },
  {
    slug: "evals-and-scoring",
    title: "Evals, judges, and statistical sanity",
    tagline: "Designing scoring that detects regressions you'd care about.",
    level: "Intermediate",
    estMinutes: 6,
    questions: [
      {
        id: "q1",
        prompt:
          "You have 200 eval cases and run n=1 sample each. You report mean = 0.78 and want to detect a 2-point regression. What's the issue?",
        options: [
          {
            id: "a",
            label:
              "n=1 underestimates variance. Use n≥3, report mean ± stderr, and use paired bootstrap vs. baseline.",
            correct: true,
          },
          { id: "b", label: "200 cases is too many — start smaller." },
          { id: "c", label: "Mean is the wrong statistic — use median." },
          { id: "d", label: "No issue; report and ship." },
        ],
        explanation:
          "Single-sample evals hide intra-case variance; you'll get false alarms and miss real regressions. n≥3 with paired bootstrap is the floor for usable signal.",
      },
      {
        id: "q2",
        prompt: "Which judge prompt design is MOST robust against verbosity bias?",
        options: [
          { id: "a", label: "Score on a 1–10 scale, holistic." },
          {
            id: "b",
            label:
              "Score one criterion at a time with a binary rubric; require evidence quotes; randomize order; and use a stronger model than the SUT.",
            correct: true,
          },
          { id: "c", label: "Just compare two outputs and pick the better one." },
          { id: "d", label: "Use a smaller, faster judge to save cost." },
        ],
        explanation:
          "Per-criterion binary scoring + evidence quotes constrains the judge; randomization neutralizes position bias; a stronger model reduces self-preference and noise.",
      },
      {
        id: "q3",
        prompt:
          "Your judge agreement with humans is Cohen's κ = 0.42. What does this mean and what should you do?",
        options: [
          { id: "a", label: "Excellent agreement — proceed." },
          {
            id: "b",
            label:
              "Moderate agreement at best; the judge is noisy. Refine the prompt, add evidence requirements, or upgrade the judge model before relying on its scores.",
            correct: true,
          },
          { id: "c", label: "κ doesn't apply to LLM judges." },
          { id: "d", label: "Use raw accuracy instead of κ." },
        ],
        explanation:
          "κ around 0.4 is moderate. Below ~0.6 the judge is not trustworthy enough to gate releases on; calibration is required before relying on it.",
      },
      {
        id: "q4",
        prompt: "Which is the strongest argument for using rubrics over golden outputs in open-ended generation?",
        options: [
          {
            id: "a",
            label:
              "Rubrics survive prompt and style changes; goldens require constant maintenance and reward verbatim matching over correctness.",
            correct: true,
          },
          { id: "b", label: "Rubrics are easier to write." },
          { id: "c", label: "Goldens require more cases." },
          { id: "d", label: "Rubrics are cheaper to score." },
        ],
        explanation:
          "Goldens calcify your prompt; the moment you rephrase, half of them break for cosmetic reasons. Rubrics encode the actual quality criteria.",
      },
    ],
  },
  {
    slug: "production-and-frontier",
    title: "Production, drift, and frontier topics",
    tagline: "Online quality, drift detection, and what's hard in 2026.",
    level: "Advanced",
    estMinutes: 6,
    questions: [
      {
        id: "q1",
        prompt:
          "You ship a new prompt. Offline evals look good. 4 hours later, online judge quality has dropped 6%. Errors are flat. What's most likely?",
        options: [
          {
            id: "a",
            label:
              "Distribution mismatch — offline cases don't reflect live traffic. Trigger triage, capture failing slices, add to eval set, consider rollback.",
            correct: true,
          },
          { id: "b", label: "The judge is broken — ignore." },
          { id: "c", label: "Users are doing something wrong." },
          { id: "d", label: "Wait 24 more hours before acting." },
        ],
        explanation:
          "Offline-to-online divergence almost always means the live distribution differs from your eval set. The fix is to capture the failing slice and update evals — and roll back if user impact is material.",
      },
      {
        id: "q2",
        prompt: "Which is the BEST input to a self-improving eval pipeline?",
        options: [
          { id: "a", label: "Synthetic cases generated by the same model that's being graded." },
          {
            id: "b",
            label:
              "Production traces clustered into failure-mode buckets, with held-out human labels to validate any auto-generated rubrics.",
            correct: true,
          },
          { id: "c", label: "Random prompts from the internet." },
          { id: "d", label: "More handcrafted edge cases." },
        ],
        explanation:
          "Self-improvement works when the loop is grounded in real production failures and validated by humans on a held-out set. Otherwise the model writes the test it can pass.",
      },
      {
        id: "q3",
        prompt:
          "For a computer-use agent eval, what's the most important infrastructure investment?",
        options: [
          { id: "a", label: "Faster GPUs." },
          {
            id: "b",
            label:
              "Snapshot-restore containerized environments so every run starts in an identical state.",
            correct: true,
          },
          { id: "c", label: "More eval cases." },
          { id: "d", label: "A bigger judge model." },
        ],
        explanation:
          "Long-horizon agent evals are useless without determinism. Snapshot-restore is what makes 'did the change cause this?' answerable.",
      },
    ],
  },
];

export function getQuiz(slug: string): Quiz | undefined {
  return quizzes.find((q) => q.slug === slug);
}
