import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { QuizRunner } from "@/components/quiz-runner";
import { quizzes, getQuiz } from "@/content/quizzes";

export function generateStaticParams() {
  return quizzes.map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const q = getQuiz(slug);
  if (!q) return {};
  return { title: `${q.title} · Bonsai`, description: q.tagline };
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const q = getQuiz(slug);
  if (!q) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-12 md:py-16">
      <Link href="/quizzes" className="text-sm text-muted-foreground hover:text-foreground">
        ← Quizzes
      </Link>
      <header className="mt-6 mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="default">{q.level}</Badge>
          <span className="text-xs text-muted-foreground">
            {q.questions.length} questions · ~{q.estMinutes} min
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-tight">
          {q.title}
        </h1>
        <p className="text-lg text-muted-foreground mt-2 leading-relaxed">{q.tagline}</p>
      </header>
      <QuizRunner quiz={q} />
    </div>
  );
}
