CREATE TABLE public.companionships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email text NOT NULL,
  invitee_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  relationship text NOT NULL DEFAULT 'Friend',
  personal_message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined', 'archived')),
  token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_companionships_inviter_id ON public.companionships(inviter_id);
CREATE INDEX idx_companionships_invitee_email ON public.companionships(invitee_email);
CREATE INDEX idx_companionships_invitee_user_id ON public.companionships(invitee_user_id);
CREATE INDEX idx_companionships_token ON public.companionships(token);
CREATE INDEX idx_companionships_status ON public.companionships(status);

CREATE TRIGGER companionships_set_updated_at
  BEFORE UPDATE ON public.companionships
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.companionships TO authenticated;
GRANT ALL ON public.companionships TO service_role;

ALTER TABLE public.companionships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own companionships"
  ON public.companionships
  FOR SELECT
  TO authenticated
  USING (
    inviter_id = auth.uid()
    OR invitee_user_id = auth.uid()
    OR invitee_email = auth.email()
  );

CREATE POLICY "Users can create invitations"
  ON public.companionships
  FOR INSERT
  TO authenticated
  WITH CHECK (inviter_id = auth.uid());

CREATE POLICY "Inviter can update own invitations"
  ON public.companionships
  FOR UPDATE
  TO authenticated
  USING (inviter_id = auth.uid())
  WITH CHECK (inviter_id = auth.uid());

CREATE OR REPLACE FUNCTION public.accept_companionship(_token uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.companionships%ROWTYPE;
BEGIN
  SELECT * INTO v_row
  FROM public.companionships
  WHERE token = _token
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found' USING ERRCODE = 'no_data_found';
  END IF;

  IF v_row.status != 'pending' THEN
    RAISE EXCEPTION 'Invitation is not pending' USING ERRCODE = 'check_violation';
  END IF;

  IF v_row.expires_at < now() THEN
    RAISE EXCEPTION 'Invitation has expired' USING ERRCODE = 'check_violation';
  END IF;

  IF auth.email() IS NOT NULL AND v_row.invitee_email IS NOT NULL THEN
    IF lower(auth.email()) != lower(v_row.invitee_email) THEN
      RAISE EXCEPTION 'Invitation email does not match current user' USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  UPDATE public.companionships
  SET
    invitee_user_id = auth.uid(),
    status = 'active',
    updated_at = now()
  WHERE id = v_row.id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_companionship(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_companionship(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_companionship(uuid) TO service_role;
