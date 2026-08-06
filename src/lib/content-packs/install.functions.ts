import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { installContentPacksCore, type InstallReport } from "./install.core";

// Staff-triggered install from Content Studio. The same core also backs the
// public self-heal endpoint (routes/api/public/content-packs), so the packs
// appear even when nobody visits the studio after a publish.

export type { InstallReport };

export const installContentPacks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<InstallReport> => {
    const { data: isStaff, error: roleError } = await context.supabase.rpc("is_content_staff", {
      uid: context.userId,
    });
    if (roleError || !isStaff) throw new Error("Not authorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return installContentPacksCore(supabaseAdmin as never);
  });
