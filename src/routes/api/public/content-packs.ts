import { createFileRoute } from "@tanstack/react-router";

// Self-heal for the authored content packs. Lovable does not execute
// externally-pushed SQL migrations on publish, so the packs ship as data and
// this endpoint makes sure they exist — the catalog calls it once when it
// notices them missing, and the first visitor after a publish heals the
// database for everyone.
//
// Safe to expose without auth: no caller input reaches any query (the payload
// is the fixed authored content), the install is idempotent (a present pack
// is a read-only no-op), and the response carries only pack names.

export const Route = createFileRoute("/api/public/content-packs")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const [{ supabaseAdmin }, { installContentPacksCore }] = await Promise.all([
            import("@/integrations/supabase/client.server"),
            import("@/lib/content-packs/install.core"),
          ]);
          const report = await installContentPacksCore(supabaseAdmin as never);
          return Response.json(report);
        } catch (error) {
          console.error("content-packs self-heal failed", error);
          return new Response("Install failed", { status: 500 });
        }
      },
    },
  },
});
