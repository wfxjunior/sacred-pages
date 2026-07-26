import type { ReactNode } from "react";

export function Section({
  eyebrow,
  title,
  sub,
  children,
  className = "",
}: {
  eyebrow?: string;
  title?: string;
  sub?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mx-auto max-w-7xl px-6 py-20 md:py-28 ${className}`}>
      {(eyebrow || title || sub) && (
        <div className="mb-12 max-w-2xl">
          {eyebrow && (
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>
              {eyebrow}
            </p>
          )}
          {title && <h2 className="font-serif text-3xl leading-tight md:text-4xl">{title}</h2>}
          {sub && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{sub}</p>}
        </div>
      )}
      {children}
    </section>
  );
}