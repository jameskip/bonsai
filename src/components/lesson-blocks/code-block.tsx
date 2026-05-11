"use client";

import { renderInline } from "@/lib/render-inline";

export function CodeBlock({
  heading,
  intro,
  language,
  body,
  caption,
}: {
  heading?: string;
  intro?: string;
  language?: string;
  body: string;
  caption?: string;
}) {
  return (
    <div className="space-y-4">
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
      <div className="rounded-lg border border-border bg-muted/40 overflow-hidden">
        {language && (
          <div className="px-4 py-1.5 border-b border-border bg-muted/60 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
            {language}
          </div>
        )}
        <pre className="px-4 py-3 text-[12.5px] md:text-[13px] leading-relaxed overflow-x-auto font-mono text-foreground/90">
          <code>{body}</code>
        </pre>
      </div>
      {caption && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {renderInline(caption)}
        </p>
      )}
    </div>
  );
}
