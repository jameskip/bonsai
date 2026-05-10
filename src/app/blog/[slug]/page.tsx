import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getPost, postsSorted } from "@/content/blog";
import { renderInline } from "@/lib/render-inline";

export function generateStaticParams() {
  return postsSorted().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} · Bonsai`,
    description: post.dek,
  };
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function renderParagraphs(body: string) {
  return body.split("\n\n").map((para, i) => (
    <p key={i}>{renderInline(para)}</p>
  ));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const all = postsSorted();
  const idx = all.findIndex((p) => p.slug === slug);
  const newer = idx > 0 ? all[idx - 1] : null;
  const older = idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <article className="mx-auto max-w-3xl px-4 md:px-6 py-12 md:py-16">
      <Link
        href="/blog"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Blog
      </Link>

      <header className="mt-6 mb-10">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {dateFormatter.format(new Date(post.date))} · ~{post.readMinutes} min
            read
          </span>
          {post.tags.map((t) => (
            <Badge key={t} variant="secondary" className="text-[10px]">
              {t}
            </Badge>
          ))}
        </div>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground leading-[1.1]">
          {post.title}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-4 leading-relaxed">
          {post.dek}
        </p>
        <div className="mt-6 flex items-center gap-3 text-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary font-mono text-xs">
            {post.author.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <div className="text-foreground font-medium">{post.author.name}</div>
            <div className="text-muted-foreground text-xs">
              {post.author.bio}
            </div>
          </div>
        </div>
      </header>

      <div className="prose-qa">
        {renderParagraphs(post.intro)}

        {post.sections.map((s) => (
          <div key={s.heading}>
            <h2>{s.heading}</h2>
            {renderParagraphs(s.body)}
          </div>
        ))}

        {post.closing && (
          <blockquote className="mt-8">
            {renderInline(post.closing)}
          </blockquote>
        )}
      </div>

      <Separator className="my-10" />
      <nav className="flex items-center justify-between gap-4">
        {older ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`/blog/${older.slug}`}>← {older.title}</Link>
          </Button>
        ) : (
          <span />
        )}
        {newer ? (
          <Button asChild size="sm">
            <Link href={`/blog/${newer.slug}`}>{newer.title} →</Link>
          </Button>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
