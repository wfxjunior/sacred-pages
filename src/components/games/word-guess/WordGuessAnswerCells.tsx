import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import type { WordGuessCell, WordGuessState } from "@/lib/word-guess/types";

// The answer board. Cells echo the word-search tile identity: calm bordered
// squares, serif letters, the gold accent reserved for revealed letters.
//
// Cells are grouped word by word (split on spaces) so a multi-word answer
// wraps between words, never through one. Punctuation renders inline without
// a tile — it is scenery, not something the reader types.

export function WordGuessAnswerCells({
  cells,
  state,
  nudge,
}: {
  cells: readonly WordGuessCell[];
  state: WordGuessState;
  /** Increment to play the gentle "not yet" nudge (reduced-motion safe via CSS). */
  nudge: number;
}) {
  const { t } = useI18n();
  const visible = useMemo(() => new Set(state.visibleIndexes), [state.visibleIndexes]);

  const words = useMemo(() => {
    const groups: WordGuessCell[][] = [[]];
    for (const cell of cells) {
      if (cell.kind === "space") groups.push([]);
      else groups[groups.length - 1]!.push(cell);
    }
    return groups.filter((group) => group.length > 0);
  }, [cells]);

  const nextIndex = cells.find(
    (cell) =>
      cell.kind === "letter" && !visible.has(cell.index) && state.entered[cell.index] == null,
  )?.index;

  const solved = state.status === "completed";

  // A single static sentence for screen readers instead of per-cell chatter.
  const spoken = cells
    .map((cell) => {
      if (cell.kind === "space") return "·";
      if (cell.kind === "punctuation") return cell.char;
      if (visible.has(cell.index)) return cell.char;
      return state.entered[cell.index] ?? t("wordguess.a11y.blank");
    })
    .join(", ");

  return (
    <div>
      <p className="sr-only" aria-live="off">
        {t("wordguess.a11y.currentAnswer")}: {spoken}
      </p>
      <div
        key={nudge}
        aria-hidden="true"
        className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-3 ${
          nudge > 0 && !solved ? "motion-safe:animate-[wg-nudge_0.35s_ease-in-out]" : ""
        }`}
      >
        {words.map((word, wordIndex) => (
          <div key={wordIndex} className="flex items-center gap-1.5 sm:gap-2">
            {word.map((cell) => {
              if (cell.kind === "punctuation") {
                return (
                  <span
                    key={cell.index}
                    className="font-serif text-xl text-muted-foreground sm:text-2xl"
                  >
                    {cell.char}
                  </span>
                );
              }
              const revealed = visible.has(cell.index);
              const typed = state.entered[cell.index];
              const isNext = cell.index === nextIndex && state.status !== "failed";
              return (
                <span
                  key={cell.index}
                  className={`grid h-10 w-9 place-items-center rounded-lg border font-serif text-lg uppercase transition sm:h-12 sm:w-11 sm:text-xl ${
                    revealed && !solved ? "" : "bg-card"
                  } ${solved && !revealed ? "motion-safe:animate-[cell-pop_0.3s_ease-out]" : ""}`}
                  style={{
                    borderColor: isNext
                      ? "color-mix(in oklab, var(--gold) 70%, transparent)"
                      : "color-mix(in oklab, var(--border) 80%, transparent)",
                    background:
                      revealed && !solved
                        ? "color-mix(in oklab, var(--gold) 12%, transparent)"
                        : undefined,
                    boxShadow: "0 1px 2px rgba(43,41,38,0.04)",
                    color: typed || revealed ? "var(--ink)" : "var(--walnut)",
                  }}
                >
                  {revealed
                    ? cell.char
                    : (typed ?? (
                        <span
                          aria-hidden
                          className="mb-1 inline-block h-px w-4 bg-current opacity-40"
                        />
                      ))}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
