import { Fragment } from "react";

export function renderInline(text: string) {
  const re = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  const out: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(re)) {
    const idx = match.index ?? 0;
    if (idx > last) out.push(<Fragment key={key++}>{text.slice(last, idx)}</Fragment>);
    if (match[1]) {
      out.push(
        <code
          key={key++}
          className="rounded bg-muted px-1.5 py-0.5 text-[0.9em] font-mono text-foreground"
        >
          {match[1]}
        </code>
      );
    } else if (match[2]) {
      out.push(
        <strong key={key++} className="text-foreground font-semibold">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      out.push(
        <em key={key++} className="text-foreground/95">
          {match[3]}
        </em>
      );
    }
    last = idx + match[0].length;
  }
  if (last < text.length) out.push(<Fragment key={key++}>{text.slice(last)}</Fragment>);
  return out;
}
