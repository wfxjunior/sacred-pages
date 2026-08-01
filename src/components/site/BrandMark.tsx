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

/**
 * Brand palette — a warm beige spectrum that feels like linen, paper and walnut ink.
 *
 * The pastel TILE_PALETTE above is the puzzle language and stays as it is.
 * For the logo itself we use a mix of ivory, sand, taupe, walnut and a single
 * antique-gold accent, so the wordmark reads as a unified, sophisticated palette
 * rather than a single dark tile against light ones.
 */
export const BRAND_TILE_PALETTE = [
  { bg: "#F6F2E8", border: "#D6CFBE", fg: "#2B2B2B" },
  { bg: "#ECE6D8", border: "#CFC7B6", fg: "#2B2B2B" },
  { bg: "#DDD5C4", border: "#C4B9A7", fg: "#2B2B2B" },
  { bg: "#C8BAA6", border: "#B0A28C", fg: "#2B2B2B" },
  { bg: "#7A6C5B", border: "#5F5346", fg: "#F6F2E8" },
  { bg: "#E9DCC3", border: "#C8AC76", fg: "#3F3625" },
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
  variant?: "default" | "light" | "brand";
}) {
  const isBrand = variant === "brand";
  const palette = isBrand ? BRAND_TILE_PALETTE : TILE_PALETTE;
  const tone = palette[index % palette.length] as {
    bg: string;
    border: string;
    fg?: string;
  };
  const isLight = variant === "light";
  return (
    <span
      aria-hidden
      className="inline-flex select-none items-center justify-center font-semibold"
      style={{
        width: size,
        height: size,
        borderRadius: isBrand ? Math.max(4, size * 0.18) : Math.max(6, size * 0.24),
        background: isLight ? `color-mix(in oklab, ${tone.bg} 82%, white)` : tone.bg,
        border: `${Math.max(1, size * 0.055)}px solid ${tone.border}`,
        color: tone.fg ?? "#1F2A3C",
        fontSize: size * (isBrand ? 0.52 : 0.55),
        letterSpacing: isBrand ? "0.02em" : undefined,
        lineHeight: 1,
        boxShadow: isBrand ? "none" : "0 1px 2px rgba(31,42,60,0.14)",
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
  variant?: "default" | "light" | "brand";
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
  variant?: "default" | "light" | "brand";
}) {
  return (
    <span className="inline-flex items-center" style={{ gap: size * 0.18 }} aria-label={word}>
      {word.split("").map((ch, i) => (
        <LetterTile key={`${ch}-${i}`} letter={ch} size={size} index={i} variant={variant} />
      ))}
    </span>
  );
}