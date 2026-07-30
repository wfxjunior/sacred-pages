create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  resolved_name text;
  resolved_avatar text;
begin
  resolved_name := nullif(trim(coalesce(
    meta ->> 'display_name',
    meta ->> 'full_name',
    meta ->> 'name',
    split_part(coalesce(new.email, ''), '@', 1)
  )), '');

  resolved_avatar := nullif(trim(coalesce(
    meta ->> 'avatar_url',
    meta ->> 'picture'
  )), '');

  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, resolved_name, resolved_avatar)
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'free_user')
  on conflict do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

update public.profiles p
   set display_name = nullif(trim(coalesce(
         u.raw_user_meta_data ->> 'display_name',
         u.raw_user_meta_data ->> 'full_name',
         u.raw_user_meta_data ->> 'name',
         split_part(coalesce(u.email, ''), '@', 1)
       )), '')
  from auth.users u
 where u.id = p.id and p.display_name is null;

update public.profiles p
   set avatar_url = nullif(trim(coalesce(
         u.raw_user_meta_data ->> 'avatar_url',
         u.raw_user_meta_data ->> 'picture'
       )), '')
  from auth.users u
 where u.id = p.id and p.avatar_url is null;

-- Trigger-only routines must not be callable through the API by anyone.
do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure::text as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prorettype = 'pg_catalog.trigger'::regtype
  loop
    execute format('revoke all on function %s from public, anon, authenticated', fn.sig);
  end loop;
end;
$$;