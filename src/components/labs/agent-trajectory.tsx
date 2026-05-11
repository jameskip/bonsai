"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UsageStrip, type UsageInfo } from "@/components/usage-strip";
import { apiKeyHeader } from "@/lib/api-key";

type Step = {
  index: number;
  tool: string;
  args: string;
  observation: string;
};

type Scenario = {
  id: string;
  label: string;
  seededFailures: string[];
  task: string;
  steps: Step[];
  finalAnswer: string;
};

type Dimension = "tool_selection" | "step_efficiency" | "grounding_in_trace";

type Verdict = {
  dimension: Dimension;
  verdict: "pass" | "fail";
  step_indices: number[];
  evidence: string;
  reasoning: string;
};

type TrajectoryResult = {
  result: { overall_pass_rate: number; verdicts: Verdict[] };
  usage: UsageInfo;
  stop_reason?: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "refund-redundant",
    label: "Customer support — redundant calls",
    seededFailures: ["step_efficiency"],
    task: "A customer asks: 'I want a refund for order #A-4471, it arrived broken.' Look up the order, check the refund eligibility, and confirm the refund.",
    steps: [
      {
        index: 1,
        tool: "lookup_order",
        args: '{"order_id": "A-4471"}',
        observation:
          '{"order_id":"A-4471","customer":"jess@example.com","total":48.0,"status":"delivered","delivered_at":"2026-05-04"}',
      },
      {
        index: 2,
        tool: "lookup_order",
        args: '{"order_id": "A-4471"}',
        observation:
          '{"order_id":"A-4471","customer":"jess@example.com","total":48.0,"status":"delivered","delivered_at":"2026-05-04"}',
      },
      {
        index: 3,
        tool: "check_refund_eligibility",
        args: '{"order_id": "A-4471", "reason": "damaged"}',
        observation:
          '{"eligible":true,"window_days_remaining":24,"policy":"damaged_on_arrival"}',
      },
      {
        index: 4,
        tool: "lookup_order",
        args: '{"order_id": "A-4471"}',
        observation:
          '{"order_id":"A-4471","customer":"jess@example.com","total":48.0,"status":"delivered","delivered_at":"2026-05-04"}',
      },
      {
        index: 5,
        tool: "issue_refund",
        args: '{"order_id": "A-4471", "amount": 48.0, "reason": "damaged_on_arrival"}',
        observation: '{"refund_id":"R-90213","status":"processed","amount":48.0}',
      },
    ],
    finalAnswer:
      "I've issued a full $48.00 refund for order A-4471 (refund ID R-90213). You should see it back on your original payment method within 5–7 business days. Sorry it arrived damaged!",
  },
  {
    id: "research-hallucinated",
    label: "Research — hallucinated observation",
    seededFailures: ["grounding_in_trace"],
    task: "Find the current CEO of Patagonia and one recent public statement they've made about supply chain transparency.",
    steps: [
      {
        index: 1,
        tool: "web_search",
        args: '{"query": "Patagonia CEO 2026"}',
        observation:
          "Top result: 'Patagonia announces leadership transition' (corp.patagonia.com, Jan 2026). Snippet: 'Ryan Gellert continues as CEO, with Beth Thoren expanding her role as Director of Environmental Action.'",
      },
      {
        index: 2,
        tool: "web_search",
        args: '{"query": "Ryan Gellert supply chain transparency statement"}',
        observation:
          "Top result: 'Patagonia Q1 2026 environmental update' (corp.patagonia.com). Snippet: 'Our 1% for the Planet contributions exceeded $15M last fiscal year.' No supply chain quote in snippet.",
      },
    ],
    finalAnswer:
      'The current CEO of Patagonia is Ryan Gellert. In a March 2026 interview with the Financial Times, Gellert said: "Until every tier of our supply chain is publicly auditable, the word ‘sustainable’ is marketing, not engineering." He has been outspoken on traceability since taking the role in 2020.',
  },
  {
    id: "debug-wrong-tool",
    label: "Code debug — wrong tool",
    seededFailures: ["tool_selection"],
    task: "A user pasted a Python stack trace ending in 'TypeError: unsupported operand type(s) for +: int and str'. They asked: 'What's wrong with my code?'",
    steps: [
      {
        index: 1,
        tool: "run_python",
        args:
          '{"code": "total = 0\\nfor row in rows:\\n    total = total + row[\\"price\\"]"}',
        observation:
          'NameError: name \'rows\' is not defined. Traceback (most recent call last): ...',
      },
      {
        index: 2,
        tool: "web_search",
        args: '{"query": "python TypeError unsupported operand int str"}',
        observation:
          "Stack Overflow: top answer explains the error happens when concatenating int and str without conversion. Fix: wrap with int() or str() depending on intent.",
      },
      {
        index: 3,
        tool: "run_python",
        args:
          '{"code": "total = 0\\nrows = [{\\"price\\": \\"12\\"}, {\\"price\\": \\"8\\"}]\\nfor row in rows:\\n    total = total + row[\\"price\\"]"}',
        observation:
          'TypeError: unsupported operand type(s) for +: \'int\' and \'str\'',
      },
    ],
    finalAnswer:
      "Your row['price'] values are strings, not numbers, so `total + row['price']` tries to add an int to a str. Either cast at read time (`total + int(row['price'])`) or fix the upstream parsing so prices come in as numbers. The web search and the second run both confirmed the same root cause.",
  },
  {
    id: "clean-baseline",
    label: "Clean baseline (no seeded failure)",
    seededFailures: [],
    task: "Given a customer asks 'How many days until my next billing cycle?', look up their account and answer.",
    steps: [
      {
        index: 1,
        tool: "lookup_account",
        args: '{"email": "alex@example.com"}',
        observation:
          '{"plan":"pro","next_billing_date":"2026-05-22","amount":29.0}',
      },
      {
        index: 2,
        tool: "get_today",
        args: "{}",
        observation: '{"today":"2026-05-10"}',
      },
    ],
    finalAnswer:
      "Your next billing cycle starts on 2026-05-22 — that's 12 days from today. You'll be charged $29.00 for your Pro plan.",
  },
];

