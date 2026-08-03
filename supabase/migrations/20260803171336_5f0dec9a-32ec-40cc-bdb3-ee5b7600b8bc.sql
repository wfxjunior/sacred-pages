
-- 1) Remove anonymous access to helpers that never need it
REVOKE EXECUTE ON FUNCTION public.can_edit_content(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_review_content(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_publish_content(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_content_staff(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.accept_companionship(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.consistency_summary(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.evaluate_milestones(uuid, public.activity_event_type, uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_companionship_preview(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_edit_content(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_review_content(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_publish_content(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_content_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_companionship(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consistency_summary(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.evaluate_milestones(uuid, public.activity_event_type, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_companionship_preview(uuid) TO anon, authenticated;

-- 2) Signed-in callers may only probe their own permissions
CREATE OR REPLACE FUNCTION public.has_role(uid uuid, r app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  select case
    when uid is null then false
    when auth.uid() is not null and uid is distinct from auth.uid()
         and not public.is_service_context() then false
    else exists (select 1 from public.user_roles where user_id = uid and role = r)
  end;
$function$;

CREATE OR REPLACE FUNCTION public.is_content_staff(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  select case
    when uid is null then false
    when auth.uid() is not null and uid is distinct from auth.uid()
         and not public.is_service_context() then false
    else exists (
      select 1 from public.user_roles
      where user_id = uid
        and role in ('content_editor','content_reviewer','publication_admin','super_admin')
    )
  end;
$function$;
