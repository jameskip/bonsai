import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Lab } from "@/content/labs";

export function LabShell({
  lab,
  children,
}: {
  lab: Lab;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 py-12 md:py-16">
      <Link href="/labs" className="text-sm text-muted-foreground hover:text-foreground">
        ← Labs
      </Link>
      <header className="mt-6 mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="default">{lab.level}</Badge>
          <span className="text-xs text-muted-foreground">~{lab.estMinutes} min</span>
          {lab.requiresApiKey && (
            <Badge variant="warning" className="text-[10px]">
              requires API key
            </Badge>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-tight">
          {lab.title}
        </h1>
        <p className="text-lg text-muted-foreground mt-2 leading-relaxed">{lab.tagline}</p>
        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
          {lab.description}
        </p>
        <div className="mt-4 rounded-md border border-border bg-muted/30 p-4">
          <div className="text-xs font-semibold text-foreground mb-1 uppercase tracking-wider">
            Learning objectives
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            {lab.learningObjectives.map((o) => (
              <li key={o} className="flex gap-2">
                <span className="text-primary">·</span>
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </header>
      {children}
    </div>
  );
}
