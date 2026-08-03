CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  ticket TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.prizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.participants TO anon, authenticated;
GRANT ALL ON public.participants TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prizes TO anon, authenticated;
GRANT ALL ON public.prizes TO service_role;

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants_public_all" ON public.participants FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "prizes_public_all" ON public.prizes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);