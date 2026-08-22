import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import giftIllustration from "@/assets/donate-illustration.jpg";

type SuccessSearch = { kind?: "gift"; session_id?: string };

export const Route = createFileRoute("/checkout/success")({
  validateSearch: (search: Record<string, unknown>): SuccessSearch => ({
    kind: search["kind"] === "gift" ? "gift" : undefined,
    session_id: typeof search["session_id"] === "string" ? search["session_id"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Thank You — Lumena" },
      {
        name: "description",
        content: "Your gift keeps daily Scripture journeys open to readers everywhere.",
      },
      { property: "og:title", content: "Thank You — Lumena" },
      {
        property: "og:description",
        content: "Your gift keeps daily Scripture journeys open to readers everywhere.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutSuccess,
});

function CheckoutSuccess() {
  const { kind, session_id } = Route.useSearch();
  if (kind === "gift") return <GiftThanks sessionId={session_id} />;
  return <PremiumWelcome />;
}

function PremiumWelcome() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-xl px-5 py-24 text-center sm:px-6 md:py-32">
        <div
          className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "color-mix(in oklab, var(--sage) 15%, transparent)" }}
        >
          <CheckCircle className="h-8 w-8" style={{ color: "var(--sage)" }} />
        </div>
        <h1 className="font-serif text-3xl leading-tight md:text-4xl">Welcome to Premium.</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          Your subscription is now active. You can invite others to Journey Together and unlock
          every collection.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:flex sm:justify-center">
          <Button asChild size="lg" variant="editorial" className="h-12 w-full px-6 text-[15px] sm:w-auto sm:min-w-[180px]">
            <Link to="/today">Start Today's Journey</Link>
          </Button>
          <Button asChild size="lg" variant="editorialOutline" className="h-12 w-full px-6 text-[15px] sm:w-auto sm:min-w-[180px]">
            <Link to="/profile">View Profile</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}

function GiftThanks({ sessionId }: { sessionId?: string }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function save() {
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || saving) return;
    setSaving(true);
    const { error } = await supabase.from("gift_contacts").insert({
      email: value,
      name: name.trim() || null,
      session_id: sessionId ?? null,
      source: "gift",
    });
    setSaving(false);
    if (error) {
      toast.error("We couldn't save that. Please try again.");
      return;
    }
    setDone(true);
  }

  return (
    <SiteLayout>
      <section className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-20">
        <figure className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
          <img
            src={giftIllustration}
            alt="An open Bible on a table beside a warm cup of coffee"
            width={1280}
            height={720}
            loading="lazy"
            decoding="async"
            className="h-auto w-full"
          />
        </figure>

        <header className="mt-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Gift received
          </span>
          <h1 className="mt-5 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
            Thank you for your generosity.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            Your gift keeps Lumena's daily devotionals and Scripture word searches open and free
            for readers around the world. A receipt is on its way to your inbox.
          </p>
        </header>

        <div className="mt-9 rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-8">
          {done ? (
            <p className="text-center text-[15px] leading-relaxed text-muted-foreground">
              You're on the list. We'll send you a short note now and then — never spam.
            </p>
          ) : (
            <>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Stay in touch — optional
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                Leave your email and we'll send you an occasional prayer and updates on where your
                gift goes.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-12 rounded-2xl border border-border/70 bg-background px-4 text-base outline-none focus:border-[var(--walnut)]"
                />
                <input
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="h-12 rounded-2xl border border-border/70 bg-background px-4 text-base outline-none focus:border-[var(--walnut)]"
                />
              </div>
              <Button
                size="lg"
                disabled={saving}
                onClick={() => void save()}
                className="mt-4 h-12 w-full rounded-full bg-[var(--walnut)] text-base text-white hover:bg-[var(--walnut)]/90"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Keep me posted"}
              </Button>
            </>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:flex sm:justify-center">
          <Button asChild size="lg" variant="editorial" className="h-12 w-full px-6 text-[15px] sm:w-auto sm:min-w-[180px]">
            <Link to="/today">Start Today's Journey</Link>
          </Button>
          <Button asChild size="lg" variant="editorialOutline" className="h-12 w-full px-6 text-[15px] sm:w-auto sm:min-w-[180px]">
            <Link to="/">Back Home</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
