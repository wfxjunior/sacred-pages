import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Lumen Verse" },
      { name: "description", content: "Your Lumen Verse profile." },
      { property: "og:title", content: "Profile — Lumen Verse" },
      { property: "og:description", content: "Manage your Lumen Verse profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>Profile</p>
          <h1 className="mt-2 font-serif text-4xl">Your account</h1>
        </div>
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full font-serif text-xl text-primary-foreground"
              style={{ background: "linear-gradient(135deg, var(--gold), var(--walnut))" }}
            >
              S
            </div>
            <div>
              <p className="font-serif text-lg">Samuel Reid</p>
              <p className="text-sm text-muted-foreground">samuel@lumenverse.app</p>
            </div>
          </div>
          <div className="grid gap-4">
            <Field label="Full name" defaultValue="Samuel Reid" />
            <Field label="Email" defaultValue="samuel@lumenverse.app" />
          </div>
          <div className="flex justify-end">
            <Button>Save changes</Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <Input defaultValue={defaultValue} />
    </label>
  );
}