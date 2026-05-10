import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { postsSorted } from "@/content/blog";

export const metadata: Metadata = {
  title: "Blog · Bonsai",
  description:
    "Field notes on evaluating AI systems in production. Opinionated, technical, no fluff.",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function BlogIndex() {
  const posts = postsSorted();
  const [featured, ...rest] = posts;

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-12 md:py-16">
      <header className="mb-12 max-w-3xl">
        <Badge variant="outline" className="rounded-full mb-4">
          Blog
        </Badge>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
          Field notes on AI quality
        </h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          Opinions, observations, and arguments from the front line of
          evaluating AI systems in production. Written for the engineers and
          leaders who have to ship.
        </p>
      </header>

      {featured && (
        <Link href={`/blog/${featured.slug}`} className="group block mb-12">
          <Card className="transition-all group-hover:border-primary/50 group-hover:translate-y-[-2px]">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">Latest</Badge>
                <span className="text-xs text-muted-foreground">
                  {dateFormatter.format(new Date(featured.date))} · ~
                  {featured.readMinutes} min read
                </span>
                {featured.tags.slice(0, 3).map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px]">
                    {t}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-2xl md:text-3xl leading-snug">
                {featured.title}
              </CardTitle>
              <CardDescription className="text-base leading-relaxed mt-2">
                {featured.dek}
              </CardDescription>
              <div className="text-xs text-muted-foreground mt-4">
                By {featured.author.name}
              </div>
            </CardHeader>
          </Card>
        </Link>
      )}

      {rest.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold tracking-tight text-foreground mb-4">
            More posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group"
              >
                <Card className="h-full transition-all group-hover:border-primary/50 group-hover:translate-y-[-2px]">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {dateFormatter.format(new Date(post.date))} · ~
                        {post.readMinutes} min
                      </span>
                      {post.tags.slice(0, 2).map((t) => (
                        <Badge
                          key={t}
                          variant="secondary"
                          className="text-[10px]"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="text-lg leading-snug">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="leading-relaxed">
                      {post.dek}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
