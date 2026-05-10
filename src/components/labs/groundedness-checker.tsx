"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UsageStrip, type UsageInfo } from "@/components/usage-strip";
import { apiKeyHeader } from "@/lib/api-key";

type Claim = {
  claim: string;
  verdict: "grounded" | "contradicted" | "unsupported";
  evidence_quote: string;
};

type Result = {
  result: { groundedness_rate: number; claims: Claim[] };
  usage: UsageInfo;
  stop_reason?: string;
};

const DEFAULT_CONTEXT = `Florence (Italian: Firenze) is the capital of the Tuscany region in central Italy. It was a major center of European trade and finance during the Renaissance and is considered the birthplace of the Italian Renaissance. The historic center of Florence was inscribed on the UNESCO World Heritage List in 1982. The Arno River runs through the city.`;

const DEFAULT_ANSWER = `Florence is the capital of Tuscany and the birthplace of the Renaissance. It has a population of about 700,000 and is famous for the Duomo, designed by Leonardo da Vinci. The Arno River flows through the city, which was added to UNESCO's World Heritage List in 1982.`;

const verdictStyle: Record<Claim["verdict"], "success" | "destructive" | "warning"> = {
  grounded: "success",
  contradicted: "destructive",
  unsupported: "warning",
};

export function GroundednessLab() {
  const [context, setContext] = useState(DEFAULT_CONTEXT);
  const [answer, setAnswer] = useState(DEFAULT_ANSWER);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/anthropic/groundedness", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...apiKeyHeader() },
        body: JSON.stringify({ context, answer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed.");
      setResult(data);
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
          <CardTitle className="text-base">Inputs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="ctx">Context (the retrieved documents)</Label>
            <Textarea
              id="ctx"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="mt-1 min-h-28"
            />
          </div>
          <div>
            <Label htmlFor="ans">Candidate answer</Label>
            <Textarea
              id="ans"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="mt-1 min-h-28"
            />
          </div>
          <Button onClick={run} disabled={loading || !context || !answer}>
            {loading ? "Scoring..." : "Score groundedness"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Default example contains a fabricated claim (the architect of the Duomo) and an
            unsupported number (population). A good groundedness judge should catch both.
          </p>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-3">
              <span>
                Groundedness rate:{" "}
                <span className="text-primary">
                  {Math.round(result.result.groundedness_rate * 100)}%
                </span>
              </span>
              <UsageStrip usage={result.usage} stopReason={result.stop_reason} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.result.claims.map((c, i) => (
                <div
                  key={i}
                  className="rounded-md border border-border bg-muted/30 p-3 text-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={verdictStyle[c.verdict]}>{c.verdict}</Badge>
                  </div>
                  <div className="text-foreground mb-1">{c.claim}</div>
                  <div className="text-muted-foreground italic text-xs">
                    Evidence: &ldquo;{c.evidence_quote}&rdquo;
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
