import { cn } from "@/lib/utils";
import type { DesignNode, DesignEdge } from "@/content/system-designs";

const kindStyles: Record<DesignNode["kind"], string> = {
  input: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  process: "bg-primary/10 text-primary border-primary/30",
  store: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  model: "bg-purple-500/10 text-purple-300 border-purple-500/30",
  judge: "bg-pink-500/10 text-pink-300 border-pink-500/30",
  output: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
};

const kindLabels: Record<DesignNode["kind"], string> = {
  input: "Input",
  process: "Process",
  store: "Store",
  model: "Model",
  judge: "Judge",
  output: "Output",
};

export function DesignDiagram({
  nodes,
  edges,
}: {
  nodes: DesignNode[];
  edges: DesignEdge[];
}) {
  const edgesByFrom = new Map<string, DesignEdge[]>();
  edges.forEach((e) => {
    const arr = edgesByFrom.get(e.from) ?? [];
    arr.push(e);
    edgesByFrom.set(e.from, arr);
  });

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-6">
      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        {Object.entries(kindLabels).map(([k, label]) => (
          <span
            key={k}
            className={cn(
              "rounded-full border px-2 py-0.5 font-medium",
              kindStyles[k as DesignNode["kind"]]
            )}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="space-y-2 font-mono text-xs">
        {nodes.map((n) => {
          const outs = edgesByFrom.get(n.id) ?? [];
          return (
            <div key={n.id} className="space-y-1">
              <div
                className={cn(
                  "inline-flex items-start gap-2 rounded-md border px-3 py-2 max-w-full",
                  kindStyles[n.kind]
                )}
              >
                <span className="font-semibold whitespace-nowrap">{n.label}</span>
                <span className="opacity-70 font-sans normal-case">— {n.description}</span>
              </div>
              {outs.length > 0 && (
                <div className="ml-6 space-y-1">
                  {outs.map((e, i) => {
                    const target = nodes.find((nn) => nn.id === e.to);
                    return (
                      <div key={i} className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-primary">→</span>
                        <span className="text-foreground">{target?.label}</span>
                        {e.label && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] opacity-80">
                            {e.label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
