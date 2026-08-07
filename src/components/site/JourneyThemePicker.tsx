import { useNavigate, useSearch } from "@tanstack/react-router";
import { BookOpen, Check, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePublishedJourneys } from "@/lib/content/catalog";
import { useI18n } from "@/lib/i18n";

/**
 * Lets the reader swap the puzzle's subject without leaving the screen.
 *
 * It only changes the `journey` search param — the Today screen already reads
 * that param, so the devotional, words and grid follow along.
 */
export function JourneyThemePicker({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { journey?: string };
  const { data: journeys = [] } = usePublishedJourneys();

  const current = journeys.find((j) => j.slug === search?.journey);
  const label = current?.title ?? t("today.dailyJourney");

  const pick = (slug?: string) => {
    void navigate({ to: "/today", search: slug ? { journey: slug } : {} });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "icon" : "sm"}
          className={compact ? "h-11 w-11 sm:h-9 sm:w-9" : "h-11 max-w-[15rem] sm:h-9"}
          aria-label={t("today.changeTheme")}
          title={t("today.changeTheme")}
        >
          <BookOpen className={compact ? "h-4 w-4" : "mr-1.5 h-4 w-4 shrink-0"} />
          {!compact && (
            <>
              <span className="truncate">{label}</span>
              <ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-60" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[60vh] w-64 overflow-y-auto">
        <DropdownMenuLabel>{t("today.changeTheme")}</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => pick(undefined)} className="gap-2">
          <Sparkles className="h-4 w-4 opacity-60" />
          <span className="flex-1 truncate">{t("today.dailyJourney")}</span>
          {!search?.journey && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        {journeys.length > 0 && <DropdownMenuSeparator />}
        {journeys.map((journey) => (
          <DropdownMenuItem key={journey.id} onSelect={() => pick(journey.slug)} className="gap-2">
            <span className="flex-1 truncate">{journey.title}</span>
            {search?.journey === journey.slug && <Check className="h-4 w-4 shrink-0" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
