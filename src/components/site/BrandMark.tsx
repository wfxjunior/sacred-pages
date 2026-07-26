export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center rounded-md"
      style={{
        width: size,
        height: size,
        background: "color-mix(in oklab, var(--gold) 14%, var(--ivory))",
        border: "1px solid color-mix(in oklab, var(--gold) 35%, transparent)",
      }}
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* sprout */}
        <path d="M12 8c0-1.6 1.1-3 2.6-3.4" />
        <path d="M12 8c0-1.6-1.1-3-2.6-3.4" />
        <path d="M12 8v3" />
        {/* open book */}
        <path d="M4 11c2.5-0.6 5-0.6 8 1 3-1.6 5.5-1.6 8-1" />
        <path d="M4 11v7c2.5-0.6 5-0.6 8 1 3-1.6 5.5-1.6 8-1v-7" />
        <path d="M12 12v7" />
      </svg>
    </span>
  );
}