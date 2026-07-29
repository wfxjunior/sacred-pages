import type { ContentStatus, TranslationStatus } from "@/lib/content/types";

// Status is conveyed by label text first; color is a secondary cue only, so the
// UI remains readable for color-blind users (accessibility rule 32).

const CONTENT_STATUS_STYLE: Record<ContentStatus, { label: string; tone: string }> = {
  draft: { label: "Draft", tone: "var(--walnut)" },
  in_review: { label: "In review", tone: "var(--dusty-blue, #5E7FA3)" },
  changes_requested: { label: "Changes requested", tone: "#B4542F" },
  approved: { label: "Approved", tone: "var(--sage, #78866B)" },
  scheduled: { label: "Scheduled", tone: "var(--gold, #B88A3B)" },
  published: { label: "Published", tone: "var(--sage, #78866B)" },
  unpublished: { label: "Unpublished", tone: "var(--walnut)" },
  archived: { label: "Archived", tone: "var(--muted-foreground)" },
};

const TRANSLATION_STATUS_LABEL: Record<TranslationStatus, string> = {
  missing: "Missing",
  draft: "Draft",
  in_review: "In review",
  approved: "Approved",
  published: "Published",
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  const style = CONTENT_STATUS_STYLE[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider"
      style={{
        borderColor: `color-mix(in oklab, ${style.tone} 40%, transparent)`,
        background: `color-mix(in oklab, ${style.tone} 10%, transparent)`,
        color: style.tone,
      }}
    >
      {style.label}
    </span>
  );
}

export function TranslationStatusBadge({
  status,
  languageCode,
  percentComplete,
}: {
  status: TranslationStatus;
  languageCode: string;
  percentComplete?: number;
}) {
  const isComplete = status === "published";
  const isMissing = status === "missing";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px]"
      style={{
        borderColor: isMissing
          ? "var(--border)"
          : "color-mix(in oklab, var(--sage) 40%, transparent)",
        color: isMissing ? "var(--muted-foreground)" : undefined,
      }}
      title={`${languageCode.toUpperCase()}: ${TRANSLATION_STATUS_LABEL[status]}`}
    >
      <span className="font-semibold uppercase">{languageCode}</span>
      <span aria-hidden>·</span>
      <span>{TRANSLATION_STATUS_LABEL[status]}</span>
      {percentComplete !== undefined && !isComplete && (
        <span className="tabular-nums text-muted-foreground">{percentComplete}%</span>
      )}
    </span>
  );
}
