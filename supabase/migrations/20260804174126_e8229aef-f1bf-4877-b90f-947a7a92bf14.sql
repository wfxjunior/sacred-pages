-- Restrict privileged SECURITY DEFINER helpers

-- 1) is_premium: self-scoped, no anonymous access
CREATE OR REPLACE FUNCTION public.is_premium(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  if not public.is_service_context() and _user_id is distinct from auth.uid() then
    raise exception 'not authorized' using errcode = 'insufficient_privilege';
  end if;

  return exists (
    select 1
    from public.subscriptions
    where user_id = _user_id
      and status in ('trialing', 'active', 'past_due')
      and (current_period_end is null or current_period_end > now())
  );
end;
$function$;

REVOKE ALL ON FUNCTION public.is_premium(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_premium(uuid) TO authenticated, service_role;

-- 2) Remove blanket PUBLIC execute from remaining helper functions
REVOKE ALL ON FUNCTION public.is_service_context() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_service_context() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_valid_status_transition(content_status, content_status) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_valid_status_transition(content_status, content_status) TO authenticated, service_role;

-- 3) Keep only the token-scoped invite preview reachable anonymously
REVOKE ALL ON FUNCTION public.get_companionship_preview(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_companionship_preview(uuid) TO anon, authenticated, service_role;

-- 4) Public content visibility helpers are used inside RLS for anon reads: keep,
--    but drop the implicit PUBLIC grant.
REVOKE ALL ON FUNCTION public.collection_is_public(public.collections) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.collection_is_public(public.collections) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.journey_is_public(public.journeys) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.journey_is_public(public.journeys) TO anon, authenticated, service_role;