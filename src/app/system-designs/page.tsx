import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { designs } from "@/content/system-designs";

export default function SystemDesignsIndex() {
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-12 md:py-16">
      <header className="mb-10 max-w-3xl">
        <Badge variant="outline" className="rounded-full mb-4">
          System Designs
        </Badge>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
          Production architectures for AI quality
        </h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          Reference designs for the systems that produce trustworthy quality signals at scale.
          Each one comes with a problem statement, an explicit data flow, a walkthrough,
          tradeoffs, and the metrics you should be tracking.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {designs.map((d) => (
          <Link key={d.slug} href={`/system-designs/${d.slug}`} className="group">
            <Card className="h-full transition-all group-hover:border-primary/50 group-hover:translate-y-[-2px]">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-[10px]">
                    {d.nodes.length} components
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {d.edges.length} flows
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-snug">{d.title}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {d.tagline}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