export function AgentTrajectoryLab() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<TrajectoryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function critique() {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/anthropic/trajectory", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...apiKeyHeader() },
        body: JSON.stringify({
          task: scenario.task,
          steps: scenario.steps,
          final_answer: scenario.finalAnswer,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Trajectory call failed.");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Trajectory call failed.");
    } finally {
      setRunning(false);
    }
  }

  function pickScenario(id: string) {
    setScenarioId(id);
    setResult(null);
    setError(null);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Pick a scenario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => pickScenario(s.id)}
                className={`text-left rounded-md border p-3 transition-colors ${
                  s.id === scenarioId
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted/30 hover:border-primary/40"
                }`}
              >
                <div className="text-sm font-medium text-foreground">{s.label}</div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  seeded failure:{" "}
                  {s.seededFailures.length === 0 ? "none" : s.seededFailures.join(", ")}
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Each scenario is a fixed trace with a known issue. The seeded failure is hidden from the judge — your job is to see whether the judge catches it.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">2. Inspect the trace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Task
            </div>
            <div className="text-sm text-foreground">{scenario.task}</div>
          </div>
          <div className="space-y-2">
            {scenario.steps.map((s) => (
              <div
                key={s.index}
                className="rounded-md border border-border bg-muted/30 p-3 text-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    step {s.index}
                  </Badge>
                  <span className="font-mono text-xs text-foreground">{s.tool}</span>
                </div>
                <div className="font-mono text-[11px] text-muted-foreground break-all">
                  args: {s.args}
                </div>
                <div className="font-mono text-[11px] text-foreground/80 break-all mt-1">
                  obs: {s.observation}
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Final answer
            </div>
            <div className="text-sm text-foreground rounded-md border border-border bg-muted/30 p-3">
              {scenario.finalAnswer}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">3. Critique the trajectory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={critique} disabled={running}>
            {running ? "Critiquing…" : "Run trajectory judge"}
          </Button>
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  Overall pass rate:{" "}
                  <span className="text-foreground font-semibold">
                    {Math.round(result.result.overall_pass_rate * 100)}%
                  </span>
                </div>
                <UsageStrip usage={result.usage} stopReason={result.stop_reason} />
              </div>
              <div className="space-y-2">
                {result.result.verdicts.map((v) => {
                  const seeded = scenario.seededFailures.includes(v.dimension);
                  return (
                    <div
                      key={v.dimension}
                      className="rounded-md border border-border bg-muted/30 p-3 text-sm"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant={v.verdict === "pass" ? "success" : "destructive"}>
                          {v.verdict}
                        </Badge>
                        <span className="font-mono text-xs text-foreground">
                          {v.dimension}
                        </span>
                        {v.step_indices.length > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            steps {v.step_indices.join(", ")}
                          </span>
                        )}
                        {seeded && (
                          <Badge variant="warning" className="text-[10px]">
                            seeded failure
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground italic mb-1">
                        {v.evidence}
                      </div>
                      <div className="text-foreground/80 text-xs">{v.reasoning}</div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Compare the judge&apos;s failures to the &ldquo;seeded failure&rdquo; tag on this
                scenario. A good trajectory judge catches the seeded one without flagging the others.
                Misses and false positives are both signal.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
