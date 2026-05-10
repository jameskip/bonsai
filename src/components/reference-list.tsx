import type { Reference, ReferenceSource } from "@/content/curriculum";
import { Badge } from "@/components/ui/badge";

const SOURCE_ORDER: ReferenceSource[] = [
  "paper",
  "docs",
  "framework",
  "standard",
  "tool",
  "blog",
];

const SOURCE_LABEL: Record<ReferenceSource, string> = {
  paper: "Papers",
  docs: "Official docs",
  framework: "Frameworks",
  standard: "Standards",
  tool: "Tools",
  blog: "Field write-ups",
};

const SOURCE_BADGE: Record<ReferenceSource, string> = {
  paper: "paper",
  docs: "docs",
  framework: "framework",
  standard: "standard",
  tool: "tool",
  blog: "blog",
};

export function ReferenceList({ references }: { references: Reference[] }) {
  const grouped = SOURCE_ORDER.map((src) => ({
    source: src,
    items: references.filter((r) => r.source === src),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-5">
      {grouped.map((group) => (
        <div key={group.source}>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            {SOURCE_LABEL[group.source]}
          </div>
          <ul className="space-y-1.5">
            {group.items.map((ref) => (
              <li key={ref.url}>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex items-start gap-2 text-sm text-foreground/90 hover:text-foreground transition-colors"
                >
                  <Badge
                    variant="outline"
                    className="text-[9px] uppercase tracking-wider mt-0.5 shrink-0"
                  >
                    {SOURCE_BADGE[ref.source]}
                  </Badge>
                  <span className="underline decoration-border underline-offset-4 group-hover:decoration-foreground/60 leading-relaxed">
                    {ref.label} ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
