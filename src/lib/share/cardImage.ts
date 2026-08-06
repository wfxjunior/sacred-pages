// Renders the shareable card as a real PNG — the app's own image, carrying
// the Lumena wordmark and the link, so what leaves the app always points
// back to it. Canvas-drawn rather than DOM-captured: no extra dependency,
// identical output on every device.

export type ShareCardFormat = "square" | "story";
export type ShareCardTheme = "ivory" | "ink";

export interface ShareCardInput {
  format: ShareCardFormat;
  theme: ShareCardTheme;
  kind: string;
  title: string;
  reference: string;
  excerpt: string;
  details: readonly string[];
  /** The link printed on the card and attached to the share. */
  url: string;
}

const PALETTE = {
  ivory: {
    background: "#FAF7F0",
    ink: "#26251F",
    muted: "#6E5847",
    accent: "#B88A3B",
    rule: "#E4DCCB",
  },
  ink: {
    background: "#171817",
    ink: "#F5F2EB",
    muted: "#B7AE9C",
    accent: "#C89F4F",
    rule: "#3A3B38",
  },
} as const;

function wrapLines(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Draws the card and resolves to a PNG blob. Client-only. */
export async function renderShareCard(input: ShareCardInput): Promise<Blob> {
  const width = 1080;
  const height = input.format === "story" ? 1920 : 1080;
  const colors = PALETTE[input.theme];

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");

  context.fillStyle = colors.background;
  context.fillRect(0, 0, width, height);

  const margin = 96;
  const textWidth = width - margin * 2;
  let y = input.format === "story" ? 320 : 200;

  // Eyebrow: what kind of moment this is.
  context.fillStyle = colors.muted;
  context.font = "600 30px Georgia, serif";
  const eyebrow = input.kind.toUpperCase();
  context.fillText(eyebrow, margin, y);
  y += 76;

  // Title.
  context.fillStyle = colors.ink;
  context.font = "700 84px Georgia, serif";
  for (const line of wrapLines(context, input.title, textWidth).slice(0, 3)) {
    context.fillText(line, margin, y);
    y += 100;
  }
  y += 8;

  // Reference in the accent gold.
  context.fillStyle = colors.accent;
  context.font = "600 40px Georgia, serif";
  context.fillText(input.reference, margin, y);
  y += 96;

  // Excerpt.
  context.fillStyle = colors.ink;
  context.font = "400 46px Georgia, serif";
  const excerptLines = wrapLines(context, `“${input.excerpt}”`, textWidth).slice(
    0,
    input.format === "story" ? 10 : 6,
  );
  for (const line of excerptLines) {
    context.fillText(line, margin, y);
    y += 66;
  }

  // Optional progress details, only what the reader toggled on.
  if (input.details.length > 0) {
    y += 40;
    context.fillStyle = colors.muted;
    context.font = "400 34px Georgia, serif";
    context.fillText(input.details.join("  ·  "), margin, y);
  }

  // Footer: rule, wordmark, link — the card always says where it came from.
  const footerY = height - 150;
  context.strokeStyle = colors.rule;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(margin, footerY - 70);
  context.lineTo(width - margin, footerY - 70);
  context.stroke();

  context.fillStyle = colors.ink;
  context.font = "600 44px Georgia, serif";
  context.fillText("L U M E N A", margin, footerY);

  context.fillStyle = colors.muted;
  context.font = "400 32px Georgia, serif";
  const link = input.url.replace(/^https?:\/\//, "");
  context.textAlign = "right";
  context.fillText(link, width - margin, footerY);
  context.textAlign = "left";

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed"))),
      "image/png",
    );
  });
}
