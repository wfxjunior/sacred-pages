import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export const Route = createFileRoute("/checkout/success")({
  head: () => ({
    meta: [
      { title: "Welcome to Premium — Lumena" },
      {
        name: "description",
        content: "Your Premium membership is now active. Begin your next journey.",
      },
      { property: "og:title", content: "Welcome to Premium — Lumena" },
      {
        property: "og:description",
        content: "Your Premium membership is now active. Begin your next journey.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutSuccess,
});

function CheckoutSuccess() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-xl px-5 py-24 text-center sm:px-6 md:py-32">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "color-mix(in oklab, var(--sage) 15%, transparent)" }}>
          <CheckCircle className="h-8 w-8" style={{ color: "var(--sage)" }} />
        </div>
        <h1 className="font-serif text-3xl leading-tight md:text-4xl">
          Welcome to Premium.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          Your subscription is now active. You can invite others to Journey Together
          and unlock every collection.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:flex sm:justify-center">
          <Button asChild size="lg" variant="editorial" className="h-12 w-full px-6 text-[15px] sm:w-auto sm:min-w-[180px]">
            <Link to="/today">Start Today's Journey</Link>
          </Button>
          <Button asChild size="lg" variant="editorialOutline" className="h-12 w-full px-6 text-[15px] sm:w-auto sm:min-w-[180px]">
            <Link to="/profile">View Profile</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
