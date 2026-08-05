import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { AppShell } from "@/components/site/AppShell";
import { Button } from "@/components/ui/button";
import { WordGuessGame } from "@/components/games/word-guess/WordGuessGame";
import { WhoAmIGame } from "@/components/games/who-am-i/WhoAmIGame";
import {
  dailyChallengeDateKey,
  dailyChallengeFor,
  isDailyChallengeDone,
  markDailyChallengeDone,
} from "@/lib/daily-challenge/engine";
import { GAME_REGISTRY } from "@/lib/games";
import { useI18n } from "@/lib/i18n";
import { encouragementKey } from "@/lib/journey/consistency";
import { useConsistency } from "@/lib/journey/hooks";

// The Daily Challenge: the same deterministic round for everyone on a given
// day. Word-search days hand the reader to Today's Journey; question days
// embed the round right here. Completion is remembered per device — the
// GameProgressStore contract is the future server-side upgrade path.

const GAME = GAME_REGISTRY.daily_challenge;

export const Route = createFileRoute("/play/daily")({
  head: () => ({
    meta: [
      { title: "Daily Challenge — Lumena" },
      {
        name: "description",
        content: "One curated Scripture round each day, across every game mode.",
      },
    ],
  }),
  component: DailyChallengePage,
});

function DailyChallengePage() {
  const { t, locale } = useI18n();
  // The date is resolved after hydration so SSR and client never disagree
  // around midnight — the same guard Today's Journey uses.
  const [date, setDate] = useState(() => dailyChallengeDateKey());
  const [done, setDone] = useState(false);
  useEffect(() => {
    const today = dailyChallengeDateKey();
    setDate(today);
    setDone(isDailyChallengeDone(today));
  }, []);

  const challenge = useMemo(() => dailyChallengeFor(date, locale), [date, locale]);

  const finish = () => {
    markDailyChallengeDone(date);
    setDone(true);
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl px-1 py-6 sm:py-10">
        <header className="mb-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--walnut)" }}>
            {t("games.eyebrow")}
          </p>
          <h1 className="mt-1 font-serif text-3xl leading-tight sm:text-4xl">{t(GAME.nameKey)}</h1>
          <p className="mx-auto mt-2 flex max-w-md items-center justify-center gap-1.5 text-[13px] text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            {date}
          </p>
        </header>

        {done ? (
          <DailyChallengeDone />
        ) : challenge.mode === "word_search" ? (
          <div className="mx-auto max-w-md rounded-2xl border border-border/60 bg-card p-6 text-center">
            <span
              className="mx-auto grid h-10 w-10 place-items-center rounded-full"
              style={{ background: "color-mix(in oklab, var(--gold) 14%, transparent)" }}
            >
              <Sparkles className="h-5 w-5" style={{ color: "var(--gold)" }} aria-hidden="true" />
            </span>
            <p className="mt-3 font-serif text-2xl">{t("daily.wordSearchTitle")}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              {t("daily.wordSearchBody")}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button asChild className="rounded-full">
                <Link to="/today">
                  {t("nav.today")} <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" className="rounded-full" onClick={finish}>
                {t("daily.markDone")}
              </Button>
            </div>
          </div>
        ) : challenge.mode === "word_guess" ? (
          <WordGuessGame
            key={`daily:${date}`}
            question={challenge.question}
            onContinue={finish}
            onTryAnother={finish}
          />
        ) : (
          <WhoAmIGame
            key={`daily:${date}`}
            question={challenge.question}
            onContinue={finish}
            onTryAnother={finish}
          />
        )}
      </div>
    </AppShell>
  );
}

function DailyChallengeDone() {
  const { t } = useI18n();
  const { summary, signedIn } = useConsistency();
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border/60 bg-card p-6 text-center">
      <span
        className="mx-auto grid h-10 w-10 place-items-center rounded-full"
        style={{ background: "color-mix(in oklab, var(--gold) 14%, transparent)" }}
      >
        <CheckCircle2 className="h-5 w-5" style={{ color: "var(--gold)" }} aria-hidden="true" />
      </span>
      <p className="mt-3 font-serif text-2xl">{t("daily.doneTitle")}</p>
      <p className="mt-2 text-[14px] text-muted-foreground">{t("daily.doneBody")}</p>
      {signedIn && (
        <p className="mt-3 text-sm" style={{ color: "var(--walnut)" }}>
          {t(encouragementKey(summary))}
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/play">{t("games.hub.title")}</Link>
        </Button>
        <Button asChild className="rounded-full">
          <Link to="/today">{t("nav.today")}</Link>
        </Button>
      </div>
    </div>
  );
}
