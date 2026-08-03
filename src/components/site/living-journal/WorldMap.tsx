/**
 * A minimal world map for the Living Journal.
 *
 * Continents are simplified equirectangular polygons projected from real
 * lon/lat coordinates, so the silhouette actually reads as the world rather
 * than as abstract blobs. Active country dots sit on top with a gentle golden
 * pulse; hovering a dot reveals the region name and the journey it is linked
 * to, giving the reader a quiet moment of orientation before any click.
 */

import { useMemo, useState } from "react";
import type { LivingJournalMoment } from "./livingJournal.types";

interface WorldMapProps {
  activeCountryCodes?: readonly string[];
  activeMoments?: readonly LivingJournalMoment[];
  reducedMotion?: boolean;
}

const W = 1000;
const H = 460;

/** Equirectangular projection, cropped below ~60°S (no Antarctica). */
function project([lon, lat]: readonly [number, number]): string {
  const x = ((lon + 180) / 360) * W;
  const y = ((78 - lat) / 140) * H;
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}

const toPath = (pts: readonly (readonly [number, number])[]) =>
  `M${pts.map(project).join(" L")} Z`;

const LAND: readonly (readonly (readonly [number, number])[])[] = [
  // North America
  [
    [-168, 65], [-156, 71], [-125, 70], [-95, 70], [-80, 70], [-65, 60], [-55, 52],
    [-60, 47], [-70, 42], [-75, 35], [-80, 32], [-81, 25], [-90, 29], [-97, 26],
    [-105, 22], [-114, 27], [-117, 32], [-124, 42], [-130, 54], [-140, 60], [-155, 58],
  ],
  // Central America
  [[-105, 22], [-97, 16], [-88, 15], [-83, 10], [-77, 8], [-83, 15], [-92, 18], [-99, 19]],
  // Greenland
  [[-45, 60], [-20, 70], [-20, 82], [-50, 83], [-60, 76], [-55, 66]],
  // South America
  [
    [-81, 0], [-75, -15], [-70, -23], [-72, -40], [-75, -52], [-68, -55], [-63, -42],
    [-58, -38], [-53, -34], [-48, -25], [-40, -20], [-35, -8], [-45, -2], [-50, 2],
    [-60, 8], [-70, 12], [-77, 8],
  ],
  // Africa
  [
    [-17, 15], [-16, 22], [-9, 31], [-5, 36], [10, 37], [20, 32], [32, 31], [37, 22],
    [43, 12], [51, 12], [42, -2], [40, -15], [35, -25], [27, -34], [18, -34], [12, -18],
    [9, -1], [8, 5], [-5, 5], [-13, 9],
  ],
  // Madagascar
  [[45, -13], [50, -16], [47, -25], [44, -20]],
  // Europe + Asia
  [
    [-10, 36], [-1, 43], [3, 43], [12, 45], [16, 41], [20, 40], [28, 41], [35, 36],
    [36, 31], [43, 30], [48, 30], [56, 27], [60, 25], [67, 24], [72, 19], [77, 8],
    [80, 13], [88, 21], [95, 16], [99, 10], [105, 9], [109, 15], [110, 21], [118, 24],
    [122, 31], [122, 40], [128, 42], [131, 47], [141, 53], [155, 60], [170, 66],
    [180, 66], [180, 73], [140, 74], [100, 78], [70, 73], [50, 70], [35, 70], [30, 62],
    [22, 60], [12, 58], [8, 63], [4, 59], [-2, 51], [-5, 44],
  ],
  // British Isles
  [[-6, 50], [-2, 53], [-1, 58], [-5, 57], [-6, 54]],
  // Japan
  [[131, 32], [136, 35], [141, 40], [143, 44], [140, 42], [136, 37], [130, 33]],
  // Indonesia / Philippines
  [[96, 5], [104, 1], [116, -3], [120, -8], [110, -7], [100, 0]],
  // Australia
  [
    [113, -22], [114, -34], [129, -32], [138, -35], [146, -39], [150, -37], [153, -28],
    [146, -19], [142, -11], [136, -12], [130, -12], [125, -14], [117, -20],
  ],
  // New Zealand
  [[172, -41], [175, -37], [178, -38], [174, -42], [168, -46], [170, -43]],
];

