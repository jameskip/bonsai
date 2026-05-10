"use client";

import { renderInline } from "@/lib/render-inline";

export function ProseBlock({
  heading,
  body,
  refsCount,
  onJumpToRefs,
}: {
  heading?: string;
  body: string;
  refsCount?: number;
  onJumpToRefs?: () => void;
}) {
  return (
    <div className="space-y-4">
      {heading && (
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
          {heading}
        </h2>
      )}
      <p className="text-base md:text-lg text-foreground/90 leading-relaxed">
        {renderInline(body)}
      </p>
      {refsCount && refsCount > 0 && onJumpToRefs && (
        <div>
          <button
            type="button"
            onClick={onJumpToRefs}
            className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
          >
            ↗ {refsCount} sources for this lesson
          </button>
        </div>
      )}
    </div>
  );
}
