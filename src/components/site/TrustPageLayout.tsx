import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "./SiteLayout";
import { LumenaLogo } from "./LumenaLogo";

export function TrustPageLayout({
  eyebrow,
  title,
  lastUpdated,
  children,
}: {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <LumenaLogo size="sm" />
        </Link>
        <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>
          {eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        <div className="mt-10 space-y-6 text-base leading-relaxed text-foreground/90">
          {children}
        </div>
        <p className="mt-12 rounded-lg border bg-[color:var(--surface)] p-4 text-sm text-muted-foreground">
          This page is maintained by the Lumen Verse team to answer common questions about our service.
          It describes the platform as it works today and may be updated as the service changes.
          For legal advice, please contact a qualified attorney.
        </p>
      </div>
    </SiteLayout>
  );
}

export function TrustH2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-8 font-serif text-xl font-semibold text-foreground first:mt-0">
      {children}
    </h2>
  );
}

export function TrustList({ items }: { items: string[] }) {
  return (
    <ul className="ml-5 list-disc space-y-2 text-foreground/90">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
