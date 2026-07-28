type Cell = { letter: string; color?: string; line?: "horizontal" | "vertical" | "diagonal" };

export function HeroWordGrid() {
  const size = 12;

  // Build a blank grid.
  const grid: Cell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ letter: randomLetter() })),
  );

  // Place words with their accent colors.
  placeWord(grid, 0, 0, "horizontal", "PEACE", "#7A8F73"); // sage
  placeWord(grid, 0, 0, "vertical", "FAITH", "#5E7FA3"); // dusty blue
  placeWord(grid, 2, 2, "horizontal", "LIGHT", "#C89F4F"); // gold
  placeWord(grid, 5, 6, "vertical", "GRACE", "#B88A3B"); // antique gold

  return (
    <div className="relative w-full">
      <div className="relative overflow-hidden rounded-2xl border border-[#E4E0D6] bg-white p-3 shadow-[0_12px_40px_-12px_rgba(43,43,43,0.12)] sm:rounded-3xl sm:p-4 md:p-5">
        {/* Header label */}
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B665C]">
            Daily word search
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F1EC] px-2 py-1 text-[10px] font-medium text-[#2B2B2B]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7A8F73]" />
            4 found
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-12 gap-[1px] rounded-xl bg-[#E4E0D6] p-1 sm:gap-[2px] sm:p-1.5">
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isWord = !!cell.color;
              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative flex aspect-square items-center justify-center rounded-[2px] text-[10px] font-semibold sm:text-[11px] md:text-xs ${
                    isWord ? "text-white" : "bg-white text-[#2B2B2B]/55"
                  }`}
                  style={{ backgroundColor: cell.color }}
                >
                  {cell.letter}
                  {isWord && cell.line === "horizontal" && (
                    <span className="absolute inset-x-1 top-1/2 h-[1.5px] -translate-y-1/2 rounded-full bg-white/30" />
                  )}
                  {isWord && cell.line === "vertical" && (
                    <span className="absolute inset-y-1 left-1/2 w-[1.5px] -translate-x-1/2 rounded-full bg-white/30" />
                  )}
                  {isWord && cell.line === "diagonal" && (
                    <span className="absolute left-1/2 top-1/2 h-[1.5px] w-[140%] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-white/30" />
                  )}
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}

function randomLetter(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return letters[Math.floor(Math.random() * letters.length)];
}

function placeWord(
  grid: Cell[][],
  row: number,
  col: number,
  direction: "horizontal" | "vertical" | "diagonal",
  word: string,
  color: string,
) {
  for (let i = 0; i < word.length; i++) {
    const r = direction === "horizontal" ? row : direction === "vertical" ? row + i : row + i;
    const c = direction === "horizontal" ? col + i : direction === "vertical" ? col : col + i;
    if (r < grid.length && c < grid[0].length) {
      grid[r][c] = {
        letter: word[i],
        color,
        line: direction,
      };
    }
  }
}
