"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiKeyHeader } from "@/lib/api-key";

type Winner = "first" | "second" | "tie";

type Trial = {
  runIndex: number;
  orderShown: ["A", "B"] | ["B", "A"];
  winnerLabel: "A" | "B" | "tie";
  winnerPosition: Winner;
  reasoning: string;
};

const DEFAULT_PROMPT = "Explain why a senior engineer might prefer SQLite over Postgres for a small internal tool.";

const DEFAULT_A = `For a small internal tool, SQLite is often the better choice. It is a single file on disk — no daemon, no auth, no network — so deployment is just copying the binary. Backups are a file copy. There is no separate cluster to monitor, patch, or pay for. For low-write, low-concurrency workloads, it is faster than Postgres because there is no IPC. A senior engineer who has paid the operational tax of running Postgres for a five-user app tends not to repeat the mistake.`;

const DEFAULT_B = `Senior engineers often prefer SQLite for internal tools because it eliminates an entire class of operational concerns. There is no server to provision, no connection pool to tune, no replication topology, no version skew between staging and production. The whole database lives inside the application process, so deployments are atomic and rollbacks are trivial. For the typical internal-tool workload — single-digit users, modest writes, mostly reads — SQLite is fast enough and dramatically simpler. The "real" databases are designed for problems internal tools don't have.`;

const DEFAULT_CRITERION =
  "Which response gives a more accurate and substantive technical answer to the prompt?";

export function PairwiseBiasLab() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [candidateA, setCandidateA] = useState(DEFAULT_A);
  const [candidateB, setCandidateB] = useState(DEFAULT_B);
  const [criterion, setCriterion] = useState(DEFAULT_CRITERION);
  const [runsEach, setRunsEach] = useState(3);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function runOne(
    orderShown: ["A", "B"] | ["B", "A"],
    runIndex: number
  ): Promise<Trial> {
    const first = orderShown[0] === "A" ? candidateA : candidateB;
    const second = orderShown[1] === "A" ? candidateA : candidateB;
    const res = await fetch("/api/anthropic/pairwise", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...apiKeyHeader() },
      body: JSON.stringify({ prompt, first, second, criterion }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Pairwise call failed.");
    const winnerPosition = data.result.winner as Winner;
    const winnerLabel: "A" | "B" | "tie" =
      winnerPosition === "tie"
        ? "tie"
        : winnerPosition === "first"
          ? orderShown[0]
          : orderShown[1];
    return {
      runIndex,
      orderShown,
      winnerLabel,
      winnerPosition,
      reasoning: data.result.reasoning as string,
    };
  }

  async function runBattery() {
    setRunning(true);
    setError(null);
    setTrials([]);
    setProgress(0);
    try {
      const collected: Trial[] = [];
      let idx = 0;
      for (let i = 0; i < runsEach; i++) {
        const t = await runOne(["A", "B"], idx++);
        collected.push(t);
        setTrials([...collected]);
        setProgress(collected.length);
      }
      for (let i = 0; i < runsEach; i++) {
        const t = await runOne(["B", "A"], idx++);
        collected.push(t);
        setTrials([...collected]);
        setProgress(collected.length);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Run failed.");
    } finally {
      setRunning(false);
    }
  }

  const aWins = trials.filter((t) => t.winnerLabel === "A").length;
  const bWins = trials.filter((t) => t.winnerLabel === "B").length;
  const ties = trials.filter((t) => t.winnerLabel === "tie").length;
  const total = trials.length;

  const firstPosWins = trials.filter((t) => t.winnerPosition === "first").length;
  const secondPosWins = trials.filter((t) => t.winnerPosition === "second").length;
  const positionalGap = total > 0 ? (firstPosWins - secondPosWins) / total : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Set up the comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="pw-prompt">Prompt</Label>
            <Textarea
              id="pw-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-1 min-h-16"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pw-a">Candidate A</Label>
              <Textarea
                id="pw-a"
                value={candidateA}
                onChange={(e) => setCandidateA(e.target.value)}
                className="mt-1 min-h-40"
              />
            </div>
            <div>
              <Label htmlFor="pw-b">Candidate B</Label>
              <Textarea
                id="pw-b"
                value={candidateB}
                onChange={(e) => setCandidateB(e.target.value)}
                className="mt-1 min-h-40"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="pw-criterion">Criterion the judge will apply</Label>
            <Input
              id="pw-criterion"
              value={criterion}
              onChange={(e) => setCriterion(e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">2. Run the battery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end gap-3">
            <div>
              <Label className="text-xs">Runs per order</Label>
              <div className="mt-1 flex gap-1 rounded-md bg-muted p-1">
                {[1, 2, 3, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRunsEach(n)}
                    className={`px-3 py-1 text-xs rounded ${
                      runsEach === n ? "bg-card text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={runBattery}
              disabled={running || !prompt || !candidateA || !candidateB}
            >
              {running
                ? `Running ${progress}/${runsEach * 2}…`
                : `Run ${runsEach * 2} trials`}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            The lab runs the judge {runsEach} times with A shown first, then {runsEach} times with B shown first. Identical content, swapped order. If the judge is unbiased, win-rates should match across orderings.
          </p>
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">3. Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="A wins" value={`${aWins}/${total}`} />
              <Stat label="B wins" value={`${bWins}/${total}`} />
              <Stat label="Ties" value={`${ties}/${total}`} />
            </div>

            <div className="rounded-md border border-border bg-muted/30 p-3">
              <div className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">
                Positional bias
              </div>
              <div className="text-sm grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground">Won when shown first: </span>
                  <span className="text-foreground font-mono">{firstPosWins}/{total}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Won when shown second: </span>
                  <span className="text-foreground font-mono">{secondPosWins}/{total}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Gap: <span className="text-foreground font-mono">{(positionalGap * 100).toFixed(0)}%</span>{" "}
                {Math.abs(positionalGap) >= 0.25
                  ? "— strong positional bias. The judge favors a position regardless of content."
                  : Math.abs(positionalGap) >= 0.1
                    ? "— mild positional bias."
                    : "— positional effect is small in this sample."}
              </div>
            </div>

            <div className="space-y-2">
              {trials.map((t) => (
                <div
                  key={t.runIndex}
                  className="rounded-md border border-border bg-muted/30 p-3 text-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">#{t.runIndex + 1}</span>
                    <Badge variant="outline" className="text-[10px]">
                      shown: {t.orderShown[0]} then {t.orderShown[1]}
                    </Badge>
                    <Badge
                      variant={
                        t.winnerLabel === "tie"
                          ? "secondary"
                          : t.winnerLabel === "A"
                            ? "success"
                            : "warning"
                      }
                    >
                      winner: {t.winnerLabel}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      ({t.winnerPosition} position)
                    </span>
                  </div>
                  <div className="text-foreground/80 text-xs">{t.reasoning}</div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Production mitigation: average each pair&apos;s scores across both orderings, or use
              a reference-based scoring rubric (like the LLM-as-judge lab) instead of pairwise when
              positional bias is large.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold text-foreground font-mono">{value}</div>
    </div>
  );
}
