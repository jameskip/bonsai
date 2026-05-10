import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getLesson, lessons } from "@/content/curriculum";
import { getDesign } from "@/content/system-designs";
import { getLab } from "@/content/labs";
import { LessonStepper } from "@/components/lesson-stepper";
import { ReferenceList } from "@/components/reference-list";

export function generateStaticParams() {
  return lessons.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return {};
  return {
    title: `${lesson.title} · Bonsai`,
    description: lesson.tagline,
  };
}

function renderInline(text: string) {
  const parts: (string | { code?: string; bold?: string })[] = [];
  const rest = text;
  const re = /`([^`]+)`|\*\*([^*]+)\*\*/g;
  let last = 0;
  for (const match of rest.matchAll(re)) {
    const idx = match.index ?? 0;
    if (idx > last) parts.push(rest.slice(last, idx));
    if (match[1]) parts.push({ code: match[1] });
    else if (match[2]) parts.push({ bold: match[2] });
    last = idx + match[0].length;
  }
  if (last < rest.length) parts.push(rest.slice(last));
  return parts.map((p, i) => {
    if (typeof p === "string") return <span key={i}>{p}</span>;
    if (p.code) return <code key={i}>{p.code}</code>;
    if (p.bold) return <strong key={i} className="text-foreground">{p.bold}</strong>;
    return null;
  });
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  const idx = lessons.findIndex((l) => l.slug === slug);
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx < lessons.length - 1 ? lessons[idx + 1] : null;

  const relatedLabs = (lesson.relatedLabs ?? [])
    .map((s) => getLab(s))
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .map((l) => ({ slug: l.slug, title: l.title }));
  const relatedDesigns = (lesson.relatedDesigns ?? [])
    .map((s) => getDesign(s))
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .map((d) => ({ slug: d.slug, title: d.title, tagline: d.tagline }));

  if (lesson.blocks && lesson.blocks.length > 0) {
    return (
      <LessonStepper
        lesson={lesson}
        prevSlug={prev?.slug}
        prevTitle={prev?.title}
        nextSlug={next?.slug}
        nextTitle={next?.title}
        relatedLabs={relatedLabs}
        relatedDesigns={relatedDesigns}
      />
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 md:px-6 py-12 md:py-16">
      <Link
        href="/curriculum"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Curriculum
      </Link>

      <header className="mt-6 mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="default">{lesson.level}</Badge>
          <span className="text-xs text-muted-foreground">~{lesson.estMinutes} min read</span>
          {lesson.topics.map((t) => (
            <Badge key={t} variant="secondary" className="text-[10px]">
              {t}
            </Badge>
          ))}
          {lesson.references && lesson.references.length > 0 && (
            <span className="text-[10px] rounded-full border border-border bg-muted/40 px-2 py-0.5 text-muted-foreground">
              {lesson.references.length} refs
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-tight">
          {lesson.title}
        </h1>
        <p className="text-lg text-muted-foreground mt-3 leading-relaxed">
          {lesson.tagline}
        </p>
      </header>

      <div className="prose-qa">
        <p className="text-foreground/95 text-base leading-relaxed">{lesson.intro}</p>

        {(lesson.sections ?? []).map((s) => (
          <div key={s.heading}>
            <h2>{s.heading}</h2>
            <p>{renderInline(s.body)}</p>
          </div>
        ))}

        <h2>Key takeaways</h2>
        <ul>
          {lesson.takeaways.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      {lesson.references && lesson.references.length > 0 && (
        <>
          <Separator className="my-10" />
          <div>
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground mb-4">
              References & further reading
            </h2>
            <ReferenceList references={lesson.references} />
          </div>
        </>
      )}

      {(relatedLabs.length > 0 || relatedDesigns.length > 0) && (
        <>
          <Separator className="my-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedLabs.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Try the lab
                </h3>
                <div className="space-y-2">
                  {relatedLabs.map((lab) => (
                    <Link key={lab.slug} href={`/labs/${lab.slug}`} className="group">
                      <Card className="transition-all group-hover:border-primary/50">
                        <CardHeader>
                          <CardTitle className="text-base">{lab.title}</CardTitle>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {relatedDesigns.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  See the design
                </h3>
                <div className="space-y-2">
                  {relatedDesigns.map((d) => (
                    <Link
                      key={d.slug}
                      href={`/system-designs/${d.slug}`}
                      className="group"
                    >
                      <Card className="transition-all group-hover:border-primary/50">
                        <CardHeader>
                          <CardTitle className="text-base">{d.title}</CardTitle>
                          <CardDescription>{d.tagline}</CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <Separator className="my-10" />
      <nav className="flex items-center justify-between gap-4">
        {prev ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`/curriculum/${prev.slug}`}>← {prev.title}</Link>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button asChild size="sm">
            <Link href={`/curriculum/${next.slug}`}>{next.title} →</Link>
          </Button>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
