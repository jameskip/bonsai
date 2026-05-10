"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { renderInline } from "@/lib/render-inline";

type Option = { id: string; label: string; correct?: boolean };

export function CheckpointBlock({
  prompt,
  options,
  explanation,
  onComplete,
}: {
  prompt: string;
  options: Option[];
  explanation: string;
  onComplete: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const correctId = options.find((o) => o.correct)?.id ?? "";

  function submit() {
    if (!picked) return;
    setSubmitted(true);
    if (picked === correctId) onComplete();
  }

  function tryAgain() {
    setSubmitted(false);
    setPicked(null);
  }

  return (
    <div className="space-y-5">
      <div className="text-base md:text-lg text-foreground leading-relaxed">
        {renderInline(prompt)}
      </div>
      <div className="space-y-2">
        {options.map((opt) => {
          const isPicked = picked === opt.id;
          const isCorrect = opt.id === correctId;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                if (submitted) return;
                setPicked(opt.id);
              }}
              disabled={submitted && !isPicked && !isCorrect}
              className={cn(
                "w-full text-left rounded-md border px-4 py-3 text-sm transition-colors",
                !submitted && "hover:border-primary/50 cursor-pointer",
                !submitted && isPicked && "border-primary bg-primary/5",
                submitted && isCorrect && "border-success bg-success/10",
                submitted &&
                  !isCorrect &&
                  isPicked &&
                  "border-destructive bg-destructive/10",
                submitted && !isCorrect && !isPicked && "opacity-50"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-mono shrink-0",
                    !submitted && isPicked && "border-primary text-primary",
                    !submitted && !isPicked && "border-border text-muted-foreground",
                    submitted && isCorrect && "border-success bg-success text-background",
                    submitted &&
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

      {!submitted ? (
        <Button size="sm" disabled={!picked} onClick={submit}>
          Check answer
        </Button>
      ) : picked === correctId ? (
        <div className="space-y-3">
          <Badge variant="success">Correct</Badge>
          <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-foreground/90 leading-relaxed">
            {renderInline(explanation)}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Badge variant="destructive">Not quite</Badge>
          <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-foreground/90 leading-relaxed">
            {renderInline(explanation)}
          </div>
          <Button size="sm" variant="outline" onClick={tryAgain}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
