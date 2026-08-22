import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Heart, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { createDonationSession } from "@/lib/stripe/donation.functions";
import giftIllustration from "@/assets/donate-illustration.jpg";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Give to Lumena — Support Daily Scripture Journeys" },
      {
        name: "description",
        content:
          "Give a one-time gift to keep Lumena's daily devotionals and Bible word searches free for readers around the world.",
      },
      { property: "og:title", content: "Give to Lumena" },
      {
        property: "og:description",
        content: "A one-time gift keeps daily Scripture journeys open to everyone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DonatePage,
});

const PRESETS = [5, 10, 30, 50, 100] as const;

function DonatePage() {
  const { t } = useI18n();
  const donate = useServerFn(createDonationSession);
  const [selected, setSelected] = useState<number | "custom">(10);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);

  const amount = selected === "custom" ? Math.floor(Number(custom) || 0) : selected;
  const valid = amount >= 5 && amount <= 5000;

  async function submit() {
    if (!valid || loading) return;
    setLoading(true);
    try {
      const { url } = await donate({ data: { amount } });
      window.location.href = url;
    } catch {
      toast.error(t("donate.error"));
      setLoading(false);
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-6 sm:py-20">
        <figure className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
          <img
            src={giftIllustration}
            alt="An open Bible on a table beside a warm cup of coffee"
            width={1280}
            height={720}
            decoding="async"
            className="h-auto w-full"
          />
        </figure>

        <header className="mt-8 text-center">
          <h1 className="font-serif text-3xl leading-tight text-foreground sm:text-5xl">
            {t("donate.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("donate.sub")}
          </p>
          <button
            type="button"
            onClick={() => {
              document.getElementById("donate-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="tap-scale mt-6 inline-flex items-center gap-2 rounded-full bg-[#2B2B2B] px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#2B2B2B]/90"
          >
            {t("donate.now")}
          </button>
        </header>

        <div id="donate-form" className="mt-9 rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {t("donate.chooseAmount")}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PRESETS.map((value) => {
              const active = selected === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelected(value)}
                  aria-pressed={active}
                  className={`tap-scale flex min-h-[68px] flex-col items-center justify-center rounded-2xl border px-4 py-3 transition ${
                    active
                      ? "border-[var(--walnut)] bg-[color-mix(in_oklab,var(--walnut)_12%,transparent)] text-[var(--walnut)] shadow-sm"
                      : "border-border/70 bg-background text-foreground hover:bg-secondary"
                  }`}
                >
                  <span className="font-serif text-2xl leading-none">${value}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setSelected("custom")}
              aria-pressed={selected === "custom"}
              className={`tap-scale flex min-h-[68px] flex-col items-center justify-center rounded-2xl border px-4 py-3 transition ${
                selected === "custom"
                  ? "border-[var(--walnut)] bg-[color-mix(in_oklab,var(--walnut)_12%,transparent)] text-[var(--walnut)] shadow-sm"
                  : "border-border/70 bg-background text-foreground hover:bg-secondary"
              }`}
            >
              <Sparkles className="h-5 w-5" />
              <span className="mt-1.5 text-[11px] uppercase tracking-[0.12em] opacity-80">
                {t("donate.custom")}
              </span>
            </button>
          </div>

          {selected === "custom" && (
            <label className="mt-4 block">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {t("donate.customLabel")}
              </span>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border/70 bg-background px-4 py-3">
                <span className="font-serif text-xl text-muted-foreground">$</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={5}
                  max={5000}
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder="25"
                  className="w-full bg-transparent text-lg outline-none"
                />
              </div>
              {!valid && custom !== "" && (
                <p className="mt-2 text-xs text-muted-foreground">{t("donate.range")}</p>
              )}
            </label>
          )}

          <Button
            size="lg"
            disabled={!valid || loading}
            onClick={() => void submit()}
            className="mt-6 h-13 w-full rounded-full bg-[#2B2B2B] py-6 text-base text-white hover:bg-[#2B2B2B]/90"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {t("donate.cta")}
                {valid ? ` · $${amount}` : ""}
              </>
            )}
          </Button>

          <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            {t("donate.secure")}
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {["donate.use1", "donate.use2", "donate.use3"].map((key) => (
            <div key={key} className="rounded-2xl border border-border/60 bg-card/60 p-4">
              <p className="text-sm leading-relaxed text-muted-foreground">{t(key)}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
