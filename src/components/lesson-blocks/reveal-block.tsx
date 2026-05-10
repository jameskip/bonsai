"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { renderInline } from "@/lib/render-inline";

export function RevealBlock({
  heading,
  body,
  cta,
  hidden,
  onComplete,
}: {
  heading: string;
  body: string;
  cta: string;
  hidden: string;
  onComplete: () => void;
}) {
  const [revealed, setRevealed] = useState(false);

  function reveal() {
    setRevealed(true);
    onComplete();
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
        {heading}
      </h2>
      <p className="text-base text-foreground/90 leading-relaxed">{renderInline(body)}</p>
      {!revealed ? (
        <Button onClick={reveal}>{cta}</Button>
      ) : (
        <div className="rounded-md border border-primary/30 bg-primary/5 p-5 text-base text-foreground/90 leading-relaxed">
          {renderInline(hidden)}
        </div>
      )}
    </div>
  );
}
