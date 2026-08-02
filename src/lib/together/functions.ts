import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
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
  .handler(async ({ data, context }) => {
    const input = createSchema.parse(data);
    const invitation = await createInvitation(context.supabase, context.userId, input);
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
  .handler(async ({ context }) => {
    const { data: userData } = await context.supabase.auth.getUser();
    const email = userData.user?.email ?? "";
    return listMyCompanions(context.supabase, context.userId, email);
  });

export const getCompanionInvitationByToken = createServerFn({ method: "GET" }).handler(async ({ data }) => {
  const { token } = tokenSchema.parse(data);
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
  return getInvitationByToken(supabasePublic, token);
});

export const getCompanionInvitationPreview = createServerFn({ method: "GET" }).handler(async ({ data }) => {
  const { token } = tokenSchema.parse(data);
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
  return getInvitationPreview(supabasePublic, token);
});

export const acceptCompanionInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { token } = tokenSchema.parse(data);
    await acceptInvitation(context.supabase, token);
    return { success: true };
  });
