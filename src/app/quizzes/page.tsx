import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { quizzes } from "@/content/quizzes";

export default function QuizzesIndex() {
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-12 md:py-16">
      <header className="mb-10 max-w-3xl">
        <Badge variant="outline" className="rounded-full mb-4">
          Quizzes
        </Badge>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
          Scenario quizzes
        </h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          Less &quot;what does this acronym stand for&quot;, more &quot;your eval moved 3 points
          and the team is asking what to do&quot;. Pick a module and pressure-test your judgment.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quizzes.map((q) => (
          <Link key={q.slug} href={`/quizzes/${q.slug}`} className="group">
            <Card className="h-full transition-all group-hover:border-primary/50 group-hover:translate-y-[-2px]">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">{q.level}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {q.questions.length} questions · ~{q.estMinutes} min
                  </span>
                </div>
                <CardTitle className="text-lg leading-snug">{q.title}</CardTitle>
                <CardDescription className="leading-relaxed">{q.tagline}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
