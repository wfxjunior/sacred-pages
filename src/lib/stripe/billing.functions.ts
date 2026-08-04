import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getSubscriptionStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("is_premium", {
      _user_id: context.userId,
    });

    if (error) {
      console.error("is_premium rpc error", error);
      return { isPremium: false };
    }

    return { isPremium: !!data };
  });
