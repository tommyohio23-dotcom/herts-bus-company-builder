ALTER TABLE public.buses ADD COLUMN features text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.drivers ADD COLUMN role text NOT NULL DEFAULT 'Driver';