/**
 * A dot-matrix world map for the Living Journal.
 *
 * The land is drawn as a halftone grid of dots sampled from real Natural Earth
 * coastlines (see worldDots.ts), which reads as a proper world map while
 * staying quiet and editorial. Every dot lives in one SVG path so the DOM stays
 * light. Active country dots sit on top with a gentle golden pulse; hovering a
 * dot reveals the region name and the journey it is linked to.
 */

import { useMemo, useState } from "react";
import type { LivingJournalMoment } from "./livingJournal.types";
import {
  DOT_GRID_COLS,
  DOT_GRID_ROWS,
  DOT_LAT_BOTTOM,
  DOT_LAT_TOP,
  DOT_MAP_ENCODED,
} from "./worldDots";

interface WorldMapProps {
  activeCountryCodes?: readonly string[];
  activeMoments?: readonly LivingJournalMoment[];
  reducedMotion?: boolean;
}

const CELL = 6;
const DOT_R = 2.1;
const W = DOT_GRID_COLS * CELL;
const H = DOT_GRID_ROWS * CELL;

/** Equirectangular projection matching the generated dot grid. */
function project([lon, lat]: readonly [number, number]): readonly [number, number] {
  const x = ((lon + 180) / 360) * (DOT_GRID_COLS - 1) * CELL + CELL / 2;
  const y =
    ((DOT_LAT_TOP - lat) / (DOT_LAT_TOP - DOT_LAT_BOTTOM)) * (DOT_GRID_ROWS - 1) * CELL +
    CELL / 2;
  return [x, y];
}

/** Expand the encoded grid into a single path of dots (one DOM node). */
function buildDotPath(): string {
  let d = "";
  for (const rowChunk of DOT_MAP_ENCODED.split(";")) {
    const [rowStr, colsStr] = rowChunk.split(":");
    const y = Number(rowStr) * CELL + CELL / 2;
    for (const colStr of colsStr.split(",")) {
      const x = Number(colStr) * CELL + CELL / 2;
      d += `M${x - DOT_R} ${y}a${DOT_R} ${DOT_R} 0 1 0 ${DOT_R * 2} 0a${DOT_R} ${DOT_R} 0 1 0 ${-DOT_R * 2} 0`;
    }
  }
  return d;
}

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
