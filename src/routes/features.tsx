import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HeroMockup } from "@/components/site/HeroMockup";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  Search,
  ScrollText,
  Heart,
  MessageCircle,
  Library,
  Star,
  TrendingUp,
  Award,
  SlidersHorizontal,
  Palette,
  Moon,
  Globe,
  Users,
  Home as HomeIcon,
  Church,
  Accessibility,
  MonitorSmartphone,
  ArrowRight,
  Check,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — A calm, complete way to walk with Scripture" },
      {
        name: "description",
        content:
          "Explore every feature of Jornadas da Palavra — daily Bible journeys, interactive word searches, devotionals, reflection, prayer, collections, progress and more.",
      },
      { property: "og:title", content: "Features — Jornadas da Palavra" },
      {
        property: "og:description",
        content:
          "Everything you need to build a daily habit in God's Word — beautifully designed and thoughtfully organized.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FeaturesPage,
});

type Badge = "Free" | "Premium" | "Coming Soon";

function PlanBadge({ kind }: { kind: Badge }) {
  const map: Record<Badge, { bg: string; fg: string; label: string }> = {
    Free: {
      bg: "color-mix(in oklab, var(--sage) 14%, transparent)",
      fg: "var(--sage)",
      label: "Free",
    },
    Premium: {
      bg: "color-mix(in oklab, var(--brand) 14%, transparent)",
      fg: "var(--brand)",
      label: "Premium",
    },
    "Coming Soon": {
      bg: "color-mix(in oklab, var(--dusty-blue) 14%, transparent)",
      fg: "var(--dusty-blue)",
      label: "Coming Soon",
    },
  };
  const s = map[kind];
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
      style={{
        background: s.bg,
        color: s.fg,
        borderColor: `color-mix(in oklab, ${s.fg} 35%, transparent)`,
      }}
    >
      {s.label}
    </span>
  );
}

/* ---------- Feature preview visuals (no external images) ---------- */

function PreviewFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-3xl border border-border/60 bg-card p-5 sm:p-7"
      style={{
        boxShadow:
          "0 40px 100px -60px color-mix(in oklab, var(--ink) 25%, transparent)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 20% 10%, color-mix(in oklab, var(--brand) 8%, transparent), transparent 70%)",
        }}
      />
      {children}
    </div>
  );
}

function ReadingPreview() {
  return (
    <PreviewFrame>
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: "var(--walnut)" }}
      >
        Philippians 4:6–7
      </p>
      <h4 className="mt-2 font-serif text-2xl leading-snug">
        Gratitude that transforms
      </h4>
      <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">
        Do not be anxious about anything, but in every situation, by prayer and
        petition, with thanksgiving, present your requests to God.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        And the peace of God, which transcends all understanding, will guard
        your hearts and your minds in Christ Jesus.
      </p>
      <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
        <span>Reading · 2 min</span>
        <span>Serif · Medium</span>
      </div>
    </PreviewFrame>
  );
}

