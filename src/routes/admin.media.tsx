import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ALLOWED_MEDIA_TYPES, MAX_MEDIA_BYTES } from "@/lib/content/schemas";

export const Route = createFileRoute("/admin/media")({
  head: () => ({
    meta: [{ title: "Media — Content Studio" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: MediaLibrary,
});

function MediaLibrary() {
  return (
    <AdminShell
      title="Media"
      description="Images for collection covers, journey heroes and social cards."
    >
      <div className="max-w-2xl space-y-6">
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8">
          <h2 className="font-serif text-lg">Uploads arrive with Supabase Storage</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The <code className="text-xs">media_assets</code> table, its validation schema and its
            RLS policies are in place, so journeys and collections can already reference images.
            Browser uploads need a Supabase Storage bucket plus storage policies, which are set up
            in the phase that introduces the bucket.
          </p>

          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Allowed types
              </dt>
              <dd className="mt-1">{ALLOWED_MEDIA_TYPES.join(", ")}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Maximum size
              </dt>
              <dd className="mt-1">{MAX_MEDIA_BYTES / (1024 * 1024)} MB</dd>
            </div>
          </dl>

          <p className="mt-6 text-xs text-muted-foreground">
            SVG is deliberately excluded: it can carry executable script, which would be a stored
            XSS vector for anyone viewing the image.
          </p>
        </div>
      </div>
    </AdminShell>
  );
}
