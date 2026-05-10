"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/curriculum", label: "Curriculum" },
  { href: "/labs", label: "Labs" },
  { href: "/system-designs", label: "System Designs" },
  { href: "/quizzes", label: "Quizzes" },
  { href: "/blog", label: "Blog" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="glass-nav sticky top-0 z-40 w-full">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
            B
          </div>
          <span className="font-semibold tracking-tight text-foreground">Bonsai</span>
          <span className="hidden md:inline text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">
            Cultivate AI you can trust
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
