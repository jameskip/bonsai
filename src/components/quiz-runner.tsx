"use client";

import { useMemo, useState } from "react";
import type { Quiz } from "@/content/quizzes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function QuizRunner({ quiz }: { quiz: Quiz }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const correctOptionByQ = useMemo(() => {
    const m: Record<string, string> = {};
    quiz.questions.forEach((q) => {
      const c = q.options.find((o) => o.correct);
      if (c) m[q.id] = c.id;
    });
    return m;
  }, [quiz]);

  const score = quiz.questions.reduce(
    (acc, q) =>
      acc + (submitted[q.id] && answers[q.id] === correctOptionByQ[q.id] ? 1 : 0),
    0
  );
  const submittedCount = Object.values(submitted).filter(Boolean).length;
  const total = quiz.questions.length;

  return (
    <div className="space-y-6">
      <Card className="bg-muted/30">
        <CardContent className="p-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Progress</div>
            <div className="text-base text-foreground">
              {submittedCount} of {total} answered · {score} correct
            </div>
          </div>
          <div className="w-40">
            <Progress value={(submittedCount / total) * 100} />
          </div>
        </CardContent>
      </Card>

      {quiz.questions.map((q, i) => {
        const isSubmitted = !!submitted[q.id];
        const selected = answers[q.id];
        const correct = correctOptionByQ[q.id];
        return (
          <Card key={q.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Q{i + 1}</Badge>
              </div>
              <CardTitle className="text-base leading-relaxed font-normal text-foreground">
                {q.prompt}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const isPicked = selected === opt.id;
                  const isCorrect = opt.id === correct;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        if (isSubmitted) return;
                        setAnswers((a) => ({ ...a, [q.id]: opt.id }));
                      }}
                      className={cn(
                        "w-full text-left rounded-md border px-4 py-3 text-sm transition-colors",
                        !isSubmitted && "hover:border-primary/50 cursor-pointer",
                        !isSubmitted && isPicked && "border-primary bg-primary/5",
                        isSubmitted && isCorrect && "border-success bg-success/10",
                        isSubmitted &&
                          !isCorrect &&
                          isPicked &&
                          "border-destructive bg-destructive/10",
                        isSubmitted && !isCorrect && !isPicked && "opacity-60"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-mono shrink-0",
                            !isSubmitted && isPicked && "border-primary text-primary",
                            !isSubmitted && !isPicked && "border-border text-muted-foreground",
                            isSubmitted &&
                              isCorrect &&
                              "border-success bg-success text-background",
                            isSubmitted &&
                              !isCorrect &&
                              isPicked &&
                              "border-destructive bg-destructive text-white"
                          )}
                        >
                          {opt.id.toUpperCase()}
                        </div>
                        <span className="text-foreground">{opt.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between gap-3 pt-1">
                {!isSubmitted ? (
                  <Button
                    size="sm"
                    disabled={!selected}
                    onClick={() => setSubmitted((s) => ({ ...s, [q.id]: true }))}
                  >
                    Check answer
                  </Button>
                ) : (
                  <Badge
                    variant={selected === correct ? "success" : "destructive"}
                  >
                    {selected === correct ? "Correct" : "Incorrect"}
                  </Badge>
                )}
              </div>
              {isSubmitted && (
                <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground leading-relaxed">
                  <span className="text-foreground font-medium">Why: </span>
                  {q.explanation}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {submittedCount === total && (
        <Card className="border-primary/40">
          <CardContent className="p-6 text-center">
            <div className="text-sm text-muted-foreground">Final score</div>
            <div className="text-3xl font-semibold text-foreground mt-1">
              {score} / {total}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {score === total
                ? "Clean sweep. You've internalized the playbook."
                : score >= total * 0.7
                ? "Solid. Re-read the explanations on the misses and you're set."
                : "Worth a re-pass through the curriculum before relying on this in production."}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
