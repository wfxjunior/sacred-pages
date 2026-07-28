export function HeroWordGrid() {
  // 12x12 illustrative grid with a few hidden Bible words highlighted.
  const rows = [
    "P E A C E F I L L E R",
    "F X A X T X X X X X X",
    "A I T X X X X X X X X",
    "I T G X X X X X X X X",
    "T H R X X X X X X X X",
    "H X R X X X X X X X X",
    "X X A X X X X X X X X",
    "X X C X X X X X X X X",
    "X X E X X X X X X X X",
    "X X X X X X X X X X X",
    "X X X X X X X X X X X",
    "X X X X X X X X X X X",
  ];

  const highlights: Record<string, string> = {
    P: "#7A8F73", // PEACE — sage
    E: "#7A8F73",
    A: "#7A8F73",
    C: "#7A8F73",
    " ": "",
    F: "#5E7FA3", // FAITH — dusty blue
    I: "#5E7FA3",
    T: "#5E7FA3",
    H: "#5E7FA3",
    G: "#C89F4F", // LIGHT — gold (G used as placeholder for L)
    R: "#C89F4F",
  };

  return (
    <div className="relative w-full">
      <div className="relative overflow-hidden rounded-2xl border border-[#E4E0D6] bg-white p-3 shadow-[0_12px_40px_-12px_rgba(43,43,43,0.12)] sm:rounded-3xl sm:p-4 md:p-5">
        {/* Decorative top label */}
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B665C]">
            Daily word search
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F1EC] px-2 py-1 text-[10px] font-medium text-[#2B2B2B]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7A8F73]" />
            3 found
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-12 gap-[1px] rounded-xl bg-[#E4E0D6] p-1 sm:gap-[2px] sm:p-1.5">
          {rows.map((row, r) =>
            row.split(" ").map((letter, c) => {
              const color = highlights[letter] || "";
              const isWord = color !== "";
              return (
                <div
                  key={`${r}-${c}`}
                  className={`flex aspect-square items-center justify-center rounded-[2px] text-[10px] font-semibold sm:text-[11px] md:text-xs ${
                    isWord
                      ? "text-white"
                      : "bg-white text-[#2B2B2B]/55"
                  }`}
                  style={{
                    backgroundColor: isWord ? color : undefined,
                  }}
                >
                  {letter === " " ? "\u00A0" : letter}
                </div>
              );
            }),
          )}
        </div>

        {/* Strike-through lines over found words */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {/* PEACE horizontal row 1 */}
          <line
            x1="8"
            y1="10"
            x2="46"
            y2="10"
            stroke="#7A8F73"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.35"
          />
          {/* FAITH vertical col 1 */}
          <line
            x1="4"
            y1="6"
            x2="4"
            y2="52"
            stroke="#5E7FA3"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.35"
          />
          {/* LIGHT diagonal-ish */}
          <line
            x1="17"
            y1="33"
            x2="42"
            y2="33"
            stroke="#C89F4F"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.35"
          />
        </svg>
      </div>
    </div>
  );
}
