import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { RefreshCw, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { useAdminSession } from "@/lib/auth/useAdminSession";
import { useI18n } from "@/lib/i18n";
import { getSubscriptionReport } from "@/lib/admin/subscriptions.functions";

export const Route = createFileRoute("/admin/subscriptions")({
  head: () => ({ meta: [
    { title: "Subscriptions — Lumena Content Studio" },
    { name: "description", content: "Private Lumena administrator report of paying subscribers and subscription renewals." },
    { property: "og:title", content: "Subscriptions — Lumena Content Studio" },
    { property: "og:description", content: "Private subscription and renewal administration for Lumena." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }), component: SubscriptionsPage,
});

const copy = {
  en: { title: "Subscriptions", paying: "People paying", active: "Active subscriptions", cancelling: "Cancelling at period end", due: "Payment overdue", people: "Subscribers", history: "Payment & renewal history", name: "Subscriber", status: "Status", plan: "Plan", next: "Next renewal", date: "Paid on", amount: "Paid", reason: "Payment type", initial: "First payment", renewal: "Renewal", other: "Adjustment", empty: "No subscriptions yet", emptyHistory: "No subscription payments on this page", forbidden: "Only administrators can view billing information.", error: "Could not load Stripe data. Try again.", refresh: "Refresh", loading: "Loading Stripe…", test: "Stripe test mode", live: "Stripe · Live data", cancel: "Ends", previous: "Previous", more: "Next", invoice: "Open invoice" },
  pt: { title: "Assinaturas", paying: "Pessoas pagando", active: "Assinaturas ativas", cancelling: "Cancelamento ao fim do período", due: "Pagamento em atraso", people: "Assinantes", history: "Histórico de pagamentos e renovações", name: "Assinante", status: "Status", plan: "Plano", next: "Próxima renovação", date: "Pago em", amount: "Valor pago", reason: "Tipo de pagamento", initial: "Primeiro pagamento", renewal: "Renovação", other: "Ajuste", empty: "Nenhuma assinatura ainda", emptyHistory: "Nenhum pagamento de assinatura nesta página", forbidden: "Apenas administradores podem ver informações financeiras.", error: "Não foi possível consultar o Stripe. Tente novamente.", refresh: "Atualizar", loading: "Consultando Stripe…", test: "Stripe em modo de teste", live: "Stripe · Dados reais", cancel: "Termina", previous: "Anterior", more: "Próxima", invoice: "Abrir fatura" },
  es: { title: "Suscripciones", paying: "Personas pagando", active: "Suscripciones activas", cancelling: "Cancelación al final del período", due: "Pago atrasado", people: "Suscriptores", history: "Historial de pagos y renovaciones", name: "Suscriptor", status: "Estado", plan: "Plan", next: "Próxima renovación", date: "Pagado el", amount: "Importe pagado", reason: "Tipo de pago", initial: "Primer pago", renewal: "Renovación", other: "Ajuste", empty: "Aún no hay suscripciones", emptyHistory: "No hay pagos de suscripción en esta página", forbidden: "Solo los administradores pueden ver información financiera.", error: "No se pudo consultar Stripe. Inténtalo de nuevo.", refresh: "Actualizar", loading: "Consultando Stripe…", test: "Stripe en modo de prueba", live: "Stripe · Datos reales", cancel: "Termina", previous: "Anterior", more: "Siguiente", invoice: "Abrir factura" },
};

function SubscriptionsPage() {
  const session = useAdminSession();
  const { locale } = useI18n();
  const c = copy[locale];
  const fetchReport = useServerFn(getSubscriptionReport);
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined]);
  const cursor = cursors.at(-1);
  const admin = session.roles.includes("super_admin");
  const report = useQuery({ queryKey: ["admin", "subscriptions", session.userId, cursor], enabled: session.status === "ready" && admin, queryFn: () => fetchReport({ data: { cursor } }), staleTime: 30_000 });
  const money = (amount: number, currency: string) => new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount / 100);
  const date = (stamp: number | null) => stamp ? new Date(stamp * 1000).toLocaleDateString(locale) : "—";
  const data = report.data;
  return <AdminShell title={c.title} actions={<Button variant="outline" size="sm" onClick={() => void report.refetch()} disabled={!admin || report.isFetching}><RefreshCw className={`mr-2 h-4 w-4 ${report.isFetching ? "animate-spin motion-reduce:animate-none" : ""}`} />{c.refresh}</Button>}>
    {!admin ? <p className="text-muted-foreground">{c.forbidden}</p> : report.isPending ? <p role="status" className="text-muted-foreground">{c.loading}</p> : report.isError ? <p role="alert" className="text-destructive">{c.error}</p> : data ? <>
      <p className="mb-6 text-sm text-muted-foreground">{data.live === false ? c.test : c.live} · {new Date(data.checkedAt).toLocaleString(locale)}</p>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[[c.paying, data.payingPeople], [c.active, data.active], [c.cancelling, data.cancelling], [c.due, data.pastDue]].map(([label, value]) => <div key={label} className="rounded-lg border border-border bg-card p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 font-serif text-3xl tabular-nums">{value}</p></div>)}</div>
      <section className="mt-10"><h2 className="mb-4 font-serif text-xl">{c.people}</h2>{data.subscribers.length === 0 ? <p className="text-muted-foreground">{c.empty}</p> : <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-border text-muted-foreground"><tr>{[c.name,c.status,c.plan,c.next].map((h) => <th key={h} className="py-3 pr-4 font-medium">{h}</th>)}</tr></thead><tbody className="divide-y divide-border">{data.subscribers.map((s) => <tr key={s.id}><td className="py-4 pr-4"><p className="font-medium">{s.name ?? s.email ?? "—"}</p>{s.name && <p className="text-muted-foreground">{s.email}</p>}</td><td className="py-4 pr-4">{s.status}</td><td className="py-4 pr-4 tabular-nums">{money(s.amount,s.currency)} / {s.interval}</td><td className="py-4">{s.cancelling ? `${c.cancel}: ` : ""}{date(s.renewsAt)}</td></tr>)}</tbody></table></div>}</section>
      <section className="mt-10"><h2 className="mb-4 font-serif text-xl">{c.history}</h2>{data.invoices.length === 0 ? <p className="text-muted-foreground">{c.emptyHistory}</p> : <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-border text-muted-foreground"><tr>{[c.date,c.name,c.reason,c.amount,""].map((h,i) => <th key={i} className="py-3 pr-4 font-medium">{h}</th>)}</tr></thead><tbody className="divide-y divide-border">{data.invoices.map((i) => <tr key={i.id}><td className="py-4 pr-4">{date(i.paidAt)}</td><td className="py-4 pr-4">{i.name ?? i.email ?? "—"}</td><td className="py-4 pr-4">{i.reason === "subscription_cycle" ? c.renewal : i.reason === "subscription_create" ? c.initial : c.other}</td><td className="py-4 pr-4 tabular-nums">{money(i.amount,i.currency)}</td><td className="py-4">{i.url && <Button asChild variant="ghost" size="icon"><a href={i.url} target="_blank" rel="noopener noreferrer" title={c.invoice} aria-label={c.invoice}><ExternalLink className="h-4 w-4" /></a></Button>}</td></tr>)}</tbody></table></div>}
      <div className="mt-5 flex justify-end gap-2"><Button variant="outline" size="sm" disabled={cursors.length === 1 || report.isFetching} onClick={() => setCursors((v) => v.slice(0,-1))}><ArrowLeft className="mr-2 h-4 w-4" />{c.previous}</Button><Button variant="outline" size="sm" disabled={!data.nextCursor || report.isFetching} onClick={() => { const next = data.nextCursor; if (next) setCursors((v) => [...v,next]); }}>{c.more}<ArrowRight className="ml-2 h-4 w-4" /></Button></div></section>
    </> : null}
  </AdminShell>;
}