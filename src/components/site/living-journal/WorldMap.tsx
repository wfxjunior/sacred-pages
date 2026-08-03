/**
 * A minimal, abstract world map for the Living Journal.
 *
 * The continents are rendered as soft silhouettes; active country dots sit
 * on top with a gentle golden pulse. No labels, no interactive tooltips, no
 * counts — the map is decoration, not a dashboard.
 */

interface WorldMapProps {
  activeCountryCodes?: readonly string[];
  reducedMotion?: boolean;
}

const COUNTRY_DOTS: Record<string, { x: number; y: number }> = {
  BR: { x: 28, y: 68 },
  CA: { x: 20, y: 25 },
  AU: { x: 82, y: 70 },
  MX: { x: 16, y: 44 },
  DE: { x: 52, y: 28 },
  KE: { x: 56, y: 60 },
  PT: { x: 44, y: 38 },
  JP: { x: 86, y: 35 },
  US: { x: 22, y: 33 },
  GB: { x: 46, y: 26 },
  FR: { x: 48, y: 31 },
  IN: { x: 68, y: 45 },
  ZA: { x: 53, y: 76 },
  NG: { x: 50, y: 55 },
};

/**
 * A simplified SVG path of continents. The shapes are intentionally abstract
 * so they read as a world map without drawing attention away from the journal.
 */
const CONTINENT_PATHS = [
  // North America
  "M8,22 C14,18 22,16 30,20 C36,24 34,34 30,40 C26,46 18,48 12,44 C6,40 4,30 8,22 Z",
  // South America
  "M24,56 C30,54 34,58 34,66 C34,76 30,86 26,88 C22,90 20,82 20,72 C20,64 20,58 24,56 Z",
  // Europe / Asia
  "M42,24 C48,18 58,18 68,22 C80,26 88,32 90,42 C92,52 86,60 76,64 C68,66 58,62 52,54 C48,48 44,42 42,36 C40,30 40,26 42,24 Z",
  // Africa
  "M46,50 C52,48 56,52 56,60 C58,70 54,82 50,84 C46,86 44,78 44,68 C44,60 44,52 46,50 Z",
  // Australia
  "M78,68 C84,66 90,68 90,74 C90,80 84,82 78,80 C74,78 74,70 78,68 Z",
];

export function WorldMap({ activeCountryCodes = [], reducedMotion = false }: WorldMapProps) {
  const activeSet = new Set(activeCountryCodes.map((c) => c.toUpperCase()));

  return (
    <svg
      viewBox="0 0 100 50"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="world-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
        </radialGradient>
        <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Subtle glow behind the map. */}
      <ellipse
        cx="50"
        cy="50"
        rx="46"
        ry="28"
        fill="url(#world-glow)"
        opacity="0.6"
      />

      {/* Continent silhouettes. */}
      <g
        fill="currentColor"
        style={{ color: "color-mix(in oklab, var(--walnut) 16%, transparent)" }}
      >
        {CONTINENT_PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {/* All country dots, with active ones pulsing. */}
      <g>
        {Object.entries(COUNTRY_DOTS).map(([code, { x, y }]) => {
          const isActive = activeSet.has(code);
          return (
            <g key={code} transform={`translate(${x}, ${y})`}>
              {isActive && !reducedMotion && (
                <circle
                  r="2.8"
                  fill="var(--gold)"
                  opacity="0.28"
                  className="lj-map-pulse"
                />
              )}
              <circle
                r={isActive ? 1.5 : 1.1}
                fill={isActive ? "var(--gold)" : "var(--walnut)"}
                opacity={isActive ? 1 : 0.45}
                filter={isActive ? "url(#dot-glow)" : undefined}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
