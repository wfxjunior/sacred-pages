CREATE OR REPLACE FUNCTION public.get_companionship_preview(_token uuid)
RETURNS TABLE (
  relationship text,
  personal_message text,
  inviter_name text,
  inviter_email text,
  status text,
  expires_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.relationship,
    c.personal_message,
    p.display_name AS inviter_name,
    u.email AS inviter_email,
    c.status,
    c.expires_at
  FROM public.companionships c
  JOIN auth.users u ON u.id = c.inviter_id
  LEFT JOIN public.profiles p ON p.id = c.inviter_id
  WHERE c.token = _token
    AND c.status = 'pending'
    AND c.expires_at >= now()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_companionship_preview(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_companionship_preview(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_companionship_preview(uuid) TO authenticated;
