import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApiKeyManager } from "@/components/api-key-manager";
import { labs } from "@/content/labs";

export default function LabsIndex() {
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-12 md:py-16">
      <header className="mb-8 max-w-3xl">
        <Badge variant="outline" className="rounded-full mb-4">
          Interactive Labs
        </Badge>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
          Hands-on labs, wired to live Claude calls
        </h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          Each lab calls a server route that proxies to the Anthropic API with
          prompt caching, structured outputs, and adaptive thinking. Bring your
          own API key — it&apos;s stored in your browser only and sent through
          on each lab call. Calls run on the model{" "}
          <code className="text-foreground bg-muted rounded px-1.5 py-0.5">
            claude-opus-4-7
          </code>
          .
        </p>
      </header>

      <div className="mb-10">
        <ApiKeyManager />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {labs.map((lab) => (
          <Link key={lab.slug} href={`/labs/${lab.slug}`} className="group">
            <Card className="h-full transition-all group-hover:border-primary/50 group-hover:translate-y-[-2px]">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant="default">{lab.level}</Badge>
                  <span className="text-xs text-muted-foreground">~{lab.estMinutes} min</span>
                  {lab.requiresApiKey && (
                    <Badge variant="warning" className="text-[10px]">
                      requires API key
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg leading-snug">{lab.title}</CardTitle>
                <CardDescription className="leading-relaxed">{lab.tagline}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
