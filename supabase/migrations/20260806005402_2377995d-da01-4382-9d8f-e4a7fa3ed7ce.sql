DROP POLICY IF EXISTS "Users can update their own customer record" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
REVOKE UPDATE, DELETE ON public.customers FROM authenticated, anon;
REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM authenticated, anon;
GRANT ALL ON public.customers TO service_role;
GRANT ALL ON public.subscriptions TO service_role;