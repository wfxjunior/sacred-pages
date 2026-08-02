import { useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { Copy, CheckCircle, Sparkles, Lock, Loader2 } from "lucide-react";
import { RELATIONSHIPS } from "@/lib/mock/companions";
import { useI18n } from "@/lib/i18n";
import { createCompanionInvitation } from "@/lib/together/functions";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { Link } from "@tanstack/react-router";

export function InviteCompanionModal({ trigger }: { trigger: ReactNode }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [rel, setRel] = useState<string>(RELATIONSHIPS[0] ?? "Spouse");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const user = useCurrentUser();

  const mutation = useMutation({
    mutationFn: createCompanionInvitation,
    onSuccess: (data) => {
      setLink(`${typeof window !== "undefined" ? window.location.origin : ""}/invite/${data.token}`);
    },
  });

  const handleCopy = () => {
    if (!link) return;
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    mutation.mutate({ email: email.trim(), relationship: rel, message: message.trim() || undefined });
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setEmail("");
      setMessage("");
      setLink(null);
      setCopied(false);
      mutation.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
          <DialogTitle className="mt-2 font-serif text-2xl">{t("together.invite.title")}</DialogTitle>
          <DialogDescription>{t("together.invite.description")}</DialogDescription>
        </DialogHeader>

        {!user.userId && !user.loading ? (
          <div className="space-y-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">{t("together.accept.signInHint")}</p>
            <Button asChild className="rounded-full">
              <Link to="/auth">{t("auth.signIn")}</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {link ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/8 p-4">
                  <p className="flex items-center gap-2 text-[13px] font-medium" style={{ color: "var(--gold)" }}>
                    <CheckCircle className="h-4 w-4" />
                    {t("together.invite.success")}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[12px] uppercase tracking-widest text-muted-foreground">{t("together.invite.linkReady")}</Label>
                  <div className="flex items-center gap-2">
                    <Input readOnly value={link} className="bg-[color:var(--surface-2)] text-[13px]" />
                    <Button type="button" variant="outline" onClick={handleCopy} className="shrink-0 rounded-full">
                      <Copy className="mr-1.5 h-4 w-4" />
                      {copied ? t("together.invite.linkCopied") : t("together.invite.copyLink")}
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{t("together.invite.expiresIn")}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="companion-email" className="text-[12px] uppercase tracking-widest text-muted-foreground">
                    {t("together.invite.emailLabel")}
                  </Label>
                  <Input
                    id="companion-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("together.invite.emailPlaceholder")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[12px] uppercase tracking-widest text-muted-foreground">{t("together.invite.relationshipLabel")}</Label>
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
                  <Label htmlFor="companion-message" className="text-[12px] uppercase tracking-widest text-muted-foreground">
                    {t("together.invite.messageLabel")}
                  </Label>
                  <Textarea
                    id="companion-message"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("together.invite.messagePlaceholder")}
                  />
                </div>
                <div className="rounded-xl border border-border/60 bg-[color:var(--surface-2)] p-4">
                  <div className="flex items-start gap-2 text-[12px] text-muted-foreground">
                    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--sage)" }} />
                    <span>{t("together.invite.privacyNote")}</span>
                  </div>
                </div>
              </>
            )}

            {mutation.isError && (
              <p className="text-[12px] text-destructive">{t("together.invite.error")}</p>
            )}

            <DialogFooter className="mt-2 flex-col gap-2 sm:flex-row">
              {!link ? (
                <Button type="submit" disabled={mutation.isPending || !email.trim()} className="rounded-full">
                  {mutation.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                  {mutation.isPending ? t("together.invite.sending") : t("together.invite.sendInvitation")}
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={handleCopy} className="rounded-full">
                  <Copy className="mr-1.5 h-4 w-4" />
                  {copied ? t("together.invite.linkCopied") : t("together.invite.copyLink")}
                </Button>
              )}
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
