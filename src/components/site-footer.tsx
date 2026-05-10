export function SiteFooter() {
  return (
    <footer className="glass-footer mt-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm text-muted-foreground">
        <div>
          <span className="text-foreground font-medium">Bonsai</span> · Cultivate AI you can trust
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-6">
          <span>Curriculum · Labs · System Designs · Quizzes</span>
          <span>Built for engineers shipping AI in production.</span>
        </div>
      </div>
    </footer>
  );
}
