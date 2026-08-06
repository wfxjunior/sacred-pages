CREATE TABLE public.premium_grants (
  email text PRIMARY KEY,
  note text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.premium_grants TO service_role;

ALTER TABLE public.premium_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages premium grants"
ON public.premium_grants FOR ALL
TO service_role
USING (true) WITH CHECK (true);

CREATE TRIGGER premium_grants_set_updated_at
BEFORE UPDATE ON public.premium_grants
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.premium_grants (email, note) VALUES
  ('juniorxavierusa@gmail.com', 'Founder complimentary access'),
  ('nsxlombardi@gmail.com', 'Founder complimentary access');

CREATE OR REPLACE FUNCTION public.is_premium(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_email text;
begin
  if not public.is_service_context() and _user_id is distinct from auth.uid() then
    raise exception 'not authorized' using errcode = 'insufficient_privilege';
  end if;

  if exists (
    select 1
    from public.subscriptions
    where user_id = _user_id
      and status in ('trialing', 'active', 'past_due')
      and (current_period_end is null or current_period_end > now())
  ) then
    return true;
  end if;

  select lower(email) into v_email from auth.users where id = _user_id;

  return exists (
    select 1
    from public.premium_grants g
    where lower(g.email) = v_email
      and (g.expires_at is null or g.expires_at > now())
  );
end;
$function$;