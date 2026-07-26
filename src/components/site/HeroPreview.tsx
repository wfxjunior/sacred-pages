import { TODAY } from "@/lib/mock-data";
import heroLibrary from "@/assets/hero-library.jpg";

export function HeroPreview() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[2rem] opacity-70"
        style={{
          background:
            "radial-gradient(60% 60% at 30% 20%, color-mix(in oklab, var(--gold) 18%, transparent), transparent 60%), radial-gradient(50% 50% at 80% 80%, color-mix(in oklab, var(--sage) 14%, transparent), transparent 60%)",
        }}
      />
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_20px_60px_-30px_rgba(60,45,20,0.35)]">
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <img
            src={heroLibrary}
            alt="Warm library scene with olive branches"
            width={1280}
            height={960}
            className="h-full w-full object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 55%, color-mix(in oklab, var(--ivory) 85%, transparent) 100%)",
            }}
          />
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-[1.1fr_1fr]">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-widest" style={{ color: "var(--walnut)" }}>
              {TODAY.reference}
            </p>
            <h3 className="font-serif text-2xl leading-tight">{TODAY.title}</h3>
            <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
              {TODAY.devotional}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {TODAY.words.slice(0, 4).map((w) => (
                <span
                  key={w}
                  className="rounded-full border border-border px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
          <MiniGrid />
        </div>
      </div>
    </div>
  );
}

function MiniGrid() {
  const letters = "SGRATITUDEHFAITHNPEACEPRAYERHOPEGRACEBIMOTREAVIWCXQZJDLPYFKNTUEV".slice(0, 64);
  const highlighted = new Set([1, 2, 3, 4, 5, 6, 7, 8, 17, 24, 25, 26, 27, 28]);
  return (
    <div className="grid grid-cols-8 gap-1 rounded-lg border border-border/70 bg-background/60 p-3">
      {Array.from(letters).map((l, i) => (
        <div
          key={i}
          className="flex aspect-square items-center justify-center rounded-sm text-[11px] font-medium uppercase text-foreground/80"
          style={{
            background: highlighted.has(i)
              ? "color-mix(in oklab, var(--gold) 22%, transparent)"
              : "transparent",
          }}
        >
          {l}
        </div>
      ))}
    </div>
  );
}