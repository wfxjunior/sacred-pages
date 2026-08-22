"use client";

import * as React from "react";
import { Check, X, Minus, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@tanstack/react-router";
import {
  PLAN_FEATURE_GROUPS,
  PLAN_GROUP_LABEL_KEYS,
  featuresForGroup,
  type PlanAvailability,
} from "@/lib/plans/features";

const COMPARE_ROWS = [
  { labelKey: "compare.row.dailyJourney", free: true, premium: true },
  { labelKey: "compare.row.selectedCollections", free: true, premium: true },
  { labelKey: "compare.row.fullLibrary", free: false, premium: true },
  { labelKey: "compare.row.allCollections", free: false, premium: true },
  { labelKey: "compare.row.personalization", free: "compare.val.limited", premium: "compare.val.complete" },
  { labelKey: "compare.row.progressHistory", free: "compare.val.basic", premium: "compare.val.advanced" },
  { labelKey: "compare.row.darkMode", free: true, premium: true },
  { labelKey: "compare.row.languages", free: true, premium: true },
  { labelKey: "compare.row.favorites", free: true, premium: true },
  { labelKey: "compare.row.exclusive", free: false, premium: true },
  { labelKey: "compare.row.milestones", free: false, premium: true },
  { labelKey: "compare.row.together", free: "compare.val.viewOnly", premium: "compare.val.upTo5" },
  { labelKey: "compare.row.offline", free: false, premium: true },
  { labelKey: "compare.row.family", free: false, premium: "compare.val.comingSoon" },
  { labelKey: "compare.row.support", free: false, premium: true },
] as const;

function CompareValue({ value, t }: { value: boolean | string; t: (key: string) => string }) {
  if (value === true) {
    return <Check className="h-4 w-4" style={{ color: "var(--brand)" }} strokeWidth={2.5} />;
  }
  if (value === false) {
    return <X className="h-4 w-4 text-muted-foreground/40" strokeWidth={2} />;
  }
  return <span className="text-xs font-medium">{t(value)}</span>;
}

function CellMark({ v, highlight }: { v: PlanAvailability; highlight?: boolean }) {
  if (v === "included") {
    return <Check className="h-4 w-4" style={{ color: highlight ? "var(--brand)" : "var(--sage)" }} strokeWidth={2.5} />;
  }
  if (v === "soon") {
    return <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Soon</span>;
  }
  return <Minus className="h-4 w-4 text-muted-foreground/40" strokeWidth={2} />;
}

export function ComparePlansSheet({
  trigger,
  showCta = true,
  variant = "simple",
}: {
  trigger: React.ReactNode;
  showCta?: boolean;
  variant?: "simple" | "detailed";
}) {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="flex h-[85vh] max-h-[800px] flex-col rounded-t-3xl border-t border-border/60 bg-card p-0 pt-6"
      >
        <div className="px-5 pb-2 sm:px-6">
          <SheetHeader className="text-left">
            <SheetTitle className="font-serif text-2xl">
              {t("pricing.compare.title")}
            </SheetTitle>
            <SheetDescription>{t("pricing.compare.ctaSub")}</SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 sm:px-6">
          {variant === "simple" ? (
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-background">
              <div className="grid grid-cols-[1.4fr_1fr_1fr] items-center gap-3 border-b border-border/60 bg-[color-mix(in_oklab,var(--brand)_5%,transparent)] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <span>{t("pricing.compare.feature")}</span>
                <span className="text-center">{t("pricing.compare.free")}</span>
                <span className="text-center" style={{ color: "var(--brand)" }}>
                  {t("pricing.compare.premium")}
                </span>
              </div>
              <ul className="divide-y divide-border/60">
                {COMPARE_ROWS.map((row) => (
                  <li
                    key={row.labelKey}
                    className="grid grid-cols-[1.4fr_1fr_1fr] items-center gap-3 px-4 py-3 text-sm hover:bg-[color-mix(in_oklab,var(--brand)_3%,transparent)]"
                  >
                    <span className="font-medium text-foreground/90">{t(row.labelKey)}</span>
                    <span className="flex justify-center text-center text-muted-foreground">
                      <CompareValue value={row.free} />
                    </span>
                    <span className="flex justify-center text-center">
                      <CompareValue value={row.premium} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-background">
              {PLAN_FEATURE_GROUPS.map((group) => (
                <div key={group}>
                  <div
                    className="border-b border-border/60 bg-[color:var(--surface-2)] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: "var(--walnut)" }}
                  >
                    {t(PLAN_GROUP_LABEL_KEYS[group])}
                  </div>
                  {featuresForGroup(group).map((r) => (
                    <div
                      key={r.id}
                      className="grid grid-cols-[1.5fr_1fr_1fr] items-center gap-3 border-b border-border/50 px-4 py-3 text-[14px] last:border-b-0"
                    >
                      <span>{t(r.labelKey)}</span>
                      <span className="flex justify-center">
                        <CellMark v={r.free} />
                      </span>
                      <span className="flex justify-center">
                        <CellMark v={r.premium} highlight />
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {showCta && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                variant="editorialOutline"
                className="h-12 w-full px-6 text-[15px]"
                onClick={() => setOpen(false)}
              >
                <Link to="/signup">{t("cta.startFree")}</Link>
              </Button>
              <Button
                asChild
                variant="editorial"
                className="group h-12 w-full px-6 text-[15px]"
                onClick={() => setOpen(false)}
              >
                <Link to="/signup">
                  {t("cta.startJourney")}
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
