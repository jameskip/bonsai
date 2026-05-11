import { BonsaiMark } from "@/components/ui/bonsai-mark";

export function SiteFooter() {
  return (
    <footer className="glass-footer mt-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <BonsaiMark className="h-6 w-6 shrink-0" />
          <span className="text-primary font-semibold lowercase">bonsai</span>
          <span>· Cultivate AI you can trust</span>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-6">
          <span>Curriculum · Labs · System Designs · Quizzes</span>
          <span>Built for engineers shipping AI in production.</span>
        </div>
      </div>
    </footer>
  );
}
