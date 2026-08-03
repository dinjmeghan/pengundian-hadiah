-- Roles infrastructure
CREATE TYPE public.app_role AS ENUM ('admin', 'operator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- The first account to sign up becomes the operator admin.
CREATE OR REPLACE FUNCTION public.grant_first_user_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_grant_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_first_user_admin();

-- Lock down participants: admin-only, no anonymous access
DROP POLICY IF EXISTS "participants_public_all" ON public.participants;
REVOKE ALL ON public.participants FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.participants TO authenticated;
GRANT ALL ON public.participants TO service_role;

CREATE POLICY "Admins can view participants"
ON public.participants FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can add participants"
ON public.participants FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update participants"
ON public.participants FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete participants"
ON public.participants FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Prizes: public read, admin-only writes
DROP POLICY IF EXISTS "prizes_public_all" ON public.prizes;
GRANT SELECT ON public.prizes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prizes TO authenticated;
GRANT ALL ON public.prizes TO service_role;

CREATE POLICY "Anyone can view prizes"
ON public.prizes FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Admins can add prizes"
ON public.prizes FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update prizes"
ON public.prizes FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete prizes"
ON public.prizes FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));