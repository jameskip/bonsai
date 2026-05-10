import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { lessons } from "@/content/curriculum";
import { labs } from "@/content/labs";
import { designs } from "@/content/system-designs";
import { quizzes } from "@/content/quizzes";

const pillars = [
  {
    title: "Curriculum",
    href: "/curriculum",
    blurb:
      "Lessons that take you from 'what even is an eval' to long-horizon agent testing. Built for engineers, not marketers.",
    count: lessons.length,
    label: "lessons",
  },
  {
    title: "Interactive Labs",
    href: "/labs",
    blurb:
      "Hands-on exercises wired to live Claude calls: build judges, score groundedness, attempt prompt injection, see the bias.",
    count: labs.length,
    label: "labs",
  },
  {
    title: "System Designs",
    href: "/system-designs",
    blurb:
      "Production-grade architectures for eval pipelines, RAG harnesses, agent harnesses, observability, and CI/CD.",
    count: designs.length,
    label: "designs",
  },
  {
    title: "Quizzes",
    href: "/quizzes",
    blurb:
      "Scenario quizzes that test whether you'd make the right call when an eval moves 3 points or a judge agrees with you 42% of the time.",
    count: quizzes.length,
    label: "modules",
  },
];

const principles = [
  {
    title: "Distributions over assertions",
    body: "AI outputs are probabilistic. Single pass/fail tests lie. Measure with samples, score with rubrics, gate on statistical deltas.",
  },
  {
    title: "Trace everything",
    body: "What the model thought, which tool it picked, what it retrieved, what it returned. Outcomes alone don't tell you why something broke.",
  },
  {
    title: "Loop production back to evals",
    body: "Every shipped failure is a permanent regression test. Triage queues are how the eval set actually gets good.",
  },
  {
    title: "Respect your judges",
    body: "LLM-as-judge is the most cost-effective scoring tool — and the most common source of false confidence. Calibrate against humans.",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/80">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-4 md:px-6 py-20 md:py-28">
          <div className="flex flex-col items-start gap-6 max-w-3xl animate-fade-up">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-foreground">
              Quality assurance, <br />
              for systems that <span className="gradient-text">don&apos;t repeat themselves</span>.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Bonsai teaches you to test AI systems the way the frontier actually does it:
              evals as datasets, LLM-as-judge with calibration, RAG and agent harnesses,
              red-teaming, drift detection, and CI/CD that respects statistical noise.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg">
                <Link href="/curriculum/what-is-qa-for-ai">Start the curriculum</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/labs/llm-as-judge">Try a live lab</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/system-designs/eval-pipeline">See the system designs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
              Four ways in
            </h2>
            <p className="text-muted-foreground mt-1">
              Read it, run it, design it, prove it.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillars.map((p) => (
            <Link key={p.href} href={p.href} className="group">
              <Card className="h-full transition-all group-hover:border-primary/50 group-hover:translate-y-[-2px]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{p.title}</CardTitle>
                    <Badge variant="secondary">
                      {p.count} {p.label}
                    </Badge>
                  </div>
                  <CardDescription className="text-base leading-relaxed mt-2">
                    {p.blurb}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-primary group-hover:underline">
                    Open {p.title.toLowerCase()} →
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section className="border-t border-border/80 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-16">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
              The four principles
            </h2>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              Every lesson, lab, and design on this site reduces to one of these. Internalize
              them and the rest is technique.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {principles.map((p, i) => (
              <Card key={p.title}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary text-sm font-mono">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <CardTitle className="text-base">{p.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed mt-2">
                    {p.body}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured lessons */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
              Featured lessons
            </h2>
            <p className="text-muted-foreground mt-1">
              Start anywhere. Each lesson stands alone.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/curriculum">All {lessons.length} lessons →</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {lessons.slice(0, 3).map((lesson) => (
            <Link key={lesson.slug} href={`/curriculum/${lesson.slug}`} className="group">
              <Card className="h-full transition-all group-hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">{lesson.level}</Badge>
                    <span className="text-xs text-muted-foreground">
                      ~{lesson.estMinutes} min
                    </span>
                  </div>
                  <CardTitle className="text-lg leading-snug">{lesson.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {lesson.tagline}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
