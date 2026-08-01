import { LetterTile } from "./BrandMark";

/**
 * The Lumena logo.
 *
 * One component so the brand reads identically on the landing header, the
 * authentication pages and anywhere else it appears. It deliberately does not
 * define its own colours or geometry: the tiles come from LetterTile, which
 * owns TILE_PALETTE and is the single source of truth shared with the puzzle
 * grid. Restyling the brand means editing BrandMark, never this file.
 *
 * Accessibility: the tiles are decoration — six separately announced letters
 * would be read out as "L, U, M, E, N, A" — so each tile is aria-hidden (set by
 * LetterTile) and the component contributes exactly one accessible name,
 * "Lumena", from visually hidden text.
 */

const TILE_SIZE = {
  /** Compact — mobile header, tight toolbars. */
  sm: 18,
  /** Default — desktop header, authentication pages. */
  md: 26,
  /** Generous — marketing surfaces. */
  lg: 34,
} as const;

export type LumenaLogoSize = keyof typeof TILE_SIZE;

const BRAND = "LUMENA";

export function LumenaLogo({
  variant = "tiles",
  size = "md",
  showWordmark = false,
  tone = "brand",
  className = "",
}: {
  /** "tiles" spells LUMENA; "mark" is the single L tile for very tight space. */
  variant?: "tiles" | "mark";
  size?: LumenaLogoSize;
  /** Adds the serif "Lumena" wordmark beside the tiles. */
  showWordmark?: boolean;
  tone?: "default" | "light" | "brand";
  className?: string;
}) {
  const px = TILE_SIZE[size];
  const letters = variant === "mark" ? "L" : BRAND;

  return (
    <span className={`inline-flex items-center ${className}`}>
      {/*
        The tile row never wraps: on a narrow header the logo shrinking is
        acceptable, the logo breaking across two lines is not.
      */}
      <span
        aria-hidden
        className="inline-flex shrink-0 flex-nowrap items-center"
        style={{ gap: px * 0.18 }}
      >
        {letters.split("").map((letter, i) => (
          <LetterTile key={`${letter}-${i}`} letter={letter} size={px} index={i} variant={tone} />
        ))}
      </span>

      {showWordmark && (
        <span
          aria-hidden
          className="ml-2.5 font-serif font-semibold tracking-tight text-foreground"
          style={{ fontSize: px * 0.62 }}
        >
          Lumena
        </span>
      )}

      {/* The one accessible name for the whole mark. */}
      <span className="sr-only">Lumena</span>
    </span>
  );
}
