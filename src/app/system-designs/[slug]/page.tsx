import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DesignDiagram } from "@/components/design-diagram";
import { designs, getDesign } from "@/content/system-designs";

export function generateStaticParams() {
  return designs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = getDesign(slug);
  if (!d) return {};
  return { title: `${d.title} · qa4ai`, description: d.tagline };
}

export default async function DesignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = getDesign(slug);
  if (!d) notFound();

  return (
    <article className="mx-auto max-w-4xl px-4 md:px-6 py-12 md:py-16">
      <Link
        href="/system-designs"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← System Designs
      </Link>

      <header className="mt-6 mb-10">
        <Badge variant="default">System Design</Badge>
        <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-tight">
          {d.title}
        </h1>
        <p className="text-lg text-muted-foreground mt-2 leading-relaxed">{d.tagline}</p>
      </header>

      <section className="space-y-8 prose-qa">
        <div>
          <h2>Problem</h2>
          <p>{d.problem}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {d.goals.map((g) => (
                  <li key={g} className="flex gap-2">
                    <span className="text-success mt-0.5">✓</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Non-goals</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {d.nonGoals.map((g) => (
                  <li key={g} className="flex gap-2">
                    <span className="text-muted-foreground mt-0.5">·</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2>Architecture</h2>
          <DesignDiagram nodes={d.nodes} edges={d.edges} />
        </div>

        <div>
          <h2>Walkthrough</h2>
          <div className="space-y-4">
            {d.walkthrough.map((w) => (
              <div key={w.heading}>
                <h3>{w.heading}</h3>
                <p>{w.body}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-2" />

        <div>
          <h2>Tradeoffs</h2>
          <div className="space-y-3 not-prose">
            {d.tradeoffs.map((t, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="text-sm font-medium text-foreground">{t.decision}</div>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        Chose
                      </div>
                      <div className="text-success">{t.chose}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        Over
                      </div>
                      <div className="text-foreground/80">{t.over}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        Because
                      </div>
                      <div className="text-muted-foreground">{t.because}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2>Metrics to track</h2>
          <ul>
            {d.metrics.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  );
}
