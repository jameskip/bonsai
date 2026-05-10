export type BlogSection = {
  heading: string;
  body: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  dek: string;
  date: string;
  readMinutes: number;
  tags: string[];
  author: {
    name: string;
    handle: string;
    bio: string;
  };
  intro: string;
  sections: BlogSection[];
  closing?: string;
};

const author = {
  name: "James Kip",
  handle: "jameskip",
  bio: "Writes about evaluating AI systems in production. Builder of Bonsai.",
};

export const posts: BlogPost[] = [
  {
    slug: "the-eval-set-is-the-product",
    title: "The eval set is the product",
    dek: "Models swap. Prompts get rewritten. Harnesses get rebuilt. The eval set is the only artifact that compounds. Most teams treat it like test infrastructure — and pay for it twice.",
    date: "2026-05-04",
    readMinutes: 7,
    tags: ["evals", "strategy", "thought-leadership"],
    author,
    intro:
      "Walk into any AI team and ask what their most important asset is. You will hear: the model. Or the prompt. Or, on a self-aware day, the data. You will almost never hear: *the eval set*. That answer is wrong, and the cost of being wrong about it is the single biggest reason AI products plateau six months after launch.",
    sections: [
      {
        heading: "What actually persists",
        body:
          "Look at what survives a year on an AI team. The model you picked? Replaced — usually twice. The prompts? Rewritten when the model changed, then again when product scope shifted. The harness? Rebuilt the moment you outgrew the notebook. The retrieval index? Re-embedded on the new model. Even the team rotates.\n\nThe eval set is the only artifact that survives all of that. It encodes the question your product is actually trying to answer: *what does good look like, in our domain, for our users, on the cases that matter*. Everything else is implementation.\n\nThis is the inversion most teams miss. The model is the cheap, swappable layer. The eval set is the expensive, irreplaceable one. We have it backwards in our heads because the model is what we *pay for* and the eval set is what we *build*. Cost is not the same as value.",
      },
      {
        heading: "The eval set predicts the next model",
        body:
          "The clearest test of whether a team treats evals as product or as infrastructure: how long does it take you to evaluate a new frontier model on your domain?\n\nFor a team that treats the eval set as the product, the answer is **a Tuesday afternoon**. They have stable scoring, calibrated judges, a dataset that reflects their real workload, and a baseline they trust. New model lands? Run it through, read the deltas, decide.\n\nFor a team that treats evals as infrastructure, the answer is **a quarter**. They have to remember which prompts worked, hand-run a few examples, argue about whether vibes-based regressions count, and eventually ship the new model because the CEO read a tweet about it. They are not evaluating models. They are betting on them.\n\nThe difference is not engineering talent. It is whether the team treats the eval set as a thing they own and improve, or a thing that sometimes gets touched.",
      },
      {
        heading: "Three signs you've inverted it",
        body:
          "1) **Your eval set is shorter than your prompt.** This is more common than you would think. Teams will iterate on a 2,000-token prompt for weeks while their 'eval suite' is twelve hand-picked examples a PM wrote in a Google Doc.\n\n2) **You can't tell me which cases regressed.** When a number moves, can you point to the specific examples that flipped? If the answer is 'we'll have to look,' you are flying on aggregate metrics — which is fine for dashboards and useless for shipping decisions.\n\n3) **Triage doesn't feed back.** Production failures get a Slack thread, maybe a postmortem. They do not get added to the eval set as permanent regression cases. The eval set is frozen in time at whatever vibe the team had when they wrote it, while the product moves on.",
      },
      {
        heading: "What changes when you flip it",
        body:
          "When the eval set is the product, the priorities reshuffle. You spend engineering cycles on it the way you spend them on user-facing features. You staff it. You version it. You write deprecation notices when you remove cases. You argue about coverage the way other teams argue about test coverage — because that is what it is.\n\nThe payoff: every model release becomes free leverage. Every prompt rewrite becomes a measurable, defensible decision. Every regression caught is a permanent inoculation. The team's velocity stops being bottlenecked by 'does this feel better?' meetings, because the eval set answers that question in minutes instead of weeks.\n\nThis is not a tooling argument. You can do it with a CSV and a script. It is a *seriousness* argument. You either treat the artifact that compounds as the most important thing you own, or you do not.",
      },
      {
        heading: "How to start, on a Monday",
        body:
          "Pick the last ten production incidents where the AI behaved badly. Add them to your eval set as named cases, with the expected behavior written down. That is your starting kernel.\n\nNow set a rule: **no AI feature ships without adding at least three new cases to the eval set**. Most teams refuse to do this because it slows them down. That is the point. You are not slowing down shipping; you are slowing down *forgetting*. The team that remembers more wins more.\n\nIn six months, the eval set will be the artifact people fight to maintain access to. In a year, it will be the thing recruiters mention when a senior IC interviews. In two years, it will be the moat.",
      },
    ],
    closing:
      "The model is rented. The prompts are temporary. The eval set is the only thing your team is actually building. Treat it that way.",
  },
  {
    slug: "your-llm-judge-is-lying-quietly",
    title: "Your LLM judge is lying to you (quietly, on a schedule)",
    dek: "LLM-as-judge is the most cost-effective scoring tool in AI quality work. It is also the most common source of false confidence. Here are the four ways it deceives you, and the calibration cadence almost no team runs.",
    date: "2026-04-18",
    readMinutes: 9,
    tags: ["llm-as-judge", "calibration", "evals"],
    author,
    intro:
      "Every team I talk to that has 'gone serious' on AI quality has, somewhere, a dashboard with a green number on it. The number is from an LLM judge. The judge is grading the team's outputs against a rubric. The number is going up over time. The team is celebrating.\n\nMost of those numbers are decorative.\n\nThis is not a critique of LLM-as-judge as a technique — it is the most cost-effective scoring tool we have, and there is no replacement on the horizon. It is a critique of how teams *deploy* it: as a fire-and-forget oracle rather than a measurement instrument that needs calibration the same way a thermometer does.",
    sections: [
      {
        heading: "Bias one: position",
        body:
          "Show a judge model two responses, A and B, and ask which is better. Many models — including current frontier ones — pick A more often than chance. The bias is small, often single-digit percentage points, but it is real and it does not go away with prompting alone.\n\nThe practical consequence: any pairwise eval that always puts the new variant in the same slot will systematically over- or under-rate it. Teams discover this when they swap A and B and the result flips. By then the team has already shipped on the original ordering.\n\nFix: randomize position per example, and *check* that you are randomizing. Audit a sample of your judge calls. I have seen at least three teams whose 'random' position was deterministic in a way nobody noticed until I asked.",
      },
      {
        heading: "Bias two: length",
        body:
          "Judges reward longer outputs. Not always, not on every rubric, but often enough to matter. The mechanism is plausible: longer outputs feel more thorough, more careful, more 'tried.' The mechanism is also wrong — many of the best outputs in real product work are *shorter* than the alternatives, because brevity is a feature.\n\nIf you are not measuring the correlation between output length and judge score, you are not measuring quality. You are measuring length, plus noise.\n\nFix: log output length alongside the score. Compute the correlation per rubric dimension. If the correlation is high and length is not actually a quality dimension you care about, your judge is broken. The fastest mitigation is to include a length-controlled comparison in the rubric or to grade pairs of outputs that have been length-matched.",
      },
      {
        heading: "Bias three: verbosity in the input",
        body:
          "Different from output length: this is the bias that judges show when the *input being judged* is verbose. Long, hedge-filled, qualifier-heavy responses get rated as more careful. Confident, terse responses get rated as 'underdeveloped.'\n\nThis one is dangerous because it points at the wrong work. Teams notice their judge prefers verbose outputs and start prompting their main model to be more verbose, which makes the product worse and the judge happier. The dashboard goes up. Users complain more. Nobody connects the two for two quarters.",
      },
      {
        heading: "Bias four: model-affinity",
        body:
          "Judges score outputs from their own model family higher. A Claude judge mildly prefers Claude outputs. A GPT judge mildly prefers GPT outputs. The bias is small per-example and devastating in aggregate when you are evaluating a model swap.\n\nThis is the bias that ends careers. A team running a judge from family X decides whether to switch their main model from family X to family Y. The judge says no. The team stays on X. Six months later a competitor on Y has shipped past them, and nobody can explain it because the eval said the swap would be neutral.\n\nFix: never use a judge from the same family as either model in a swap evaluation. If you must, use two judges from different families and require agreement.",
      },
      {
        heading: "Why human agreement is not calibration",
        body:
          "Most teams' calibration story is: 'we hand-graded a hundred examples, the judge agreed with us 78% of the time, ship it.' That is a *snapshot* of agreement at one point in time on one slice of inputs. It is not calibration.\n\nReal calibration looks like: agreement at *each score level*, broken out by relevant slices, recomputed on a cadence, with thresholds for when to recalibrate the rubric. A judge that agrees with humans 95% on the easy cases and 40% on the cases that matter is, on average, agreeing 78% — and is useless.\n\nThe minimum cadence I would defend in front of a skeptic: every model version, every rubric change, every quarter, and any time the judge's score distribution shifts more than a few points without a clear cause.",
      },
      {
        heading: "The thing nobody tells you",
        body:
          "Judge models drift independently of your product. The judge provider releases a new model snapshot. The judge's defaults change. The judge's calibration on your rubric quietly moves. Your dashboard goes up or down by a few points, and there is no change in your product, your prompt, your data, or your model. The signal is contamination from the measurement instrument.\n\nIf your judge is pinned to a model version, this is mostly a non-issue — until you have to upgrade the judge for cost or capability reasons, and you are now comparing scores across two different judges as if they were the same number. They are not.\n\nThe defense is the same as for any scientific instrument: pin the version, recalibrate when you change it, and never compare scores across judge versions without a translation table built from a shared calibration set.",
      },
    ],
    closing:
      "LLM-as-judge is not the problem. *Treating it as an oracle instead of an instrument* is the problem. The teams that win at AI quality are the ones who put the judge under the same scrutiny as the thing being judged.",
  },
  {
    slug: "triage-is-the-eval-loop",
    title: "Triage is the eval loop",
    dek: "Every AI team draws the diagram: production failures flow back into the eval set, the eval set drives the next release. Almost no team actually runs that loop. Here is why it rots, and the three rituals that keep it alive.",
    date: "2026-03-29",
    readMinutes: 8,
    tags: ["operations", "evals", "production"],
    author,
    intro:
      "The first time I saw the loop drawn on a whiteboard, I thought it was obvious and unremarkable. Production runs. Some outputs are bad. Triage looks at the bad ones. The interesting ones become eval cases. The eval set drives the next release. Repeat. Of course. What else would you do?\n\nFour years later, I have audited that loop at maybe forty companies. Two of them are running it.\n\nThe diagram is everywhere. The loop almost never closes. And the gap between 'we have the diagram' and 'the loop actually closes' is, in my experience, the single largest determinant of whether an AI team's quality improves over time or plateaus.",
    sections: [
      {
        heading: "Why triage rots first",
        body:
          "Of all the work in the loop, triage is the most fragile. It is reactive, not roadmap-driven. It does not have a launch date. It does not have a metric anyone presents at all-hands. It looks like *operations*, in a culture that rewards *features*.\n\nSo it gets squeezed. The first quarter, triage is a Friday afternoon ritual with the whole team. By the second quarter, it is a single owner. By the third, that owner is on parental leave and nobody covered. By the fourth, the triage queue has 4,000 unreviewed traces and the team has tacitly agreed to pretend it does not exist.\n\nMeanwhile, production drifts. New failure modes appear. Old ones return. The eval set, frozen at whatever the team's vibe was twelve months ago, no longer reflects the product. The dashboard still goes up, because the eval set is now measuring a problem the product no longer has.",
      },
      {
        heading: "The diagram everyone draws and nobody runs",
        body:
          "Here is what the loop is supposed to do: every shipped failure becomes a permanent regression test, so that the second time it happens it is caught before users see it. This is the *only* mechanism by which an eval set gets *better* rather than just *bigger*. Without it, the eval set is a snapshot of what the team thought to test on day one — useful, but it cannot keep up with reality.\n\nThe loop is the only way the eval set tracks the world. If triage is broken, the loop is broken. If the loop is broken, your evals are stale. If your evals are stale, your green dashboard is fiction.\n\nMost teams' instinct, when they realize the loop is broken, is to tool their way out of it. They buy an observability platform. They install traces. They build a Slack bot. None of that fixes triage. Triage rots because of *attention*, not tooling. You can have all the traces in the world; if no human is reading them with the question 'should this become a permanent eval case,' the loop is still open.",
      },
      {
        heading: "Ritual one: the weekly traffic-light review",
        body:
          "Forty-five minutes, same time every week, calendar-blocked, on the engineering team's calendar (not the PM's, not the data scientist's). Sample fifty production traces — stratified by feature surface, weighted toward low-confidence outputs and user-flagged ones. Three buckets: **fine**, **interesting**, **regression**. Anything in the regression bucket goes into the eval set this week, with an expected-behavior note attached. Anything interesting gets a follow-up ticket.\n\nThe ritual is short, scoped, and scheduled. The schedule is the load-bearing part. Every team I have seen succeed has *regularly scheduled triage*. Every team I have seen fail has 'we triage when it comes up.'",
      },
      {
        heading: "Ritual two: the postmortem-to-eval pipeline",
        body:
          "Every AI-related incident generates one or more concrete eval cases. Not 'we should test for this' in the action items. The actual cases, written and merged, before the postmortem is closed.\n\nThis is the cheapest, highest-leverage policy I know in this space. It costs the team thirty minutes per incident and gives them a permanent, named regression case that prevents the same class of failure from recurring silently. Without the policy, postmortems generate good intentions and nothing else.",
      },
      {
        heading: "Ritual three: the staleness audit",
        body:
          "Once a quarter, sample twenty cases from the eval set at random and ask: *is this case still representative of how users use the product today?* If the answer is no for more than a small fraction, the eval set has drifted out of sync with reality, and the team needs to refresh — not by deleting old cases, which loses regression coverage, but by adding new cases that reflect the current product surface.\n\nThis is the ritual most teams skip. They will add cases forever and never audit them. The result is an eval set that is technically large and substantively narrow — heavy on the failure modes of 2024 and silent on the failure modes of today.",
      },
      {
        heading: "Permanent regressions are the only test set that earns its keep",
        body:
          "An eval set composed of cases the team thought up in advance ages out fast. An eval set composed of cases drawn from real production failures *cannot* age out, because the world keeps generating new ones. The triage loop is the engine that converts the world's failures into your team's permanent immunity.\n\nThe teams that win at AI quality are not the teams with the most clever evals or the fanciest tools. They are the teams whose triage loop closes — every week, every postmortem, every quarter. Boring rituals. Outsized compounding.\n\nIf you only fix one thing about your AI quality program this year, fix the loop.",
      },
    ],
    closing:
      "The diagram is correct. The work is in making the diagram describe a thing your team actually does on Tuesday afternoons.",
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function postsSorted(): BlogPost[] {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}
