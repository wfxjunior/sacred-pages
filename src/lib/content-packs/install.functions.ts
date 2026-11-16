import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { installContentPacksCore, type InstallReport } from "./install.core";

// Installing packs publishes content, so only publication admins may run it.

export type { InstallReport };

export const installContentPacks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<InstallReport> => {
    const { data: canPublish, error: roleError } = await context.supabase.rpc("can_publish_content", {
      uid: context.userId,
    });
    if (roleError || !canPublish) throw new Error("Not authorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return installContentPacksCore(supabaseAdmin as never);
  });
