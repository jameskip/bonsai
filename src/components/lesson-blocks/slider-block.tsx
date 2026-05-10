"use client";

import { useEffect, useState } from "react";
import { renderInline } from "@/lib/render-inline";

type SliderVariant = "ci-from-n" | "recall-vs-cost" | "drift-psi";

type ComputedView = {
  primary: string;
  primaryLabel: string;
  bars: { label: string; lo: number; mid: number; hi: number; max: number }[];
  hint: string;
};

function computeCiFromN(n: number): ComputedView {
  const p = 0.8;
  const z = 1.96;
  const halfWidth = z * Math.sqrt((p * (1 - p)) / n);
  const halfPct = halfWidth * 100;
  const mid = p * 100;
  const lo = mid - halfPct;
  const hi = mid + halfPct;
  const detectable = halfPct.toFixed(1);
  return {
    primary: `±${detectable} pts`,
    primaryLabel: `95% confidence interval at p=0.80`,
    bars: [{ label: "Pass rate (80% ± CI)", lo, mid, hi, max: 100 }],
    hint:
      n < 50
        ? "Wide CI — you cannot detect a 5-point regression. Any movement could be noise."
        : n < 200
        ? "Better. You can detect ~5–7 point shifts but small regressions still hide."
        : n < 350
        ? "Solid. You can reliably detect 3-point regressions on headline metrics."
        : "Tight. You can detect 2-point shifts; per-slice power is good with ≥30 cases per slice.",
  };
}

function computeRecallVsCost(k: number): ComputedView {
  // Recall@k assuming 25% per-doc recall on a single relevant doc
  const pPerDoc = 0.25;
  const recall = (1 - Math.pow(1 - pPerDoc, k)) * 100;
  const tokensPerDoc = 800;
  const tokens = k * tokensPerDoc;
  const distractors = Math.max(0, k - 1) * 100; // arbitrary "distractor index" — prose only
  return {
    primary: `${recall.toFixed(1)}%`,
    primaryLabel: `Recall@k (chance the gold doc is in the top-${k})`,
    bars: [
      { label: `Recall@${k}`, lo: 0, mid: recall, hi: recall, max: 100 },
      {
        label: `Context tokens (${tokens.toLocaleString()})`,
        lo: 0,
        mid: Math.min(100, (tokens / 40000) * 100),
        hi: Math.min(100, (tokens / 40000) * 100),
        max: 100,
      },
    ],
    hint:
      k <= 2
        ? "Low recall ceiling. The generator never sees the gold doc on most queries."
        : k <= 8
        ? "Sweet spot for many systems. Diminishing recall returns past here."
        : k <= 20
        ? `Marginal recall gain costs ${tokens.toLocaleString()} tokens of context every call. Distractors hurt generation quality.`
        : `Diminishing returns. Distractor pollution and token cost (${distractors / 100} extra docs) usually beat the recall gain.`,
  };
}

function computeDriftPsi(shiftPct: number): ComputedView {
  // 5-bucket reference distribution; shift mass toward higher buckets as severity grows
  const ref = [0.1, 0.2, 0.3, 0.25, 0.15];
  const s = shiftPct / 100;
  // Move proportional mass from buckets 0-1 toward buckets 3-4
  const cur = [
    ref[0] * (1 - 0.9 * s),
    ref[1] * (1 - 0.6 * s),
    ref[2] * (1 - 0.1 * s),
    ref[3] + (ref[0] * 0.5 + ref[1] * 0.4) * s,
    ref[4] + (ref[0] * 0.4 + ref[1] * 0.2 + ref[2] * 0.1) * s,
  ];
  const sum = cur.reduce((a, b) => a + b, 0);
  const curN = cur.map((x) => x / sum);
  const psi = ref.reduce((acc, r, i) => {
    const c = Math.max(curN[i], 0.0001);
    const rr = Math.max(r, 0.0001);
    return acc + (c - rr) * Math.log(c / rr);
  }, 0);
  const psiAbs = Math.abs(psi);
  return {
    primary: psiAbs.toFixed(3),
    primaryLabel: `PSI (population stability index)`,
    bars: ref.map((r, i) => ({
      label: `bucket ${i + 1}: ${(r * 100).toFixed(0)}% → ${(curN[i] * 100).toFixed(0)}%`,
      lo: 0,
      mid: curN[i] * 100,
      hi: curN[i] * 100,
      max: 50,
    })),
    hint:
      psiAbs < 0.1
        ? "Stable. Within normal week-over-week noise. Don't alert."
        : psiAbs < 0.2
        ? "Moderate shift. Investigate but don't page."
        : psiAbs < 0.3
        ? "Material drift. Open a triage queue; route the new slice to labelers."
        : "Major drift. Likely a new use case or upstream bug. Stop trusting offline evals until you label the new traffic.",
  };
}

function compute(variant: SliderVariant, value: number): ComputedView {
  switch (variant) {
    case "ci-from-n":
      return computeCiFromN(value);
    case "recall-vs-cost":
      return computeRecallVsCost(value);
    case "drift-psi":
      return computeDriftPsi(value);
  }
}

export function SliderBlock({
  heading,
  body,
  variant,
  param,
  reveal,
  onComplete,
}: {
  heading: string;
  body: string;
  variant: SliderVariant;
  param: { label: string; min: number; max: number; step: number; default: number };
  reveal: string;
  onComplete: () => void;
}) {
  const [n, setN] = useState(param.default);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched) onComplete();
  }, [touched, onComplete]);

  const view = compute(variant, n);

  return (
    <div className="space-y-5">
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
        {heading}
      </h2>
      <p className="text-base text-foreground/90 leading-relaxed">
        {renderInline(body)}
      </p>

      <div className="rounded-lg border border-border bg-muted/30 p-5 space-y-5">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-sm text-muted-foreground">{param.label}</label>
            <span className="text-2xl font-mono text-foreground tabular-nums">{n}</span>
          </div>
          <input
            type="range"
            min={param.min}
            max={param.max}
            step={param.step}
            value={n}
            onChange={(e) => {
              setN(Number(e.target.value));
              if (!touched) setTouched(true);
            }}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
            <span>{param.min}</span>
            <span>{param.max}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              {view.primaryLabel}
            </div>
            <div className="text-3xl font-mono text-foreground tabular-nums mt-1">
              {view.primary}
            </div>
          </div>

          {view.bars.map((b) => (
            <div key={b.label}>
              <div className="text-xs text-muted-foreground mb-1">{b.label}</div>
              <div className="relative h-7 rounded-md bg-background border border-border overflow-hidden">
                <div
                  className="absolute top-0 h-full bg-primary/25"
                  style={{
                    left: `${(b.lo / b.max) * 100}%`,
                    width: `${((b.hi - b.lo) / b.max) * 100}%`,
                  }}
                />
                <div
                  className="absolute top-0 h-full w-[2px] bg-primary"
                  style={{ left: `${(b.mid / b.max) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-mono text-muted-foreground">
                  <span>{b.lo.toFixed(1)}%</span>
                  <span>{b.hi.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}

          <div className="text-sm text-foreground/90 leading-relaxed pt-1">{view.hint}</div>
        </div>
      </div>

      {touched && (
        <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm text-foreground/90 leading-relaxed">
          {renderInline(reveal)}
        </div>
      )}
    </div>
  );
}
