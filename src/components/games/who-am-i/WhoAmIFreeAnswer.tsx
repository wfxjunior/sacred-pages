import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";

// Expert input: the reader types the name. A plain labelled form — Enter
// submits natively, no global key handling, no letter cells (that is Word
// Guess's territory).

export function WhoAmIFreeAnswer({
  disabled,
  nudge,
  onGuess,
}: {
  disabled: boolean;
  /** Increment to play the gentle "not yet" nudge (reduced-motion safe). */
  nudge: number;
  onGuess: (guess: string) => void;
}) {
  const { t } = useI18n();
  const [value, setValue] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!value.trim()) return;
    onGuess(value);
    setValue("");
  };

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-md">
      <label
        htmlFor="whoami-answer"
        className="block text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
      >
        {t("whoami.whoLabel")}
      </label>
      <div
        key={nudge}
        className={`mt-3 flex items-center gap-2 ${
          nudge > 0 ? "motion-safe:animate-[wg-nudge_0.35s_ease-in-out]" : ""
        }`}
      >
        <Input
          id="whoami-answer"
          value={value}
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t("whoami.freePlaceholder")}
          autoComplete="off"
          autoCapitalize="characters"
          className="bg-card font-serif uppercase tracking-[0.08em]"
        />
        <Button
          type="submit"
          disabled={disabled || !value.trim()}
          className="shrink-0 rounded-full"
        >
          <Check className="mr-1.5 h-4 w-4" aria-hidden="true" />
          {t("whoami.submit")}
        </Button>
      </div>
    </form>
  );
}
