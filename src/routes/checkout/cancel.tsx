import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/checkout/cancel")({
  head: () => ({
    meta: [
      { title: "Checkout cancelled — Lumena" },
      {
        name: "description",
        content: "You can come back to Premium whenever you are ready.",
      },
      { property: "og:title", content: "Checkout cancelled — Lumena" },
      {
        property: "og:description",
        content: "You can come back to Premium whenever you are ready.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutCancel,
});

function CheckoutCancel() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-xl px-5 py-24 text-center sm:px-6 md:py-32">
        <h1 className="font-serif text-3xl leading-tight md:text-4xl">
          No rush.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          Your free daily journey is still here. Come back to Premium whenever
          you are ready.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:flex sm:justify-center">
          <Button asChild size="lg" variant="editorial" className="h-12 w-full px-6 text-[15px] sm:w-auto sm:min-w-[180px]">
            <Link to="/today">Continue Free</Link>
          </Button>
          <Button asChild size="lg" variant="editorialOutline" className="h-12 w-full px-6 text-[15px] sm:w-auto sm:min-w-[180px]">
            <Link to="/pricing">See Plans</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
