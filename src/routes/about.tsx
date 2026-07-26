import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Lumen Verse" },
      { name: "description", content: "The story behind a peaceful, premium daily Scripture experience." },
      { property: "og:title", content: "About — Lumen Verse" },
      { property: "og:description", content: "About Lumen Verse — a living Scripture library for your everyday life." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>About</p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">A quiet place for God's Word.</h1>
        <div className="mt-8 space-y-5 text-base leading-relaxed text-foreground/90">
          <p>
            Lumen Verse is a living Scripture library. We build slow, thoughtful tools that make time in the Bible feel like a
            small ritual — not another task.
          </p>
          <p>
            Every day, you'll find a short devotional, an interactive word search, a passage to reflect on, and a prayer to close
            with. The interface stays out of the way; the Word stays at the center.
          </p>
          <p>
            We're a small team writing carefully, translating carefully, and designing carefully. Thank you for being here.
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}