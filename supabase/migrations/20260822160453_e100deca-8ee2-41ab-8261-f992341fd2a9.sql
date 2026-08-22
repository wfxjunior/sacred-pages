CREATE TABLE public.gift_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  session_id TEXT,
  source TEXT NOT NULL DEFAULT 'gift',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT INSERT ON public.gift_contacts TO anon;
GRANT INSERT ON public.gift_contacts TO authenticated;
GRANT ALL ON public.gift_contacts TO service_role;
ALTER TABLE public.gift_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can leave their contact" ON public.gift_contacts FOR INSERT TO anon, authenticated WITH CHECK (email IS NOT NULL AND length(email) < 320);