"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UsageStrip, type UsageInfo } from "@/components/usage-strip";
import { apiKeyHeader } from "@/lib/api-key";

type Verdict = {
  criterion_id: string;
  verdict: "pass" | "fail";
  evidence_quote: string;
  reasoning: string;
};

type JudgeRun = {
  rubricLabel: string;
  pass_rate: number;
  verdicts: Verdict[];
  usage: UsageInfo;
};

const DEFAULT_CANDIDATE = `Subject: Quick check-in

Hi! Just wanted to follow up on the proposal we sent last week. We're really excited about working with you and would love to hear your thoughts. Let me know if you need anything else from us. We pride ourselves on being responsive and customer-first, and our enterprise plan is the best in the industry. Thanks!`;

export function RubricBuilderLab() {
  const [candidate, setCandidate] = useState(DEFAULT_CANDIDATE);
  const [criterionId, setCriterionId] = useState("c1");
  const [criterionText, setCriterionText] = useState(
    "Does NOT contain unverified marketing claims (best-in-industry, world-class, etc.)."
  );
  const [runs, setRuns] = useState<JudgeRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/anthropic/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...apiKeyHeader() },
        body: JSON.stringify({
          candidate,
          criteria: [{ id: criterionId, description: criterionText }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed.");
      setRuns((rs) => [
        {
          rubricLabel: criterionText,
          pass_rate: data.result.overall_pass_rate,
          verdicts: data.result.verdicts,
          usage: data.usage,
        },
        ...rs,
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Candidate output</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={candidate}
            onChange={(e) => setCandidate(e.target.value)}
            className="min-h-32"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Try a rubric variant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={criterionId}
              onChange={(e) => setCriterionId(e.target.value)}
              className="w-32"
            />
            <Input
              value={criterionText}
              onChange={(e) => setCriterionText(e.target.value)}
              className="flex-1"
            />
          </div>
          <Button onClick={run} disabled={loading || !candidate || !criterionText}>
            {loading ? "Judging..." : "Score with this criterion"}
          </Button>
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Try varying phrasings of the same idea: a vague version (&ldquo;is high
            quality&rdquo;), a specific binary version (&ldquo;contains zero claims of
            being &lsquo;best&rsquo;, &lsquo;world-class&rsquo;, or &lsquo;industry
            leading&rsquo;&rdquo;), and an evidence-required version. Watch how the verdict and the
            quoted evidence change.
          </p>
        </CardContent>
      </Card>

      {runs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Run history (newest first)
          </h2>
          {runs.map((r, i) => {
            const v = r.verdicts[0];
            return (
              <Card key={i}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={v?.verdict === "pass" ? "success" : "destructive"}>
                      {v?.verdict}
                    </Badge>
                    <UsageStrip usage={r.usage} />
                  </div>
                  <div className="text-sm text-foreground">
                    <span className="text-muted-foreground">Rubric: </span>
                    {r.rubricLabel}
                  </div>
                  {v && (
                    <>
                      <div className="text-xs text-muted-foreground italic">
                        Evidence: &ldquo;{v.evidence_quote}&rdquo;
                      </div>
                      <div className="text-xs text-foreground/80">{v.reasoning}</div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
