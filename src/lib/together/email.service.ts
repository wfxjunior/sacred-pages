import * as React from "react";
import { sendLovableEmail } from "@lovable.dev/email-js";
import { render } from "@react-email/render";
import { createClient } from "@supabase/supabase-js";
import { CompanionInviteEmail } from "@/lib/email-templates/CompanionInviteEmail";
import type { Database } from "@/integrations/supabase/types";
import type { Companionship } from "./types";

const SITE_NAME = "lumenadaily";
const ROOT_DOMAIN = "lumenadaily.com";
const FROM = `${SITE_NAME} <noreply@notify.lumenadaily.com>`;
const SITE_URL = `https://${ROOT_DOMAIN}`;

export async function sendCompanionInviteEmail(
  invitation: Companionship,
  inviterUserId: string,
): Promise<void> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

  const supabaseUrl = process.env["SUPABASE_URL"];
  const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!supabaseUrl || !publishableKey) throw new Error("Missing Supabase env");

  const supabasePublic = createClient<Database>(supabaseUrl, publishableKey, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  const { data: inviter } = await supabasePublic
    .from("profiles")
    .select("display_name")
    .eq("id", inviterUserId)
    .maybeSingle();

  const inviterName =
    (inviter?.display_name as string | undefined) ?? invitation.inviter_id.slice(0, 8);

  const inviteUrl = `${SITE_URL}/invite/${invitation.token}`;

  const element = React.createElement(CompanionInviteEmail, {
    siteName: SITE_NAME,
    siteUrl: SITE_URL,
    inviterName,
    relationship: invitation.relationship,
    personalMessage: invitation.personal_message ?? undefined,
    inviteUrl,
  });

  const html = await render(element);
  const text = await render(element, { plainText: true });

  await sendLovableEmail(
    {
      to: invitation.invitee_email,
      from: FROM,
      subject: `${inviterName} invited you to walk together on ${SITE_NAME}`,
      html,
      text,
    },
    { apiKey },
  );
}
