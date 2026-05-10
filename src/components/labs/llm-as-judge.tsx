"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UsageStrip, type UsageInfo } from "@/components/usage-strip";

type Criterion = { id: string; description: string };

type Verdict = {
  criterion_id: string;
  verdict: "pass" | "fail";
  evidence_quote: string;
  reasoning: string;
};

type JudgeResult = {
  result: { overall_pass_rate: number; verdicts: Verdict[] };
  usage: UsageInfo;
  stop_reason?: string;
};

const DEFAULT_CRITERIA: Criterion[] = [
  { id: "answers_question", description: "Directly addresses the user's question." },
  { id: "no_hallucinated_facts", description: "Does not invent specific facts (numbers, names, dates, prices) not present in the prompt." },
  { id: "appropriate_caveat", description: "If asked about uncertain information, includes a caveat or refusal rather than confident invention." },
];

const DEFAULT_PROMPT = "What is the current population of the city of Florence, Italy?";

export function LlmAsJudgeLab() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [candidate, setCandidate] = useState("");
  const [style, setStyle] = useState<"concise" | "verbose">("concise");
  const [criteria, setCriteria] = useState<Criterion[]>(DEFAULT_CRITERIA);
  const [generating, setGenerating] = useState(false);
  const [judging, setJudging] = useState(false);
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/anthropic/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generate failed.");
      setCandidate(data.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generate failed.");
    } finally {
      setGenerating(false);
    }
  }

  async function judge() {
    setJudging(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/anthropic/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate,
          context: `User prompt: ${prompt}`,
          criteria,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Judge failed.");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Judge failed.");
    } finally {
      setJudging(false);
    }
  }

  function updateCriterion(idx: number, patch: Partial<Criterion>) {
    setCriteria((cs) => cs.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }
  function addCriterion() {
    setCriteria((cs) => [...cs, { id: `c${cs.length + 1}`, description: "" }]);
  }
  function removeCriterion(idx: number) {
    setCriteria((cs) => cs.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Generate a candidate response</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="prompt">User prompt</Label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex items-end gap-3">
            <div>
              <Label className="text-xs">Style</Label>
              <div className="mt-1 flex gap-1 rounded-md bg-muted p-1">
                {(["concise", "verbose"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={`px-3 py-1 text-xs rounded ${
                      style === s ? "bg-card text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <Button size="sm" onClick={generate} disabled={generating || !prompt}>
              {generating ? "Generating..." : "Generate"}
            </Button>
          </div>
          <div>
            <Label htmlFor="candidate">Candidate response (you can edit this)</Label>
            <Textarea
              id="candidate"
              value={candidate}
              onChange={(e) => setCandidate(e.target.value)}
              placeholder="Click Generate, or paste your own response here."
              className="mt-1 min-h-32"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Tip: try generating once with <span className="text-foreground">concise</span>, score it,
            then regenerate with <span className="text-foreground">verbose</span> and score the same
            content again. Verbose responses often score higher even when the underlying claims are the same — that&apos;s verbosity bias.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">2. Author the rubric</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {criteria.map((c, i) => (
            <div key={i} className="flex gap-2 items-start">
              <Input
                value={c.id}
                onChange={(e) => updateCriterion(i, { id: e.target.value })}
                className="w-40"
                placeholder="criterion_id"
              />
              <Input
                value={c.description}
                onChange={(e) => updateCriterion(i, { description: e.target.value })}
                className="flex-1"
                placeholder="One-sentence binary criterion..."
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeCriterion(i)}
                disabled={criteria.length === 1}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={addCriterion}>
            + Add criterion
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">3. Judge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={judge}
            disabled={judging || !candidate || criteria.some((c) => !c.id || !c.description)}
          >
            {judging ? "Scoring..." : "Run judge"}
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
                {result.result.verdicts.map((v) => (
                  <div
                    key={v.criterion_id}
                    className="rounded-md border border-border bg-muted/30 p-3 text-sm"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={v.verdict === "pass" ? "success" : "destructive"}>
                        {v.verdict}
                      </Badge>
                      <span className="font-mono text-xs text-foreground">{v.criterion_id}</span>
                    </div>
                    <div className="text-muted-foreground italic mb-1">
                      &ldquo;{v.evidence_quote}&rdquo;
                    </div>
                    <div className="text-foreground/80 text-xs">{v.reasoning}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
