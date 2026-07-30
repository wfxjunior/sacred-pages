/**
 * Spiral binding for the open journal.
 *
 * Pure CSS: the coils are a repeating-linear-gradient rather than N rendered
 * ring elements. That is what lets the binding adapt to any journal height with
 * no JavaScript, no measurement, no layout shift and a constant ring pitch —
 * a fixed number of flexed rings would stretch its spacing as the spread grows,
 * which is exactly what makes this kind of ornament look fake.
 *
 * The whole thing is decoration: aria-hidden, pointer-events: none, and
 * absolutely positioned so it never takes part in layout or intercepts a click
 * meant for the puzzle grid underneath.
 *
 * Restraint is the brief — narrow aged-brass wire, one soft specular line, and
 * contact shadows on the facing pages. No chrome, no heavy 3D, no oversized
 * rings.
 */

/** Aged brass, warm and desaturated so it sits inside the existing palette. */
const BRASS_DARK = "#8A6F3C";
const BRASS_MID = "#B99A5E";
const BRASS_LIGHT = "#E3CE9C";

/**
 * Coil pitch, in CSS pixels.
 *
 * A real spiral is bound at roughly 6mm per coil. At the size this journal is
 * drawn that works out near 20px — noticeably looser than it first looks right
 * on screen, but a tighter pitch reads as a zip or a comb rather than as rings,
 * which is the difference between "bound journal" and "school notebook".
 */
const PITCH = { vertical: 21, horizontal: 18 } as const;

function coilGradient(angle: string, pitch: number) {
  // One period = a wire segment then a gap. The gap is where the page shows
  // through between coils, so it carries the gutter, not the metal.
  const wire = pitch * 0.38;
  return (
    `repeating-linear-gradient(${angle},` +
    ` transparent 0px,` +
    ` transparent ${pitch - wire}px,` +
    ` ${BRASS_DARK} ${pitch - wire}px,` +
    ` ${BRASS_MID} ${pitch - wire + wire * 0.32}px,` +
    ` ${BRASS_LIGHT} ${pitch - wire + wire * 0.5}px,` +
    ` ${BRASS_MID} ${pitch - wire + wire * 0.68}px,` +
    ` ${BRASS_DARK} ${pitch}px)`
  );
}

export function JournalBinding({
  orientation = "vertical",
  className = "",
}: {
  orientation?: "vertical" | "horizontal";
  className?: string;
}) {
  const vertical = orientation === "vertical";

  // Coils run across the wire, so the repeat axis is the long axis of the
  // binding: down the page when vertical, across it when horizontal.
  const coilAngle = vertical ? "180deg" : "90deg";
  // The specular line runs along the wire, perpendicular to the coils.
  const sheenAngle = vertical ? "90deg" : "180deg";

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute select-none ${
        vertical
          ? "inset-y-0 left-1/2 w-[26px] -translate-x-1/2"
          : "inset-x-0 top-1/2 h-[20px] -translate-y-1/2"
      } ${className}`}
      style={{ zIndex: 2 }}
    >
      {/* Contact shadow: the paper darkens where it curves under the wire. */}
      <span
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${sheenAngle}, transparent 0%, rgba(31,29,27,0.13) 34%, rgba(31,29,27,0.16) 50%, rgba(31,29,27,0.13) 66%, transparent 100%)`,
        }}
      />

      {/* The coils. */}
      <span
        className="absolute"
        style={{
          // Inset along the long axis so the wire stops short of the page
          // edges, the way a real spiral does.
          ...(vertical
            ? { top: 12, bottom: 12, left: "50%", width: 15, transform: "translateX(-50%)" }
            : { left: 16, right: 16, top: "50%", height: 12, transform: "translateY(-50%)" }),
          backgroundImage: coilGradient(coilAngle, vertical ? PITCH.vertical : PITCH.horizontal),
          borderRadius: 2,
          // A single soft specular band along the wire, plus depth at its edges.
          boxShadow: `inset 0 0 0 0.5px rgba(74,58,28,0.45),` + ` 0 0 2px rgba(31,29,27,0.28)`,
        }}
      >
        {/* Specular highlight — one restrained pass, not a chrome gradient. */}
        <span
          className="absolute inset-0"
          style={{
            borderRadius: 2,
            background: `linear-gradient(${sheenAngle}, rgba(255,252,244,0) 12%, rgba(255,252,244,0.55) 40%, rgba(255,252,244,0.12) 58%, rgba(31,29,27,0.18) 92%)`,
            mixBlendMode: "soft-light",
          }}
        />
      </span>
    </span>
  );
}
