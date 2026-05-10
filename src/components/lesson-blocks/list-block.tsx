"use client";

import { renderInline } from "@/lib/render-inline";
import { cn } from "@/lib/utils";

export function ListBlock({
  heading,
  intro,
  style,
  items,
  outro,
  refsCount,
  onJumpToRefs,
}: {
  heading?: string;
  intro?: string;
  style: "numbered" | "bulleted" | "lettered";
  items: { term: string; description?: string }[];
  outro?: string;
  refsCount?: number;
  onJumpToRefs?: () => void;
}) {
  function marker(i: number) {
    if (style === "lettered") return `${String.fromCharCode(97 + i)}.`;
    if (style === "numbered") return `${i + 1}.`;
    return "•";
  }

  return (
    <div className="space-y-5">
      {heading && (
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
          {heading}
        </h2>
      )}
      {intro && (
        <p className="text-base md:text-lg text-foreground/90 leading-relaxed">
          {renderInline(intro)}
        </p>
      )}
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className={cn(
                "shrink-0 mt-1 font-mono text-sm tabular-nums w-6 text-right",
                style === "bulleted"
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              aria-hidden="true"
            >
              {marker(i)}
            </span>
            <div className="flex-1 text-base text-foreground/90 leading-relaxed">
              <strong className="text-foreground">
                {renderInline(item.term)}
              </strong>
              {item.description && (
                <span> — {renderInline(item.description)}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
      {outro && (
        <p className="text-base text-foreground/90 leading-relaxed">
          {renderInline(outro)}
        </p>
      )}
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
