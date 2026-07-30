// Word-search letter tiles: the brand mark is a single pastel tile ("L"),
// the wordmark spells LUMENA in tiles. Same visual language as the puzzle grid.

export const TILE_PALETTE = [
  { bg: "#E2D5F5", border: "#9B6FCB" },
  { bg: "#FBE7A6", border: "#E0A63A" },
  { bg: "#BDEBD1", border: "#5E9E6E" },
  { bg: "#FCD2AC", border: "#E2853F" },
  { bg: "#C3DDFB", border: "#3E7BC8" },
  { bg: "#FAC8DA", border: "#DA6A93" },
];

export function LetterTile({
  letter,
  size = 32,
  index = 0,
  variant = "default",
}: {
  letter: string;
  size?: number;
  index?: number;
  variant?: "default" | "light";
}) {
  const tone = TILE_PALETTE[index % TILE_PALETTE.length];
  const isLight = variant === "light";
  return (
    <span
      aria-hidden
      className="inline-flex select-none items-center justify-center font-semibold"
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(6, size * 0.24),
        background: isLight ? `color-mix(in oklab, ${tone.bg} 82%, white)` : tone.bg,
        border: `${Math.max(1, size * 0.055)}px solid ${tone.border}`,
        color: "#1F2A3C",
        fontSize: size * 0.55,
        lineHeight: 1,
        boxShadow: "0 1px 2px rgba(31,42,60,0.14)",
      }}
    >
      {letter}
    </span>
  );
}

export function BrandMark({
  size = 32,
  variant = "default",
}: {
  size?: number;
  variant?: "default" | "light";
}) {
  return <LetterTile letter="L" size={size} index={0} variant={variant} />;
}

export function BrandWordmark({
  size = 30,
  word = "LUMENA",
  variant = "default",
}: {
  size?: number;
  word?: string;
  variant?: "default" | "light";
}) {
  return (
    <span className="inline-flex items-center" style={{ gap: size * 0.18 }} aria-label={word}>
      {word.split("").map((ch, i) => (
        <LetterTile key={`${ch}-${i}`} letter={ch} size={size} index={i} variant={variant} />
      ))}
    </span>
  );
}