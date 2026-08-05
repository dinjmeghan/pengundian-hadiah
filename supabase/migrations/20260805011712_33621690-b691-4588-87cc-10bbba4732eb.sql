ALTER TABLE public.participants RENAME COLUMN ticket TO phone;
ALTER TABLE public.prizes ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1;