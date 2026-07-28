// TODO: Implement real Journey Together invitations, permissions and email sending.
// Frontend prototype only — mock state, no persistence.

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Share2, Sparkles, Lock } from "lucide-react";
import { RELATIONSHIPS } from "@/lib/mock/companions";

export function InviteCompanionModal({ trigger }: { trigger: ReactNode }) {
  const [rel, setRel] = useState<string>("Spouse");
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText("https://jornadas.app/i/together/mock-link").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{ background: "color-mix(in oklab, var(--gold) 14%, transparent)", color: "var(--gold)" }}
            >
              <Sparkles className="h-3 w-3" /> Premium
            </span>
          </div>
          <DialogTitle className="mt-2 font-serif text-2xl">Invite a companion</DialogTitle>
          <DialogDescription>
            Walk through the same journey with someone you trust.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="companion-email" className="text-[12px] uppercase tracking-widest text-muted-foreground">Email</Label>
            <Input id="companion-email" type="email" placeholder="name@example.com" />
          </div>
          <div className="grid gap-2">
            <Label className="text-[12px] uppercase tracking-widest text-muted-foreground">Relationship</Label>
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIPS.map((r) => {
                const active = rel === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRel(r)}
                    className={`rounded-full border px-3 py-1.5 text-[13px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      active ? "border-primary bg-primary/10 text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="companion-message" className="text-[12px] uppercase tracking-widest text-muted-foreground">Personal message — optional</Label>
            <Textarea id="companion-message" rows={3} placeholder="Would you like to walk through this journey with me?" />
          </div>
          <div className="rounded-xl border border-border/60 bg-[color:var(--surface-2)] p-4">
            <div className="flex items-start gap-2 text-[12px] text-muted-foreground">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--sage)" }} />
              <span>
                Your reflections and prayers stay private by default. You
                choose what to share with your companion.
              </span>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-2 flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleCopy} className="rounded-full">
            <Copy className="mr-1.5 h-4 w-4" />
            {copied ? "Link copied" : "Copy link"}
          </Button>
          <Button variant="ghost" className="rounded-full">
            <Share2 className="mr-1.5 h-4 w-4" />
            Share invitation
          </Button>
          <Button className="rounded-full">Send invitation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}