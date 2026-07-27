import { useMemo, useState } from "react";
import { buildGrid } from "@/lib/word-search";
import { SELECTION_COLORS } from "@/lib/mock-data";

type Cell = { r: number; c: number };

export function WordSearch({
  words,
  size = 12,
  fullBleed = false,
}: {
  words: string[];
  size?: number;
  fullBleed?: boolean;
}) {
  const { grid, placements } = useMemo(() => buildGrid(words, size), [words, size]);
  const [colorKey, setColorKey] = useState("gold");
  const color = SELECTION_COLORS.find((c) => c.key === colorKey)!.value;
  const [start, setStart] = useState<Cell | null>(null);
  const [end, setEnd] = useState<Cell | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [selecting, setSelecting] = useState(false);

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

  function begin(r: number, c: number) {
    setSelecting(true);
    setStart({ r, c });
    setEnd({ r, c });
  }

  function move(r: number, c: number) {
    if (!selecting || !start) return;
    setEnd({ r, c });
  }

  function endSelection() {
    setSelecting(false);
    commit();
  }

  return (
    <div className={`flex flex-col ${fullBleed ? "h-full min-h-0" : "space-y-6"}`}>
      <div
        className={`grid select-none gap-1 rounded-lg border border-border bg-card ${
          fullBleed ? "h-full w-full p-2" : "p-3"
        }`}
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
                onMouseDown={() => begin(r, c)}
                onMouseEnter={() => move(r, c)}
                onMouseUp={endSelection}
                onTouchStart={(e) => {
                  e.preventDefault();
                  begin(r, c);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const target = document.elementFromPoint(touch.clientX, touch.clientY);
                  const btn = target?.closest("button[data-r]");
                  if (btn) {
                    const rr = Number(btn.getAttribute("data-r"));
                    const cc = Number(btn.getAttribute("data-c"));
                    move(rr, cc);
                  }
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  endSelection();
                }}
                data-r={r}
                data-c={c}
                className={`aspect-square rounded-sm font-medium uppercase transition ${
                  fullBleed
                    ? "text-[10px] xs:text-xs sm:text-sm"
                    : "text-xs sm:text-sm"
                }`}
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
      {!fullBleed && (
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
                  style={{
                    color: done ? "var(--sage)" : undefined,
                    background: done ? "color-mix(in oklab, var(--sage) 12%, transparent)" : undefined,
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
