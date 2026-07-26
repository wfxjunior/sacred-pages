import { Check, Globe } from "lucide-react";
import { LOCALES, useI18n, type Locale } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();
  const current = LOCALES.find((l) => l.code === locale)!;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Language: ${current.label}`}
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <Globe className="h-4 w-4" />
        <span suppressHydrationWarning className="font-medium tracking-wide">
          {current.short}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {LOCALES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onSelect={() => setLocale(l.code as Locale)}
            className={
              "flex items-center justify-between gap-3 " +
              (locale === l.code ? "font-medium text-foreground" : "")
            }
          >
            <span>{l.label}</span>
            {locale === l.code ? <Check className="h-4 w-4 text-primary" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}