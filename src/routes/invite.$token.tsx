import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/site/AppShell";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { getCompanionInvitationPreview, acceptCompanionInvitation } from "@/lib/together/functions";

export const Route = createFileRoute("/invite/$token")({
  head: () => ({
    meta: [
      { title: "Invitation — Lumena" },
      { name: "description", content: "Accept a private invitation to journey together through Scripture." },
    ],
  }),
  component: InvitationPage,
});

function InvitationPage() {
  const { token } = Route.useParams();
  const { t } = useI18n();
  const user = useCurrentUser();
  const queryClient = useQueryClient();

  const preview = useQuery({
    queryKey: ["companionship-preview", token],
    queryFn: () => getCompanionInvitationPreview({ data: { token } }),
  });

  const accept = useMutation({
    mutationFn: () => acceptCompanionInvitation({ data: { token } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companionships", "mine"] });
    },
  });

  const isLoading = preview.isLoading || user.loading;
  const isError = preview.isError;
  const data = preview.data;

  return (
    <AppShell>
      <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full" style={{ background: "var(--surface-2)" }}>
          <Lock className="h-5 w-5" style={{ color: "var(--walnut)" }} />
        </span>
        <h1 className="mt-5 font-serif text-3xl">{t("together.accept.title")}</h1>
        <p className="mt-2 text-[14px] text-muted-foreground">{t("together.accept.subtitle")}</p>

        {isLoading ? (
          <div className="mt-8 flex items-center gap-2 text-[13px] text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> {t("ui.loading")}
          </div>
        ) : isError || !data ? (
          <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
            <XCircle className="mx-auto h-5 w-5 text-destructive" />
            <p className="mt-2 text-[13px] text-destructive">{t("together.accept.error")}</p>
          </div>
        ) : (
          <div className="mt-8 w-full rounded-2xl border border-border/60 bg-card p-6 text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{t("together.invite.fromLabel")}</p>
            <p className="mt-1 font-serif text-xl">{data.inviter_name ?? data.inviter_email ?? t("together.activePlaceholder")}</p>
            {data.relationship && <p className="mt-1 text-[13px] text-muted-foreground">{data.relationship}</p>}
            {data.personal_message && (
              <blockquote className="mt-4 border-l-2 pl-3 text-[14px] italic text-muted-foreground" style={{ borderColor: "var(--gold)" }}>
                "{data.personal_message}"
              </blockquote>
            )}
            {data.status === "active" && (
              <div className="mt-5 flex items-center gap-2 text-[13px]" style={{ color: "var(--sage)" }}>
                <CheckCircle2 className="h-4 w-4" />
                {t("together.accept.alreadyActive")}
              </div>
            )}
            {data.status === "declined" && (
              <div className="mt-5 flex items-center gap-2 text-[13px] text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                {t("together.accept.declined")}
              </div>
            )}
            {data.status === "expired" && (
              <div className="mt-5 flex items-center gap-2 text-[13px] text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                {t("together.accept.expired")}
              </div>
            )}

            {data.status === "pending" && (
              <div className="mt-6">
                {!user.userId ? (
                  <Button asChild className="w-full rounded-full">
                    <Link to="/signin">{t("together.accept.signInToAccept")}</Link>
                  </Button>
                ) : (
                  <Button
                    onClick={() => accept.mutate()}
                    disabled={accept.isPending}
                    className="w-full rounded-full"
                  >
                    {accept.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("together.accept.cta")}
                  </Button>
                )}
              </div>
            )}
            {accept.isSuccess && (
              <div className="mt-5 rounded-xl p-4 text-center text-[13px]" style={{ background: "var(--surface-2)" }}>
                <CheckCircle2 className="mx-auto h-4 w-4" style={{ color: "var(--sage)" }} />
                <p className="mt-2" style={{ color: "var(--sage)" }}>{t("together.accept.success")}</p>
                <Button asChild variant="link" className="mt-1 h-auto p-0">
                  <Link to="/together">{t("together.accept.viewTogether")}</Link>
                </Button>
              </div>
            )}
            {accept.isError && (
              <p className="mt-4 text-[13px] text-destructive">{t("together.accept.error")}</p>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
