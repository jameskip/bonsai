"use client";

import { useEffect, useMemo, useState, type DragEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { renderInline } from "@/lib/render-inline";

type Bin = { id: string; label: string; hint?: string };
type Item = { id: string; label: string; correctBin: string; reason?: string };

const DRAG_MIME = "application/x-sort-item";
const TRAY_TARGET = "__tray__";

export function SortBinsBlock({
  heading,
  prompt,
  bins,
  items,
  revealOnComplete,
  onComplete,
}: {
  heading: string;
  prompt: string;
  bins: Bin[];
  items: Item[];
  revealOnComplete: string;
  onComplete: () => void;
}) {
  const [placement, setPlacement] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(items.map((it) => [it.id, null]))
  );
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const allPlaced = items.every((it) => placement[it.id]);
  const correctMap = useMemo(
    () => Object.fromEntries(items.map((it) => [it.id, it.correctBin])),
    [items]
  );
  const allCorrect = items.every((it) => placement[it.id] === correctMap[it.id]);
  const locked = checked && allCorrect;

  useEffect(() => {
    if (checked && allCorrect) onComplete();
  }, [checked, allCorrect, onComplete]);

  function placeIn(binId: string) {
    if (!selectedItem) return;
    setPlacement((p) => ({ ...p, [selectedItem]: binId }));
    setSelectedItem(null);
    setChecked(false);
  }

  function returnToTray(itemId: string) {
    if (locked) return;
    setPlacement((p) => ({ ...p, [itemId]: null }));
    setChecked(false);
  }

  function reset() {
    setPlacement(Object.fromEntries(items.map((it) => [it.id, null])));
    setSelectedItem(null);
    setChecked(false);
  }

  function handleDragStart(e: DragEvent, itemId: string) {
    if (locked) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(DRAG_MIME, itemId);
    e.dataTransfer.setData("text/plain", itemId);
    setDraggingItem(itemId);
    setSelectedItem(null);
  }

  function handleDragEnd() {
    setDraggingItem(null);
    setDragOverTarget(null);
  }

  function isOurDrag(e: DragEvent) {
    return draggingItem !== null || e.dataTransfer.types.includes(DRAG_MIME);
  }

  function handleDragOver(e: DragEvent, target: string) {
    if (locked) return;
    if (!isOurDrag(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverTarget !== target) setDragOverTarget(target);
  }

  function handleDragLeave(target: string) {
    setDragOverTarget((t) => (t === target ? null : t));
  }

  function readDraggedId(e: DragEvent) {
    return e.dataTransfer.getData(DRAG_MIME) || draggingItem;
  }

  function handleDropOnBin(e: DragEvent, binId: string) {
    if (locked) return;
    e.preventDefault();
    const itemId = readDraggedId(e);
    if (!itemId) return;
    setPlacement((p) => ({ ...p, [itemId]: binId }));
    setChecked(false);
    setDraggingItem(null);
    setDragOverTarget(null);
  }

  function handleDropOnTray(e: DragEvent) {
    if (locked) return;
    e.preventDefault();
    const itemId = readDraggedId(e);
    if (!itemId) return;
    setPlacement((p) => ({ ...p, [itemId]: null }));
    setChecked(false);
    setDraggingItem(null);
    setDragOverTarget(null);
  }

  function handleBinKeyDown(e: KeyboardEvent, binId: string) {
    if (locked) return;
    if (!selectedItem) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      placeIn(binId);
    }
  }

  const unplaced = items.filter((it) => !placement[it.id]);
  const trayActive = dragOverTarget === TRAY_TARGET;

  return (
    <div className="space-y-5">
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
        {heading}
      </h2>
      <p className="text-base text-foreground/90 leading-relaxed">{renderInline(prompt)}</p>

      {!locked && (
        <div
          onDragOver={(e) => handleDragOver(e, TRAY_TARGET)}
          onDragLeave={() => handleDragLeave(TRAY_TARGET)}
          onDrop={handleDropOnTray}
          className={cn(
            "rounded-lg border border-dashed p-3 transition-colors",
            trayActive ? "border-primary bg-primary/10" : "border-border bg-muted/10"
          )}
        >
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Drag an item into a bucket — or tap, then tap a bucket
          </div>
          {unplaced.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {unplaced.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  draggable
                  onDragStart={(e) => handleDragStart(e, it.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() =>
                    setSelectedItem((s) => (s === it.id ? null : it.id))
                  }
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm text-foreground transition-colors cursor-grab active:cursor-grabbing",
                    selectedItem === it.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50",
                    draggingItem === it.id && "opacity-50"
                  )}
                >
                  {it.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic">
              All items placed — drop here to send one back to the tray.
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {bins.map((bin) => {
          const inBin = items.filter((it) => placement[it.id] === bin.id);
          const isDragOver = dragOverTarget === bin.id;
          const interactive = !!selectedItem || !!draggingItem;
          return (
            <div
              key={bin.id}
              role="button"
              tabIndex={selectedItem ? 0 : -1}
              aria-disabled={!interactive || locked}
              onClick={() => placeIn(bin.id)}
              onKeyDown={(e) => handleBinKeyDown(e, bin.id)}
              onDragOver={(e) => handleDragOver(e, bin.id)}
              onDragLeave={() => handleDragLeave(bin.id)}
              onDrop={(e) => handleDropOnBin(e, bin.id)}
              className={cn(
                "text-left rounded-lg border-2 border-dashed p-3 min-h-[120px] transition-colors outline-none",
                isDragOver
                  ? "border-primary bg-primary/15"
                  : draggingItem
                  ? "border-primary/60 bg-primary/5"
                  : selectedItem
                  ? "border-primary/60 bg-primary/5 cursor-pointer"
                  : "border-border bg-muted/20",
                !interactive && "cursor-default"
              )}
            >
              <div className="text-sm font-medium text-foreground">{bin.label}</div>
              {bin.hint && (
                <div className="text-[11px] text-muted-foreground mt-0.5">{bin.hint}</div>
              )}
              <div className="mt-3 space-y-1.5">
                {inBin.map((it) => {
                  const isWrong = checked && placement[it.id] !== correctMap[it.id];
                  const isRight = checked && placement[it.id] === correctMap[it.id];
                  return (
                    <div
                      key={it.id}
                      draggable={!locked}
                      onDragStart={(e) => {
                        e.stopPropagation();
                        handleDragStart(e, it.id);
                      }}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => {
                        e.stopPropagation();
                        returnToTray(it.id);
                      }}
                      className={cn(
                        "rounded-md border px-2.5 py-1.5 text-xs transition-colors select-none",
                        isWrong && "border-destructive bg-destructive/10 text-foreground",
                        isRight && "border-success bg-success/10 text-foreground",
                        !checked &&
                          "border-border bg-background hover:border-primary/40 cursor-grab active:cursor-grabbing",
                        draggingItem === it.id && "opacity-50"
                      )}
                    >
                      {it.label}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        {!checked || !allCorrect ? (
          <Button
            size="sm"
            disabled={!allPlaced}
            onClick={() => setChecked(true)}
          >
            Check
          </Button>
        ) : (
          <Badge variant="success">All correct</Badge>
        )}
        {checked && !allCorrect && (
          <>
            <Badge variant="destructive">Some misplaced</Badge>
            <Button size="sm" variant="outline" onClick={reset}>
              Reset
            </Button>
          </>
        )}
      </div>

      {checked && !allCorrect && (
        <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-foreground/90 leading-relaxed space-y-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Misplaced items
          </div>
          {items
            .filter((it) => placement[it.id] && placement[it.id] !== correctMap[it.id])
            .map((it) => (
              <div key={it.id}>
                <strong className="text-foreground">{it.label}</strong>
                {it.reason && <span className="text-foreground/80"> — {it.reason}</span>}
              </div>
            ))}
        </div>
      )}

      {checked && allCorrect && (
        <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm text-foreground/90 leading-relaxed">
          {renderInline(revealOnComplete)}
        </div>
      )}
    </div>
  );
}
