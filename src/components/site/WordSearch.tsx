import { useMemo, useState } from "react";
import { buildGrid } from "@/lib/word-search";
import { SELECTION_COLORS } from "@/lib/mock-data";

type Cell = { r: number; c: number };

export function WordSearch({ words, size = 12 }: { words: string[]; size?: number }) {
  const { grid, placements } = useMemo(() => buildGrid(words, size), [words, size]);
  const [colorKey, setColorKey] = useState("gold");
  const color = SELECTION_COLORS.find((c) => c.key === colorKey)!.value;
  const [start, setStart] = useState<Cell | null>(null);
  const [end, setEnd] = useState<Cell | null>(null);
  const [found, setFound] = useState<string[]>([]);

  function cellsBetween(a: Cell, b: Cell): Cell[] {
    const dr = Math.sign(b.r - a.r);
    const dc = Math.sign(b.c - a.c);
    const len = Math.max(Math.abs(b.r - a.r), Math.abs(b.c - a.c)) + 1;
    const straight =
      a.r === b.r || a.c === b.c || Math.abs(b.r - a.r) === Math.abs(b.c - a.c);
    if (!straight) return [];
    return Array.from({ length: len }, (_, i) => ({ r: a.r + dr * i, c: a.c + dc * i }));
  }

  const active = start && end ? cellsBetween(start, end) : [];
  const foundCells = new Set<string>();
  placements
    .filter((p) => found.includes(p.word))
    .forEach((p) => {
      for (let i = 0; i < p.word.length; i++)
        foundCells.add(`${p.row + p.dr * i},${p.col + p.dc * i}`);
    });

  function commit() {
    if (!start || !end) return;
    const cells = cellsBetween(start, end);
    if (cells.length) {
      const word = cells.map((c) => grid[c.r][c.c]).join("");
      const reversed = word.split("").reverse().join("");
      const match = words.find((w) => w.toUpperCase() === word || w.toUpperCase() === reversed);
      if (match && !found.includes(match.toUpperCase())) {
        setFound((f) => [...f, match.toUpperCase()]);
      }
    }
    setStart(null);
    setEnd(null);
  }

  return (
    <div className="space-y-6">
      <div
        className="grid select-none gap-1 rounded-lg border border-border bg-card p-3"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        onMouseLeave={() => {
          setStart(null);
          setEnd(null);
        }}
      >
        {grid.map((row, r) =>
          row.map((letter, c) => {
            const inActive = active.some((a) => a.r === r && a.c === c);
            const isFound = foundCells.has(`${r},${c}`);
            return (
              <button
                key={`${r}-${c}`}
                onMouseDown={() => {
                  setStart({ r, c });
                  setEnd({ r, c });
                }}
                onMouseEnter={() => {
                  if (start) setEnd({ r, c });
                }}
                onMouseUp={commit}
                className="aspect-square rounded-sm text-xs font-medium uppercase transition sm:text-sm"
                style={{
                  background: isFound
                    ? `color-mix(in oklab, ${color} 22%, transparent)`
                    : inActive
                      ? `color-mix(in oklab, ${color} 32%, transparent)`
                      : "transparent",
                  outline: isFound
                    ? `1px solid color-mix(in oklab, ${color} 50%, transparent)`
                    : "none",
                }}
              >
                {letter}
              </button>
            );
          }),
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Selection</span>
          <div className="flex items-center gap-1.5">
            {SELECTION_COLORS.map((c) => (
              <button
                key={c.key}
                onClick={() => setColorKey(c.key)}
                aria-label={c.label}
                className="h-5 w-5 rounded-full border-2 transition"
                style={{
                  background: c.value,
                  borderColor: colorKey === c.key ? "var(--foreground)" : "transparent",
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {words.map((w) => {
            const done = found.includes(w.toUpperCase());
            return (
              <span
                key={w}
                className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wider transition ${
                  done ? "border-transparent line-through" : "border-border text-muted-foreground"
                }`}
                style={
                  done
                    ? {
                        color: "var(--sage)",
                        background: "color-mix(in oklab, var(--sage) 12%, transparent)",
                      }
                    : undefined
                }
              >
                {w}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}