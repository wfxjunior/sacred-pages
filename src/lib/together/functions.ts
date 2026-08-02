import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  createInvitation,
  listMyCompanions,
  getInvitationByToken,
  getInvitationPreview,
  acceptInvitation,
} from "./companions.service";

const createSchema = z.object({
  email: z.string().email(),
  relationship: z.string().min(1).max(40),
  message: z.string().max(500).optional(),
});

const tokenSchema = z.object({ token: z.string().uuid() });

export const createCompanionInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => createSchema.parse(data))
  .handler(async ({ data, context }) => {
    const invitation = await createInvitation(context.supabase, context.userId, data);
    let emailSent = false;
    try {
      const { sendCompanionInviteEmail } = await import("./email.service");
      await sendCompanionInviteEmail(invitation, context.userId);
      emailSent = true;
    } catch {
      emailSent = false;
    }
    return { token: invitation.token, inviteeEmail: invitation.invitee_email, emailSent };
  });

export const listMyCompanionships = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(() => true)
  .handler(async ({ context }) => {
    const { data: userData } = await context.supabase.auth.getUser();
    const email = userData.user?.email ?? "";
    return listMyCompanions(context.supabase, context.userId, email);
  });

export const getCompanionInvitationByToken = createServerFn({ method: "GET" })
  .inputValidator((data) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const { type Database } = await import("@/integrations/supabase/types");
    const supabasePublic = createClient<Database>(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_PUBLISHABLE_KEY"]!,
      {
        auth: {
          storage: undefined,
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
    return getInvitationByToken(supabasePublic, data.token);
  });

export const getCompanionInvitationPreview = createServerFn({ method: "GET" })
  .inputValidator((data) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const { type Database } = await import("@/integrations/supabase/types");
    const supabasePublic = createClient<Database>(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_PUBLISHABLE_KEY"]!,
      {
        auth: {
          storage: undefined,
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
    return getInvitationPreview(supabasePublic, data.token);
  });

export const acceptCompanionInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => tokenSchema.parse(data))
  .handler(async ({ data, context }) => {
    await acceptInvitation(context.supabase, data.token);
    return { success: true };
  });
