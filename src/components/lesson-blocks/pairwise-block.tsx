"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { renderInline } from "@/lib/render-inline";

export function PairwiseBlock({
  heading,
  body,
  a,
  b,
  naivePicks,
  truth,
  reveal,
  onComplete,
}: {
  heading: string;
  body: string;
  a: { label: string; text: string };
  b: { label: string; text: string };
  naivePicks: "a" | "b";
  truth: "a" | "b" | "tie";
  reveal: string;
  onComplete: () => void;
}) {
  const [picked, setPicked] = useState<"a" | "b" | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function submit() {
    if (!picked) return;
    setSubmitted(true);
    onComplete();
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
        {heading}
      </h2>
      <p className="text-base text-foreground/90 leading-relaxed">{renderInline(body)}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(["a", "b"] as const).map((side) => {
          const opt = side === "a" ? a : b;
          const isPicked = picked === side;
          const isNaive = submitted && naivePicks === side;
          const isTrue = submitted && truth === side;
          return (
            <button
              key={side}
              type="button"
              onClick={() => {
                if (submitted) return;
                setPicked(side);
              }}
              className={cn(
                "text-left rounded-lg border p-4 transition-colors",
                !submitted && "hover:border-primary/50 cursor-pointer",
                !submitted && isPicked && "border-primary bg-primary/5",
                submitted && isTrue && "border-success bg-success/10",
                submitted && isNaive && truth !== side && "border-destructive bg-destructive/10",
                submitted && !isNaive && !isTrue && "opacity-60"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{opt.label}</Badge>
                {submitted && isNaive && (
                  <Badge variant="destructive" className="text-[10px]">
                    naive judge picks
                  </Badge>
                )}
                {submitted && isTrue && (
                  <Badge variant="success" className="text-[10px]">
                    actually better
                  </Badge>
                )}
              </div>
              <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {opt.text}
              </div>
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <Button size="sm" disabled={!picked} onClick={submit}>
          Lock in pick
        </Button>
      ) : (
        <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm text-foreground/90 leading-relaxed">
          {renderInline(reveal)}
        </div>
      )}
    </div>
  );
}
