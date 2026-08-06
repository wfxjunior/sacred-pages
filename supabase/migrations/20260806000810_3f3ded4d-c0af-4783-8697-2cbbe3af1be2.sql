-- 1. Avatars: restrict reads to the owner's folder, plus companions.
DROP POLICY IF EXISTS "avatars read authenticated" ON storage.objects;

CREATE POLICY "avatars read own or companion"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR EXISTS (
      SELECT 1
      FROM public.companionships c
      WHERE c.status IN ('pending', 'active')
        AND (
          (c.inviter_id = auth.uid()
            AND c.invitee_user_id IS NOT NULL
            AND (c.invitee_user_id)::text = (storage.foldername(name))[1])
          OR
          (c.invitee_user_id = auth.uid()
            AND (c.inviter_id)::text = (storage.foldername(name))[1])
        )
    )
  )
);

-- 2. Invite preview: do not disclose the inviter's email to anonymous callers.
CREATE OR REPLACE FUNCTION public.get_companionship_preview(_token uuid)
 RETURNS TABLE(relationship text, personal_message text, inviter_name text, inviter_email text, status text, expires_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    c.relationship,
    c.personal_message,
    p.display_name AS inviter_name,
    CASE WHEN auth.uid() IS NULL THEN NULL ELSE u.email END AS inviter_email,
    c.status,
    c.expires_at
  FROM public.companionships c
  JOIN auth.users u ON u.id = c.inviter_id
  LEFT JOIN public.profiles p ON p.id = c.inviter_id
  WHERE c.token = _token
    AND c.status = 'pending'
    AND c.expires_at >= now()
  LIMIT 1;
$function$;

REVOKE ALL ON FUNCTION public.get_companionship_preview(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_companionship_preview(uuid) TO anon, authenticated, service_role;
