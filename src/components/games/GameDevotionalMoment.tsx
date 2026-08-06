import { BookOpen } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// The quiet page that follows every finished round — modeled on a printed
// puzzle devotional: the verse, what it means, and a closing prayer, always
// in that order. Games pass whichever parts their content carries; the
// sequence never changes.

export function GameDevotionalMoment({
  reference,
  verseText,
  explanation,
  prayer,
}: {
  reference?: string;
  verseText?: string;
  explanation?: string;
  prayer?: string;
}) {
  const { t } = useI18n();
  if (!reference && !verseText && !explanation && !prayer) return null;
  return (
    <section
      aria-label={t("games.moment.label")}
      className="mx-auto mt-6 w-full max-w-xl rounded-2xl border border-border/60 bg-card/70 p-5 text-left sm:p-6"
    >
      {reference && (
        <p
          className="flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--walnut)" }}
        >
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          {reference}
        </p>
      )}
      {verseText && (
        <p className="mt-3 text-center font-serif text-[17px] leading-relaxed">“{verseText}”</p>
      )}
      {explanation && (
        <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">{explanation}</p>
      )}
      {prayer && (
        <>
          <div className="mx-auto mt-5 h-px w-16 bg-border" aria-hidden="true" />
          <p className="mt-4 text-[14px] italic leading-relaxed" style={{ color: "var(--walnut)" }}>
            {prayer}
          </p>
        </>
      )}
    </section>
  );
}