/** Capital-ish coordinates, projected the same way as the land. */
const COUNTRY_COORDS: Record<string, readonly [number, number]> = {
  BR: [-47, -15],
  CA: [-96, 56],
  AU: [134, -25],
  MX: [-102, 23],
  DE: [10, 51],
  KE: [38, 0],
  PT: [-8, 39],
  JP: [138, 36],
  US: [-98, 39],
  GB: [-2, 54],
  FR: [2, 46],
  IN: [79, 22],
  ZA: [24, -29],
  NG: [8, 9],
  KR: [128, 36],
  PH: [122, 12],
  IT: [12, 42],
  ES: [-4, 40],
  AR: [-64, -34],
  ID: [113, -1],
};

const COUNTRY_NAMES: Record<string, string> = {
  BR: "Brazil",
  CA: "Canada",
  AU: "Australia",
  MX: "Mexico",
  DE: "Germany",
  KE: "Kenya",
  PT: "Portugal",
  JP: "Japan",
  US: "United States",
  GB: "United Kingdom",
  FR: "France",
  IN: "India",
  ZA: "South Africa",
  NG: "Nigeria",
  KR: "South Korea",
  PH: "Philippines",
  IT: "Italy",
  ES: "Spain",
  AR: "Argentina",
  ID: "Indonesia",
};

interface TooltipState {
  code: string;
  x: number;
  y: number;
}

export function WorldMap({
  activeCountryCodes = [],
  activeMoments = [],
  reducedMotion = false,
}: WorldMapProps) {
  const activeSet = new Set(activeCountryCodes.map((c) => c.toUpperCase()));
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const journeyByCode = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of activeMoments) {
      if (m.countryCode && m.journeyLabel) {
        map.set(m.countryCode.toUpperCase(), m.journeyLabel);
      }
    }
    return map;
  }, [activeMoments]);

  const handleEnter = (code: string) => (e: React.MouseEvent) => {
    setTooltip({ code, x: e.clientX, y: e.clientY });
  };

  const handleMove = (e: React.MouseEvent) => {
    setTooltip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
  };

  const handleLeave = () => setTooltip(null);

  return (
    <>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="world-glow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </radialGradient>
          <filter id="dot-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="0" y="0" width={W} height={H} fill="url(#world-glow)" />

        {/* Faint graticule — gives the map a chart-like calm without labels. */}
        <g
          stroke="currentColor"
          strokeWidth="1"
          style={{ color: "color-mix(in oklab, var(--walnut) 8%, transparent)" }}
        >
          {[-40, -20, 0, 20, 40, 60].map((lat) => (
            <line key={lat} x1="0" x2={W} y1={((78 - lat) / 140) * H} y2={((78 - lat) / 140) * H} />
          ))}
          {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lon) => (
            <line key={lon} y1="0" y2={H} x1={((lon + 180) / 360) * W} x2={((lon + 180) / 360) * W} />
          ))}
        </g>

        {/* Continent silhouettes. */}
        <g
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          style={{ color: "color-mix(in oklab, var(--walnut) 22%, transparent)" }}
        >
          {LAND.map((poly, i) => (
            <path key={i} d={toPath(poly)} />
          ))}
        </g>

        {/* Country dots, active ones pulsing. */}
        <g>
          {Object.entries(COUNTRY_COORDS).map(([code, coord]) => {
            const isActive = activeSet.has(code);
            const [x, y] = project(coord).split(",").map(Number);
            return (
              <g
                key={code}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer"
                onMouseEnter={handleEnter(code)}
                onMouseMove={handleMove}
                onMouseLeave={handleLeave}
              >
                {isActive && !reducedMotion && (
                  <circle r="14" fill="var(--gold)" opacity="0.25" className="lj-map-pulse" />
                )}
                <circle
                  r={isActive ? 6 : 3.5}
                  fill={isActive ? "var(--gold)" : "var(--walnut)"}
                  opacity={isActive ? 1 : 0.4}
                  filter={isActive ? "url(#dot-glow)" : undefined}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-md border border-[#E4E0D6]/70 bg-[#FBFAF6] px-3 py-2 shadow-lg dark:border-border/50 dark:bg-card"
          style={{
            left: tooltip.x,
            top: tooltip.y - 44,
            transform: "translate(-50%, 0)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: activeSet.has(tooltip.code) ? "var(--gold)" : "var(--walnut)" }}
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--walnut)" }}>
              {COUNTRY_NAMES[tooltip.code] ?? tooltip.code}
            </span>
          </div>
          {journeyByCode.get(tooltip.code) && (
            <p className="mt-0.5 font-serif text-[13px] leading-tight" style={{ color: "var(--ink)" }}>
              {journeyByCode.get(tooltip.code)}
            </p>
          )}
        </div>
      )}
    </>
  );
}
