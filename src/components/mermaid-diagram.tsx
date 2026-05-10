"use client";

import { useEffect, useId, useState } from "react";
import type { DesignNode, DesignEdge } from "@/content/system-designs";
import { cn } from "@/lib/utils";

const SHAPE: Record<DesignNode["kind"], (id: string, label: string) => string> = {
  input: (id, l) => `${id}[/"${l}"/]`,
  process: (id, l) => `${id}("${l}")`,
  model: (id, l) => `${id}("${l}")`,
  store: (id, l) => `${id}[("${l}")]`,
  judge: (id, l) => `${id}{{"${l}"}}`,
  output: (id, l) => `${id}[\\"${l}"\\]`,
};

const KIND_BADGES: Record<DesignNode["kind"], { label: string; className: string }> = {
  input: { label: "Input", className: "bg-blue-500/10 text-blue-300 border-blue-500/30" },
  process: { label: "Process", className: "bg-primary/10 text-primary border-primary/30" },
  model: { label: "Model", className: "bg-purple-500/10 text-purple-300 border-purple-500/30" },
  store: { label: "Store", className: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
  judge: { label: "Judge", className: "bg-pink-500/10 text-pink-300 border-pink-500/30" },
  output: { label: "Output", className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
};

const KIND_LABELS: { kind: DesignNode["kind"]; label: string; className: string }[] = [
  { kind: "input", label: "Input", className: "bg-blue-500/10 text-blue-300 border-blue-500/30" },
  { kind: "process", label: "Process", className: "bg-primary/10 text-primary border-primary/30" },
  { kind: "model", label: "Model", className: "bg-purple-500/10 text-purple-300 border-purple-500/30" },
  { kind: "store", label: "Store", className: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
  { kind: "judge", label: "Judge", className: "bg-pink-500/10 text-pink-300 border-pink-500/30" },
  { kind: "output", label: "Output", className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
];

export function buildMermaidSource(nodes: DesignNode[], edges: DesignEdge[]) {
  const header = `%%{init: {"theme":"base","themeVariables":{"lineColor":"#3a3f48","textColor":"#ededf0","fontFamily":"ui-monospace, SFMono-Regular, monospace","fontSize":"13px","edgeLabelBackground":"#15171b"}}}%%
flowchart LR`;

  const nodeLines = nodes.map((n) => `    ${SHAPE[n.kind](n.id, n.label)}`);

  const edgeLines = edges.map((e) =>
    e.label ? `    ${e.from} -->|${e.label}| ${e.to}` : `    ${e.from} --> ${e.to}`
  );

  const classDefs = `    classDef input fill:#0e1b30,stroke:#3b82f6,color:#bfdbfe,stroke-width:1.5px
    classDef process fill:#2a1f12,stroke:#d4a373,color:#f6d4ad,stroke-width:1.5px
    classDef model fill:#1f1428,stroke:#a855f7,color:#e9d5ff,stroke-width:1.5px
    classDef store fill:#2a1d08,stroke:#f59e0b,color:#fde68a,stroke-width:1.5px
    classDef judge fill:#2a0e1c,stroke:#ec4899,color:#fbcfe8,stroke-width:1.5px
    classDef output fill:#0a2418,stroke:#10b981,color:#a7f3d0,stroke-width:1.5px`;

  const byKind = nodes.reduce<Partial<Record<DesignNode["kind"], string[]>>>((acc, n) => {
    (acc[n.kind] ||= []).push(n.id);
    return acc;
  }, {});
  const classLines = (Object.entries(byKind) as [DesignNode["kind"], string[]][]).map(
    ([k, ids]) => `    class ${ids.join(",")} ${k}`
  );

  return [header, ...nodeLines, "", ...edgeLines, "", classDefs, ...classLines].join("\n");
}

export function MermaidDiagram({
  nodes,
  edges,
}: {
  nodes: DesignNode[];
  edges: DesignEdge[];
}) {
  const rawId = useId();
  const id = `m${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const [svg, setSvg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({ startOnLoad: false, securityLevel: "loose" });
        const source = buildMermaidSource(nodes, edges);
        const { svg } = await mermaid.render(id, source);
        if (!cancelled) {
          setSvg(svg);
          setErr(null);
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [nodes, edges, id]);

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-5 md:p-6 space-y-6 not-prose">
      <div className="flex flex-wrap gap-2 text-xs">
        {KIND_LABELS.map((k) => (
          <span
            key={k.kind}
            className={cn("rounded-full border px-2 py-0.5 font-medium", k.className)}
          >
            {k.label}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto" aria-label="Architecture diagram">
        {err ? (
          <pre className="text-xs text-destructive font-mono whitespace-pre-wrap">
            Failed to render diagram: {err}
          </pre>
        ) : svg ? (
          <div
            className="mermaid-host flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="py-12 text-center text-sm text-muted-foreground font-mono">
            rendering diagram…
          </div>
        )}
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Components
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {nodes.map((n) => (
            <div key={n.id} className="flex items-start gap-2 text-sm">
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-medium shrink-0",
                  KIND_BADGES[n.kind].className
                )}
              >
                {n.label}
              </span>
              <span className="text-muted-foreground leading-relaxed">{n.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