function DevotionalPreview() {
  return (
    <PreviewFrame>
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Daily Devotional
      </div>
      <h4 className="mt-3 font-serif text-2xl leading-snug">A quiet place to begin.</h4>
      <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">
        Anxiety loses its grip the moment we bring it into the light. Today,
        practice returning your worries to God — one thanksgiving at a time.
      </p>
      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        {["Read", "Reflect", "Pray"].map((s, i) => (
          <div
            key={s}
            className="group cursor-pointer rounded-xl border border-border/60 bg-background/60 py-3 text-[11px] uppercase tracking-wider transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-background hover:shadow-md hover:border-border"
            style={{ color: i === 0 ? "var(--brand)" : "var(--muted-foreground)" }}
          >
            {s}
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}

function ReflectionPreview() {
  return (
    <PreviewFrame>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Reflection
      </p>
      <h4 className="mt-2 font-serif text-xl">What am I carrying today?</h4>
      <div className="mt-5 rounded-xl border border-border/60 bg-background p-4">
        <p className="text-[14px] leading-relaxed text-foreground/85">
          I've been holding on to a worry about work. I want to bring it, with
          thanks, and trust God with the outcome…
        </p>
        <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Saved privately</span>
          <span>142 words</span>
        </div>
      </div>
    </PreviewFrame>
  );
}

function PrayerPreview() {
  return (
    <PreviewFrame>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Prayer
      </p>
      <blockquote className="mt-3 font-serif text-2xl leading-snug">
        “Father, thank you for the peace that guards my heart today. Teach me
        to bring every worry to you with gratitude.”
      </blockquote>
      <div className="mt-6 flex flex-wrap gap-2">
        {["Peace", "Gratitude", "Trust"].map((c) => (
          <span
            key={c}
            className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground"
          >
            {c}
          </span>
        ))}
      </div>
    </PreviewFrame>
  );
}

function CollectionsPreview() {
  const items = [
    { t: "The Life of Jesus", n: "12 journeys", c: "var(--brand)" },
    { t: "Psalms of Peace", n: "8 journeys", c: "var(--sage)" },
    { t: "Proverbs Daily", n: "31 journeys", c: "var(--dusty-blue)" },
    { t: "Paul's Letters", n: "14 journeys", c: "var(--walnut)" },
  ];
  return (
    <PreviewFrame>
      <div className="grid grid-cols-2 gap-3">
        {items.map((i) => (
          <div
            key={i.t}
            className="rounded-xl border border-border/60 bg-background p-4"
          >
            <span
              className="mb-3 inline-block h-2 w-8 rounded-full"
              style={{ background: i.c }}
            />
            <p className="font-serif text-[15px] leading-tight">{i.t}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{i.n}</p>
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}

function FavoritesPreview() {
  return (
    <PreviewFrame>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Your Favorites
      </p>
      <ul className="mt-4 divide-y divide-border/60">
        {[
          "Gratitude That Transforms",
          "The Good Shepherd",
          "Fruit of the Spirit",
          "Love is Patient",
        ].map((f) => (
          <li key={f} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Star
                className="h-4 w-4"
                style={{ color: "var(--brand)" }}
                fill="currentColor"
              />
              <span className="text-[14px]">{f}</span>
            </div>
            <span className="text-[11px] text-muted-foreground">Saved</span>
          </li>
        ))}
      </ul>
    </PreviewFrame>
  );
}

function ProgressPreview() {
  const week = [30, 55, 42, 78, 60, 92, 70];
  return (
    <PreviewFrame>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            This week
          </p>
          <p className="mt-1 font-serif text-3xl">432 min</p>
        </div>
        <span
          className="rounded-full px-3 py-1 text-[11px] font-medium"
          style={{
            background: "color-mix(in oklab, var(--brand) 14%, transparent)",
            color: "var(--brand)",
          }}
        >
          12 day streak
        </span>
      </div>
      <div className="mt-6 flex h-32 items-end gap-2">
        {week.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-full w-full items-end">
              <div
                className="w-full rounded-t-md"
                style={{
                  height: `${v}%`,
                  background:
                    "linear-gradient(180deg, var(--brand), color-mix(in oklab, var(--brand) 40%, var(--sage)))",
                }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              {"MTWTFSS"[i]}
            </span>
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}

function MilestonesPreview() {
  const m = [
    { t: "7 Days in a Row", d: "Consistency milestone" },
    { t: "First Collection Complete", d: "Psalms of Peace" },
    { t: "100 Words Discovered", d: "Word search mastery" },
    { t: "30-Day Rhythm", d: "One month of quiet time" },
  ];
  return (
    <PreviewFrame>
      <ul className="grid gap-3 sm:grid-cols-2">
        {m.map((x) => (
          <li
            key={x.t}
            className="flex items-start gap-3 rounded-xl border border-border/60 bg-background p-4"
          >
            <Award
              className="mt-0.5 h-5 w-5 shrink-0"
              style={{ color: "var(--brand)" }}
            />
            <div>
              <p className="text-[14px] font-medium">{x.t}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">{x.d}</p>
            </div>
          </li>
        ))}
      </ul>
    </PreviewFrame>
  );
}

function DifficultyPreview() {
  const levels = [
    { t: "Gentle", d: "6×6 · horizontal & vertical", pct: 25 },
    { t: "Balanced", d: "10×10 · adds diagonals", pct: 50 },
    { t: "Challenging", d: "12×12 · reversed & diagonal", pct: 75 },
    { t: "Expert", d: "14×14 · all directions", pct: 100 },
  ];
  return (
    <PreviewFrame>
      <div className="space-y-4">
        {levels.map((l) => (
          <div key={l.t}>
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-medium">{l.t}</span>
              <span className="text-muted-foreground">{l.d}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color:var(--surface-2)]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${l.pct}%`,
                  background:
                    "linear-gradient(90deg, var(--sage), var(--brand))",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}

function PersonalizationPreview() {
  const rows = [
    { l: "Selection color", v: "Gold" },
    { l: "Difficulty", v: "Balanced" },
    { l: "Font size", v: "Medium" },
    { l: "Reading mode", v: "Light" },
    { l: "Language", v: "English" },
  ];
  return (
    <PreviewFrame>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Settings
      </p>
      <div className="mt-4 divide-y divide-border/60">
        {rows.map((r) => (
          <div key={r.l} className="flex items-center justify-between py-3">
            <span className="text-[14px]">{r.l}</span>
            <span
              className="rounded-full border border-border/60 bg-background px-3 py-1 text-[12px]"
              style={{ color: "var(--walnut)" }}
            >
              {r.v}
            </span>
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}

function DarkModePreview() {
  return (
    <PreviewFrame>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border/60 bg-background p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Light
          </p>
          <p className="mt-3 font-serif text-lg leading-snug">
            The Lord is my shepherd.
          </p>
        </div>
        <div
          className="rounded-2xl border p-5"
          style={{
            background: "#1B1B1B",
            borderColor: "rgba(255,255,255,0.08)",
            color: "#EDE9E1",
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "#B88A3B" }}
          >
            Dark
          </p>
          <p className="mt-3 font-serif text-lg leading-snug">
            The Lord is my shepherd.
          </p>
        </div>
      </div>
    </PreviewFrame>
  );
}

function LanguagesPreview() {
  const langs = [
    { code: "EN", name: "English" },
    { code: "PT", name: "Português" },
    { code: "ES", name: "Español" },
    { code: "FR", name: "Français", soon: true },
    { code: "DE", name: "Deutsch", soon: true },
    { code: "IT", name: "Italiano", soon: true },
  ];
  return (
    <PreviewFrame>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {langs.map((l) => (
          <div
            key={l.code}
            className="rounded-xl border border-border/60 bg-background p-4"
          >
            <div className="flex items-center justify-between">
              <span
                className="font-serif text-lg"
                style={{ color: "var(--brand)" }}
              >
                {l.code}
              </span>
              {l.soon && (
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                  Soon
                </span>
              )}
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">{l.name}</p>
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}

function TogetherPreview() {
  const m = [
    { n: "Ana", pct: 92, c: "var(--brand)" },
    { n: "Lucas", pct: 78, c: "var(--sage)" },
    { n: "Sofia", pct: 64, c: "var(--dusty-blue)" },
  ];
  return (
    <PreviewFrame>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="text-[11px] uppercase tracking-widest">
            This week together
          </span>
        </div>
        <span
          className="text-sm font-medium"
          style={{ color: "var(--brand)" }}
        >
          12 · shared streak
        </span>
      </div>
      <div className="mt-5 space-y-3">
        {m.map((x) => (
          <div key={x.n} className="flex items-center gap-3">
            <span
              className="grid h-9 w-9 place-items-center rounded-full text-[13px] font-medium text-white"
              style={{ background: x.c }}
            >
              {x.n[0]}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm">
                <span>{x.n}</span>
                <span className="text-muted-foreground">{x.pct}%</span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[color:var(--surface-2)]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${x.pct}%`, background: x.c }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}

function FamilyPreview() {
  return (
    <PreviewFrame>
      <div className="flex items-center gap-2">
        <PlanBadge kind="Coming Soon" />
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Family Mode
        </span>
      </div>
      <h4 className="mt-4 font-serif text-2xl">Walk together as a household.</h4>
      <ul className="mt-5 space-y-3 text-[14px] text-foreground/85">
        {[
          "Age-appropriate versions for kids",
          "Shared devotional at family time",
          "Milestones celebrated together",
          "Private reflections for each member",
        ].map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: "var(--sage)" }}
            />
            {f}
          </li>
        ))}
      </ul>
    </PreviewFrame>
  );
}

function ChurchPreview() {
  return (
    <PreviewFrame>
      <div className="flex items-center gap-2">
        <PlanBadge kind="Coming Soon" />
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Church Groups
        </span>
      </div>
      <h4 className="mt-4 font-serif text-2xl">A quiet space for your small group.</h4>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {[
          { t: "Weekly Study", d: "Shared plan for the group" },
          { t: "Leader Notes", d: "Private discussion guide" },
          { t: "Prayer Requests", d: "Kept between members" },
          { t: "Attendance", d: "Gentle, opt-in tracking" },
        ].map((c) => (
          <div
            key={c.t}
            className="rounded-xl border border-border/60 bg-background p-4"
          >
            <p className="text-[13px] font-medium">{c.t}</p>
            <p className="mt-1 text-[12px] text-muted-foreground">{c.d}</p>
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}

function AccessibilityPreview() {
  return (
    <PreviewFrame>
      <div className="space-y-4">
        {[
          { l: "Text size", v: "A- · A · A+", n: "Scales up to 200%" },
          { l: "Contrast", v: "AA · AAA", n: "Tested across states" },
          { l: "Motion", v: "Reduced", n: "Respects OS setting" },
          { l: "Keyboard", v: "Full", n: "Every action reachable" },
          { l: "Screen readers", v: "Optimized", n: "Semantic markup" },
        ].map((r) => (
          <div
            key={r.l}
            className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3"
          >
            <div>
              <p className="text-[13px] font-medium">{r.l}</p>
              <p className="text-[11px] text-muted-foreground">{r.n}</p>
            </div>
            <span
              className="rounded-full border border-border/60 px-3 py-1 text-[11px]"
              style={{ color: "var(--walnut)" }}
            >
              {r.v}
            </span>
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}

function CrossDevicePreview() {
  return (
    <PreviewFrame>
      <div className="grid grid-cols-3 items-end gap-3">
        <div className="col-span-2 rounded-2xl border border-border/60 bg-background p-5">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--brand)" }}
          >
            Desktop
          </p>
          <p className="mt-3 font-serif text-lg leading-snug">
            The same journey, everywhere.
          </p>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            “Your word is a lamp to my feet and a light to my path.” — Psalm
            119:105
          </p>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
            <span className="text-[11px] text-muted-foreground">
              Day 4 · Light &amp; Guidance
            </span>
            <span
              className="text-[11px] font-medium"
              style={{ color: "var(--walnut)" }}
            >
              6 / 8 words
            </span>
          </div>
        </div>
        <div className="rounded-[26px] border-4 border-border/70 bg-background p-3">
          <p
            className="text-[9px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--brand)" }}
          >
            Mobile
          </p>
          <p className="mt-2 font-serif text-[13px] leading-snug">
            Read anywhere.
          </p>
          <div className="mt-3 space-y-1.5">
            {["Read", "Reflect", "Pray", "Word search"].map((s) => (
              <div
                key={s}
                className="rounded-md border border-border/60 px-2 py-1.5 text-[10px] text-muted-foreground"
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PreviewFrame>
  );
}

/* ---------- Feature list definition ---------- */

type Feature = {
  id: string;
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  description: string;
  benefits: string[];
  badge?: Badge;
  Preview: React.FC;
};

const FEATURES: Feature[] = [
  {
    id: "daily-journeys",
    icon: BookOpen,
    eyebrow: "Daily Bible Journeys",
    title: "One passage. A few minutes. A meaningful moment.",
    description:
      "Each journey combines Scripture, a short devotional, an interactive word search, a reflection and a prayer — designed to fit real life without feeling rushed.",
    benefits: [
      "Ready in under 10 minutes",
      "Consistent daily rhythm",
      "Feels like a ritual, not a task",
    ],
    badge: "Free",
    Preview: DevotionalPreview,
  },
  {
    id: "word-search",
    icon: Search,
    eyebrow: "Interactive Bible Word Search",
    title: "Discover the key words hidden inside each passage.",
    description:
      "A calm, tactile grid highlights the words that anchor the passage. Slow, playful, and surprisingly meditative — a new way to sit with Scripture.",
    benefits: [
      "Adjustable difficulty levels",
      "Beautiful, accessible cell states",
      "Reinforces memory and attention",
    ],
    badge: "Free",
    Preview: () => <HeroMockup />,
  },
  {
    id: "reading",
    icon: ScrollText,
    eyebrow: "Scripture Reading",
    title: "A reading experience made for focus.",
    description:
      "Typography, spacing and light have all been tuned to help you read without distraction. No banners, no notifications — just the passage.",
    benefits: [
      "Editorial serif typography",
      "Adjustable font size",
      "Comfortable line length",
    ],
    badge: "Free",
    Preview: ReadingPreview,
  },
  {
    id: "devotionals",
    icon: BookOpen,
    title: "Short, thoughtful writing that meets you where you are.",
    description:
      "Every devotional grounds the day's passage in real, everyday life — never preachy, never performative.",
    benefits: [
      "Written by careful editors",
      "Real-life application",
      "Multiple languages",
    ],
    Preview: DevotionalPreview,
  },
  {
    id: "reflection",
    icon: MessageCircle,
    eyebrow: "Reflection",
    title: "A private space to hear yourself think.",
    description:
      "Journal each day's response privately. Your reflections stay yours — a quiet record of where you've been.",
    benefits: [
      "Private by default",
      "Prompt-guided or free-form",
      "Searchable over time",
    ],
    badge: "Free",
    Preview: ReflectionPreview,
  },
  {
    id: "prayer",
    icon: Heart,
    eyebrow: "Prayer",
    title: "Close each journey with intention.",
    description:
      "A guided prayer to end each session — always short, always personal, always optional.",
    benefits: [
      "Beautifully written prompts",
      "Save prayers you love",
      "Optional prayer reminders",
    ],
    badge: "Free",
    Preview: PrayerPreview,
  },
  {
    id: "collections",
    icon: Library,
    eyebrow: "Collections",
    title: "A living library of curated journeys.",
    description:
      "Explore Scripture through the people, books and themes you love — carefully organized so you always know what's next.",
    benefits: [
      "Themed and character-driven",
      "Progressive difficulty",
      "Curated by editors",
    ],
    badge: "Free",
    Preview: CollectionsPreview,
  },
  {
    id: "favorites",
    icon: Star,
    eyebrow: "Favorites",
    title: "Keep the passages that keep you.",
    description:
      "Save the journeys and verses that move you, and come back to them whenever you need to.",
    benefits: ["One-tap save", "Organized library", "Sync across devices"],
    badge: "Free",
    Preview: FavoritesPreview,
  },
  {
    id: "progress",
    icon: TrendingUp,
    eyebrow: "Journey Progress",
    title: "A calm view of your consistency.",
    description:
      "No leaderboards, no shame. Gentle streaks and weekly minutes to celebrate the rhythm you're building.",
    benefits: [
      "Weekly minutes and days",
      "Beautiful, honest charts",
      "Never shared publicly",
    ],
    badge: "Free",
    Preview: ProgressPreview,
  },
  {
    id: "milestones",
    icon: Award,
    eyebrow: "Milestones",
    title: "Meaningful markers along the way.",
    description:
      "Warm, understated milestones recognize your consistency without turning your walk into a game.",
    benefits: [
      "Personal, not competitive",
      "Thoughtfully spaced",
      "Kept in your journey history",
    ],
    badge: "Free",
    Preview: MilestonesPreview,
  },
  {
    id: "difficulty",
    icon: SlidersHorizontal,
    eyebrow: "Difficulty Levels",
    title: "A word search that grows with you.",
    description:
      "Choose from four levels — Gentle to Expert — and change your mind anytime. Perfect for beginners, kids, and long-time readers.",
    benefits: ["Four levels", "Instant switching", "Kid-friendly Gentle mode"],
    badge: "Free",
    Preview: DifficultyPreview,
  },
  {
    id: "personalization",
    icon: Palette,
    eyebrow: "Personalization",
    title: "Made to feel like yours.",
    description:
      "Fine-tune color, typography, difficulty and language with quiet, thoughtful controls.",
    benefits: [
      "Color and typography controls",
      "Reading mode presets",
      "Saved across devices",
    ],
    badge: "Premium",
    Preview: PersonalizationPreview,
  },
  {
    id: "dark-mode",
    icon: Moon,
    eyebrow: "Dark Mode",
    title: "A gentler light for evenings and mornings.",
    description:
      "A carefully tuned dark palette — warm ink and antique gold — designed to feel calm rather than clinical.",
    benefits: [
      "Tuned for readability",
      "Follows system setting",
      "AA contrast across states",
    ],
    badge: "Free",
    Preview: DarkModePreview,
  },
  {
    id: "languages",
    icon: Globe,
    eyebrow: "Multiple Languages",
    title: "Read Scripture in your language.",
    description:
      "Available today in English, Portuguese and Spanish, with more languages on the way.",
    benefits: [
      "EN · PT · ES today",
      "Browser-aware defaults",
      "Persistent per-device",
    ],
    badge: "Free",
    Preview: LanguagesPreview,
  },
  {
    id: "journey-together",
    icon: Users,
    eyebrow: "Journey Together",
    title: "Walk through the same journey with people you love.",
    description:
      "Invite a spouse, friend, mentor or small group. Celebrate streaks and share encouragement — without turning your walk into a feed.",
    benefits: [
      "Shared streaks",
      "Private reflections",
      "Encouragement, not comparison",
    ],
    badge: "Premium",
    Preview: TogetherPreview,
  },
  {
    id: "family-mode",
    icon: HomeIcon,
    eyebrow: "Future: Family Mode",
    title: "A calm way to walk with your household.",
    description:
      "A shared plan for families with age-appropriate versions for kids, private reflections, and milestones you celebrate together.",
    benefits: [
      "Age-appropriate content",
      "Shared family journey",
      "Private per-member notes",
    ],
    badge: "Coming Soon",
    Preview: FamilyPreview,
  },
  {
    id: "church-groups",
    icon: Church,
    eyebrow: "Future: Church Groups",
    title: "A quiet home for your small group.",
    description:
      "Weekly studies, leader notes, prayer requests and gentle attendance — designed with pastors and leaders in mind.",
    benefits: [
      "Group study plans",
      "Leader-only notes",
      "Private prayer requests",
    ],
    badge: "Coming Soon",
    Preview: ChurchPreview,
  },
  {
    id: "accessibility",
    icon: Accessibility,
    eyebrow: "Accessibility",
    title: "Designed to include everyone.",
    description:
      "Full keyboard navigation, AA contrast, respectful motion, and semantic markup — accessibility is not a feature, it's a foundation.",
    benefits: [
      "Full keyboard support",
      "AA / AAA contrast",
      "Reduced-motion respected",
    ],
    badge: "Free",
    Preview: AccessibilityPreview,
  },
  {
    id: "cross-device",
    icon: MonitorSmartphone,
    eyebrow: "Cross-device Experience",
    title: "The same journey, everywhere you are.",
    description:
      "Web, mobile web and installable PWA — your journey follows you between devices, seamlessly.",
    benefits: [
      "Installable PWA",
      "Responsive on any size",
      "Sync between devices",
    ],
    badge: "Free",
    Preview: CrossDevicePreview,
  },
];

/* ---------- Accordion data ---------- */

type AccItem = {
  q: string;
  what: string;
  who: string;
  how: string;
  status: "Free" | "Premium" | "Coming Soon";
};

const ACCORDION: { category: string; items: AccItem[] }[] = [
  {
    category: "Daily Experience",
    items: [
      {
        q: "Daily Bible Journey",
        what: "A guided 5–10 minute session with Scripture, a devotional, a word search, a reflection and a prayer.",
        who: "Anyone building a daily rhythm with the Bible — from first-time readers to lifelong students.",
        how: "Open the app each day and press Start. Your journey is prepared for you; nothing to plan.",
        status: "Free",
      },
      {
        q: "Devotional",
        what: "A short editorial reading that grounds the day's passage in real life.",
        who: "Readers who want thoughtful, real-world application without long commentary.",
        how: "Included in every journey; also browsable inside collections.",
        status: "Free",
      },
      {
        q: "Prayer",
        what: "A guided prayer to close each journey.",
        who: "Readers who want a gentle way to end their time in Scripture.",
        how: "Always optional — save the prayers that move you, skip the rest.",
        status: "Free",
      },
    ],
  },
  {
    category: "Study",
    items: [
      {
        q: "Interactive Word Search",
        what: "A calm grid that highlights the key words of the passage.",
        who: "All ages — especially readers who learn by doing.",
        how: "Tap or drag across the letters. Words are revealed with an elegant strike-through.",
        status: "Free",
      },
      {
        q: "Reflection Journal",
        what: "Private prompts and free-form writing tied to each journey.",
        who: "Anyone who wants to record what they hear from Scripture.",
        how: "Reflections are saved privately and searchable across your history.",
        status: "Free",
      },
      {
        q: "Collections",
        what: "Curated series organized by book, theme and character.",
        who: "Readers who want a clear path forward, not a blank page.",
        how: "Browse the library and add a collection to your journey.",
        status: "Free",
      },
    ],
  },
  {
    category: "Personalization",
    items: [
      {
        q: "Selection color, typography and reading mode",
        what: "Fine control over how the reading experience feels.",
        who: "Every reader — this is where the product starts to feel yours.",
        how: "Adjust from Settings. Preferences sync across devices.",
        status: "Premium",
      },
      {
        q: "Difficulty levels",
        what: "Four levels for the word search — Gentle to Expert.",
        who: "Beginners, kids and long-time readers alike.",
        how: "Switch anytime from Settings or inside a journey.",
        status: "Free",
      },
      {
        q: "Multiple languages",
        what: "Full interface and content in English, Portuguese and Spanish.",
        who: "International readers and multilingual households.",
        how: "Detected automatically from your browser; changeable at any time.",
        status: "Free",
      },
    ],
  },
  {
    category: "Progress",
    items: [
      {
        q: "Streaks and weekly minutes",
        what: "A gentle view of your consistency over the week and month.",
        who: "Readers who like a quiet sense of progress without pressure.",
        how: "Automatically tracked as you complete daily journeys.",
        status: "Free",
      },
      {
        q: "Milestones",
        what: "Warm, understated markers as your rhythm grows.",
        who: "Anyone who wants to celebrate quiet consistency.",
        how: "Unlocked automatically; kept in your journey history.",
        status: "Free",
      },
      {
        q: "Advanced progress history",
        what: "Detailed history, exportable notes and longer time horizons.",
        who: "Readers who journal seriously and want a lasting record.",
        how: "Included with Premium.",
        status: "Premium",
      },
    ],
  },
  {
    category: "Journey Together",
    items: [
      {
        q: "Invite a spouse, friend or mentor",
        what: "Walk through the same journey with the people closest to you.",
        who: "Couples, close friends and mentoring pairs.",
        how: "Send an invite; each person keeps private reflections.",
        status: "Premium",
      },
      {
        q: "Family Mode",
        what: "A shared plan for households with age-appropriate content.",
        who: "Parents and families with children.",
        how: "Coming soon as part of Premium.",
        status: "Coming Soon",
      },
      {
        q: "Small Groups",
        what: "Weekly studies with leader notes and private prayer requests.",
        who: "Church small groups, home groups, mentoring circles.",
        how: "Coming soon as part of Premium.",
        status: "Coming Soon",
      },
    ],
  },
  {
    category: "Membership",
    items: [
      {
        q: "Free plan",
        what: "The full daily journey experience with selected collections.",
        who: "Anyone starting out, or readers who don't need advanced tools.",
        how: "No credit card required.",
        status: "Free",
      },
      {
        q: "Premium plan",
        what: "Everything free, plus unlimited collections, personalization and Journey Together.",
        who: "Readers ready to deepen their daily rhythm.",
        how: "Monthly or yearly, cancel anytime.",
        status: "Premium",
      },
    ],
  },
  {
    category: "Accessibility",
    items: [
      {
        q: "Keyboard, screen readers and motion",
        what: "Fully keyboard-navigable, semantic markup, and reduced-motion respected.",
        who: "Everyone — accessibility is baked into every feature.",
        how: "Enabled by default; no setup required.",
        status: "Free",
      },
      {
        q: "Typography and contrast",
        what: "AA-tested contrast and adjustable font sizes.",
        who: "Readers with low vision or reading fatigue.",
        how: "Adjustable from Settings.",
        status: "Free",
      },
    ],
  },
  {
    category: "Future Features",
    items: [
      {
        q: "Offline mode",
        what: "Download today's journey and read anywhere, without connection.",
        who: "Commuters, travelers and readers with limited data.",
        how: "Coming soon.",
        status: "Coming Soon",
      },
      {
        q: "Audio Bible",
        what: "Listen to Scripture read beautifully aloud.",
        who: "Readers who want to listen during commutes or quiet moments.",
        how: "Coming soon.",
        status: "Coming Soon",
      },
      {
        q: "AI reflection companion",
        what: "An optional, thoughtful assistant to help you sit with a passage.",
        who: "Readers curious to explore Scripture more deeply.",
        how: "Coming later, always optional and privacy-first.",
        status: "Coming Soon",
      },
    ],
  },
];

/* ---------- Page ---------- */

function FeaturesPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 20% 10%, color-mix(in oklab, var(--brand) 8%, transparent), transparent 60%), radial-gradient(50% 40% at 85% 30%, color-mix(in oklab, var(--sage) 6%, transparent), transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-6 md:py-32">
          <span
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] backdrop-blur"
            style={{ color: "var(--brand)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--brand)" }}
            />
            Features
          </span>
          <h1 className="mt-6 font-serif text-[40px] leading-[1.05] tracking-tight sm:text-[52px] md:text-[64px]">
            Everything you need to build a daily habit in{" "}
            <span style={{ color: "var(--brand)" }}>God's Word.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-muted-foreground md:text-lg">
            Discover how every feature works together to create a peaceful,
            meaningful and consistent Scripture experience.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="editorial" className="group h-12 px-6 text-[15px] sm:min-w-[180px]">
              <Link to="/signup">
                Start Free <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="editorialOutline" className="h-12 px-6 text-[15px] sm:min-w-[180px]">
              <Link to="/pricing">See Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Alternating features */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          {FEATURES.map((f, i) => {
            const reverse = i % 2 === 1;
            const Preview = f.Preview;
            return (
              <div
                key={f.id}
                id={f.id}
                className={`grid items-center gap-12 py-20 md:grid-cols-2 md:gap-16 md:py-28 ${
                  i > 0 ? "border-t border-border/50" : ""
                }`}
              >
                <div className={reverse ? "md:order-2" : ""}>
                  {f.eyebrow && (
                    <p
                      className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em]"
                      style={{ color: "var(--walnut)" }}
                    >
                      {f.eyebrow}
                    </p>
                  )}
                  <h2 className={`font-serif text-3xl leading-[1.1] md:text-[40px] ${f.eyebrow ? "mt-2" : ""}`}>
                    {f.title}
                  </h2>
                  <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground md:text-base">
                    {f.description}
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {f.benefits.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2.5 text-[14px] text-foreground/85"
                      >
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0"
                          style={{ color: "var(--brand)" }}
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={reverse ? "md:order-1" : ""}>
                  <Preview />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Accordion */}
      <section
        id="details"
        className="border-t border-border/60 bg-[color:var(--surface-2)]"
      >
        <div className="mx-auto max-w-5xl px-5 py-24 sm:px-6 md:py-28">
          <div className="mb-14 max-w-2xl">
            <p
              className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--brand)" }}
            >
              Feature guide
            </p>
            <h2 className="font-serif text-3xl leading-tight md:text-[44px]">
              Everything explained, in one calm place.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              Browse by category to see what each feature is, who it's for and
              how it works today.
            </p>
          </div>
          <div className="space-y-12">
            {ACCORDION.map((cat) => (
              <div key={cat.category}>
                <p
                  className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: "var(--walnut)" }}
                >
                  {cat.category}
                </p>
                <Accordion type="single" collapsible className="w-full">
                  {cat.items.map((it, idx) => (
                    <AccordionItem
                      key={idx}
                      value={`${cat.category}-${idx}`}
                      className="border-b border-border/60"
                    >
                      <AccordionTrigger className="text-left text-[15px] font-medium">
                        <span className="flex items-center gap-3">
                          <span>{it.q}</span>
                          <PlanBadge kind={it.status} />
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground">
                        <div className="grid gap-4 pt-2 sm:grid-cols-3">
                          <div>
                            <p
                              className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                              style={{ color: "var(--brand)" }}
                            >
                              What
                            </p>
                            <p className="mt-2 text-foreground/85">{it.what}</p>
                          </div>
                          <div>
                            <p
                              className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                              style={{ color: "var(--brand)" }}
                            >
                              Who
                            </p>
                            <p className="mt-2 text-foreground/85">{it.who}</p>
                          </div>
                          <div>
                            <p
                              className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                              style={{ color: "var(--brand)" }}
                            >
                              How
                            </p>
                            <p className="mt-2 text-foreground/85">{it.how}</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-6 md:py-32">
          <h2 className="font-serif text-3xl leading-tight md:text-5xl">
            Begin your journey today.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
            Spend a few meaningful minutes each day growing in God's Word.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="editorial" className="group h-12 px-6 text-[15px] sm:min-w-[180px]">
              <Link to="/signup">Start Free <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" /></Link>
            </Button>
            <Button asChild size="lg" variant="editorialOutline" className="h-12 px-6 text-[15px] sm:min-w-[180px]">
              <Link to="/today">View Today's Journey</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}