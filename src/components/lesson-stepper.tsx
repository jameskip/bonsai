"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Lesson, LessonBlock } from "@/content/curriculum";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ProseBlock } from "@/components/lesson-blocks/prose-block";
import { ListBlock } from "@/components/lesson-blocks/list-block";
import { CheckpointBlock } from "@/components/lesson-blocks/checkpoint-block";
import { SliderBlock } from "@/components/lesson-blocks/slider-block";
import { SortBinsBlock } from "@/components/lesson-blocks/sort-bins-block";
import { PairwiseBlock } from "@/components/lesson-blocks/pairwise-block";
import { RevealBlock } from "@/components/lesson-blocks/reveal-block";
import { ReferenceList } from "@/components/reference-list";

export function LessonStepper({
  lesson,
  prevSlug,
  prevTitle,
  nextSlug,
  nextTitle,
  relatedLabs,
  relatedDesigns,
}: {
  lesson: Lesson;
  prevSlug?: string;
  prevTitle?: string;
  nextSlug?: string;
  nextTitle?: string;
  relatedLabs: { slug: string; title: string }[];
  relatedDesigns: { slug: string; title: string }[];
}) {
  const blocks = lesson.blocks ?? [];
  const references = lesson.references ?? [];
  const hasRefs = references.length > 0;
  const refsStepIndex = hasRefs ? blocks.length : -1;
  const summaryStepIndex = blocks.length + (hasRefs ? 1 : 0);
  const total = summaryStepIndex + 1;
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  function markComplete(idx: number) {
    setCompleted((c) => (c[idx] ? c : { ...c, [idx]: true }));
  }

  const onRefs = hasRefs && step === refsStepIndex;
  const onSummary = step === summaryStepIndex;
  const onBlock = !onRefs && !onSummary;
  const currentBlock = onBlock ? blocks[step] : null;
  const isCompleted = onBlock && !!completed[step];
  const isSkippable =
    onBlock && currentBlock && currentBlock.kind !== "prose" && !isCompleted;

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-12 md:py-16">
      <div ref={topRef} />
      <Link
        href="/curriculum"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Curriculum
      </Link>

      <header className="mt-6 mb-8">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge variant="default">{lesson.level}</Badge>
          <span className="text-xs text-muted-foreground">~{lesson.estMinutes} min</span>
          {lesson.topics.map((t) => (
            <Badge key={t} variant="secondary" className="text-[10px]">
              {t}
            </Badge>
          ))}
          {hasRefs && (
            <button
              type="button"
              onClick={() => setStep(refsStepIndex)}
              className="text-[10px] rounded-full border border-border bg-muted/40 px-2 py-0.5 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
              title="Jump to references"
            >
              {references.length} refs ↗
            </button>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-tight">
          {lesson.title}
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 leading-relaxed">
          {lesson.tagline}
        </p>
      </header>

      <div className="flex items-center gap-1.5 mb-8">
        {Array.from({ length: total }).map((_, i) => {
          const isCurrent = i === step;
          const isVisited = i < step || (i === blocks.length && step === blocks.length);
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (i <= step) setStep(i);
              }}
              disabled={i > step}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                isCurrent
                  ? "bg-primary"
                  : isVisited
                  ? "bg-primary/40"
                  : "bg-muted",
                i <= step && "cursor-pointer"
              )}
              aria-label={`Step ${i + 1} of ${total}`}
            />
          );
        })}
      </div>

      <div className="text-xs text-muted-foreground font-mono mb-6">
        {onSummary
          ? `Summary · ${total} of ${total}`
          : onRefs
          ? `References · ${step + 1} of ${total}`
          : `Step ${step + 1} of ${total}`}
      </div>

      <div className="min-h-[300px]">
        {onBlock && currentBlock && (
          <BlockRenderer
            key={step}
            block={currentBlock}
            onComplete={() => markComplete(step)}
            refsCount={hasRefs ? references.length : 0}
            onJumpToRefs={hasRefs ? () => setStep(refsStepIndex) : undefined}
          />
        )}

        {onRefs && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
                References & further reading
              </h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Primary sources behind this lesson — papers, official docs, frameworks, and
                field write-ups. Use these to go deeper or to cite when sharing.
              </p>
            </div>
            <ReferenceList references={references} />
          </div>
        )}

        {onSummary && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground mb-3">
                Key takeaways
              </h2>
              <ul className="space-y-2">
                {lesson.takeaways.map((t) => (
                  <li
                    key={t}
                    className="flex items-start gap-3 text-base text-foreground/90 leading-relaxed"
                  >
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {hasRefs && (
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Further reading
                </div>
                <ReferenceList references={references} />
              </div>
            )}

            {(relatedLabs.length > 0 || relatedDesigns.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {relatedLabs.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      Try the lab
                    </div>
                    <div className="space-y-2">
                      {relatedLabs.map((lab) => (
                        <Link
                          key={lab.slug}
                          href={`/labs/${lab.slug}`}
                          className="block rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground hover:border-primary/50"
                        >
                          {lab.title} →
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {relatedDesigns.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      See the design
                    </div>
                    <div className="space-y-2">
                      {relatedDesigns.map((d) => (
                        <Link
                          key={d.slug}
                          href={`/system-designs/${d.slug}`}
                          className="block rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground hover:border-primary/50"
                        >
                          {d.title} →
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6">
        {step > 0 ? (
          <Button variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>
            ← Back
          </Button>
        ) : prevSlug && prevTitle ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`/curriculum/${prevSlug}`}>← {prevTitle}</Link>
          </Button>
        ) : (
          <span />
        )}

        {!onSummary ? (
          <Button
            size="sm"
            variant={isSkippable ? "outline" : "default"}
            onClick={() => setStep((s) => s + 1)}
          >
            {isSkippable ? "Skip →" : "Continue →"}
          </Button>
        ) : nextSlug && nextTitle ? (
          <Button asChild size="sm">
            <Link href={`/curriculum/${nextSlug}`}>{nextTitle} →</Link>
          </Button>
        ) : (
          <Button asChild size="sm" variant="outline">
            <Link href="/curriculum">Back to curriculum</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function BlockRenderer({
  block,
  onComplete,
  refsCount,
  onJumpToRefs,
}: {
  block: LessonBlock;
  onComplete: () => void;
  refsCount?: number;
  onJumpToRefs?: () => void;
}) {
  switch (block.kind) {
    case "prose":
      return (
        <ProseBlock
          heading={block.heading}
          body={block.body}
          refsCount={refsCount}
          onJumpToRefs={onJumpToRefs}
        />
      );
    case "list":
      return (
        <ListBlock
          heading={block.heading}
          intro={block.intro}
          style={block.style}
          items={block.items}
          outro={block.outro}
          refsCount={refsCount}
          onJumpToRefs={onJumpToRefs}
        />
      );
    case "checkpoint":
      return (
        <CheckpointBlock
          prompt={block.prompt}
          options={block.options}
          explanation={block.explanation}
          onComplete={onComplete}
        />
      );
    case "slider":
      return (
        <SliderBlock
          heading={block.heading}
          body={block.body}
          variant={block.variant}
          param={block.param}
          reveal={block.reveal}
          onComplete={onComplete}
        />
      );
    case "sortBins":
      return (
        <SortBinsBlock
          heading={block.heading}
          prompt={block.prompt}
          bins={block.bins}
          items={block.items}
          revealOnComplete={block.revealOnComplete}
          onComplete={onComplete}
        />
      );
    case "pairwise":
      return (
        <PairwiseBlock
          heading={block.heading}
          body={block.body}
          a={block.a}
          b={block.b}
          naivePicks={block.naivePicks}
          truth={block.truth}
          reveal={block.reveal}
          onComplete={onComplete}
        />
      );
    case "reveal":
      return (
        <RevealBlock
          heading={block.heading}
          body={block.body}
          cta={block.cta}
          hidden={block.hidden}
          onComplete={onComplete}
        />
      );
  }
}
