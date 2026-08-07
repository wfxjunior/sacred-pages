import { Eraser, Eye, Lightbulb, Sparkles } from "lucide-react";
import { gamePillClass } from "@/components/games/controlStyles";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n";
import type { WordGuessSettings, WordGuessState } from "@/lib/word-guess/types";

// Secondary controls, styled after the word-search toolbar: quiet pill
// buttons that never compete with the answer board. Revealing the full answer
// is the only destructive act here, so it is the only one behind a confirm.

const pillClass = gamePillClass;

export function WordGuessControls({
  state,
  settings,
  onHint,
  onRevealLetter,
  onRevealAnswer,
  onClear,
}: {
  state: WordGuessState;
  settings: WordGuessSettings;
  onHint: () => void;
  onRevealLetter: () => void;
  onRevealAnswer: () => void;
  onClear: () => void;
}) {
  const { t } = useI18n();
  const over =
    state.status === "completed" || state.status === "revealed" || state.status === "failed";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {settings.hintAvailable && (
        <button
          type="button"
          onClick={onHint}
          disabled={over || state.hintUsed}
          className={pillClass}
        >
          <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
          {t("wordguess.showHint")}
        </button>
      )}
      {settings.revealLetterAvailable && (
        <button type="button" onClick={onRevealLetter} disabled={over} className={pillClass}>
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          {t("wordguess.revealLetter")}
        </button>
      )}
      <button type="button" onClick={onClear} disabled={over} className={pillClass}>
        <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
        {t("ui.clear")}
      </button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button type="button" disabled={over} className={pillClass}>
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            {t("wordguess.revealAnswer")}
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("wordguess.revealConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("wordguess.revealConfirmBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("ui.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={onRevealAnswer}>
              {t("wordguess.revealAnswer")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
