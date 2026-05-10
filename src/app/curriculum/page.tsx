import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { lessons } from "@/content/curriculum";

const levelOrder = ["Foundations", "Intermediate", "Advanced", "Frontier"] as const;

export default function CurriculumIndex() {
  const grouped = levelOrder.map((level) => ({
    level,
    items: lessons.filter((l) => l.level === level),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-12 md:py-16">
      <header className="mb-10 max-w-3xl">
        <Badge variant="outline" className="rounded-full mb-4">
          Curriculum
        </Badge>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
          The QA-for-AI curriculum
        </h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          A working engineer&apos;s path through the field. Foundations to frontier — read
          in any order, but if you&apos;re new, start with{" "}
          <Link
            href="/curriculum/what-is-qa-for-ai"
            className="text-primary underline-offset-4 hover:underline"
          >
            What is QA for AI?
          </Link>
        </p>
      </header>

      <div className="space-y-12">
        {grouped.map(({ level, items }) =>
          items.length === 0 ? null : (
            <section key={level}>
              <div className="mb-4 flex items-baseline gap-3">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  {level}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {items.length} lesson{items.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((lesson) => (
                  <Link
                    key={lesson.slug}
                    href={`/curriculum/${lesson.slug}`}
                    className="group"
                  >
                    <Card className="h-full transition-all group-hover:border-primary/50 group-hover:translate-y-[-2px]">
                      <CardHeader>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">
                            ~{lesson.estMinutes} min
                          </span>
                          {lesson.topics.map((t) => (
                            <Badge key={t} variant="secondary" className="text-[10px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                        <CardTitle className="text-lg leading-snug">
                          {lesson.title}
                        </CardTitle>
                        <CardDescription className="leading-relaxed">
                          {lesson.tagline}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )
        )}
      </div>
    </div>
  );
}
