// TODO: Implement real link generation and native sharing.
// Design prototype only — visual previews for shareable cards.

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Download, Share2 } from "lucide-react";

type Format = "square" | "story" | "landscape";
type Theme = "ivory" | "ink";

export function ShareModal({
  trigger,
  title = "Gratitude That Transforms",
  reference = "Philippians 4:6–7",
  excerpt = "Do not be anxious about anything, but in every situation, by prayer and petition, present your requests to God.",
  kind = "Journey",
}: {
  trigger: ReactNode;
  title?: string;
  reference?: string;
  excerpt?: string;
  kind?: string;
}) {
  const [format, setFormat] = useState<Format>("square");
  const [theme, setTheme] = useState<Theme>("ivory");
  const dim =
    format === "square"
      ? "aspect-square"
      : format === "story"
        ? "aspect-[9/16]"
        : "aspect-video";
  const bg = theme === "ivory" ? "var(--ivory)" : "#171817";
  const fg = theme === "ivory" ? "var(--ink)" : "#F5F2EB";
  const muted = theme === "ivory" ? "var(--walnut)" : "#C89F4F";

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Share this moment</DialogTitle>
          <DialogDescription>
            Choose a format and theme. Cards use your brand palette — never generic templates.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
          <div className="mx-auto flex w-full max-w-[380px] items-center justify-center">
            <div
              className={`relative w-full overflow-hidden rounded-2xl border border-border/60 shadow-sm ${dim}`}
              style={{ background: bg, color: fg }}
            >
              <div className="flex h-full flex-col justify-between p-6">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.24em]"
                    style={{ color: muted }}
                  >
                    {kind}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: muted }}>
                    Jornadas da Palavra
                  </span>
                </div>
                <div>
                  <p className="font-serif text-2xl leading-tight md:text-3xl">
                    {excerpt.length > 140 ? excerpt.slice(0, 140) + "…" : excerpt}
                  </p>
                  <p className="mt-4 text-[12px] font-medium" style={{ color: muted }}>
                    {reference} · {title}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px]" style={{ color: muted }}>
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--gold)" }} />
                  jornadas.app
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Format</p>
              <div className="grid grid-cols-3 gap-2">
                {(["square", "story", "landscape"] as Format[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`rounded-lg border px-2 py-2 text-[12px] font-medium capitalize transition ${
                      format === f ? "border-primary bg-primary/10" : "border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Theme</p>
              <div className="grid grid-cols-2 gap-2">
                {(["ivory", "ink"] as Theme[]).map((tt) => (
                  <button
                    key={tt}
                    onClick={() => setTheme(tt)}
                    className={`rounded-lg border px-2 py-2 text-[12px] font-medium capitalize transition ${
                      theme === tt ? "border-primary bg-primary/10" : "border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tt === "ivory" ? "Light" : "Dark"}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border/60 bg-[color:var(--surface-2)] p-3 text-[12px] text-muted-foreground">
              A link to your journey is included. Your private reflections and prayers are never shared.
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="rounded-full">
            <Copy className="mr-1.5 h-4 w-4" /> Copy link
          </Button>
          <Button variant="outline" className="rounded-full">
            <Download className="mr-1.5 h-4 w-4" /> Save image
          </Button>
          <Button className="rounded-full">
            <Share2 className="mr-1.5 h-4 w-4" /> Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}