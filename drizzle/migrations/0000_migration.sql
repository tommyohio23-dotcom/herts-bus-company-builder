CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  short_name text NOT NULL DEFAULT '',
  primary_color text NOT NULL DEFAULT '#1d4ed8',
  secondary_color text NOT NULL DEFAULT '#ffffff',
  preset_key text,
  hq_town text NOT NULL DEFAULT 'Hertford',
  balance numeric NOT NULL DEFAULT 250000,
  day integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  number text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  via text NOT NULL DEFAULT '',
  frequency_mins integer NOT NULL DEFAULT 30,
  fare numeric NOT NULL DEFAULT 2,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.buses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  route_id uuid REFERENCES public.routes(id) ON DELETE SET NULL,
  fleet_no text NOT NULL,
  registration text NOT NULL DEFAULT '',
  model text NOT NULL,
  year integer NOT NULL DEFAULT 2010,
  livery text NOT NULL DEFAULT '',
  depot text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'In service',
  mileage integer NOT NULL DEFAULT 0,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  depot text NOT NULL DEFAULT '',
  staff_no text NOT NULL DEFAULT '',
  wage numeric NOT NULL DEFAULT 140,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies, public.routes, public.buses, public.drivers TO authenticated;
GRANT ALL ON public.companies, public.routes, public.buses, public.drivers TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own companies" ON public.companies FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own routes" ON public.routes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own buses" ON public.buses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own drivers" ON public.drivers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);