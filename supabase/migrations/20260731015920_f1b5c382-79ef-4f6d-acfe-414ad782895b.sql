ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS detected_locale text;

INSERT INTO public.user_roles (user_id, role)
VALUES ('ec1c05f3-1ec2-4d3e-9547-c0dfc6f65005', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;