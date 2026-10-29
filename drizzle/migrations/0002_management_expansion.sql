ALTER TABLE public.buses ADD COLUMN condition integer NOT NULL DEFAULT 85, ADD COLUMN market_key text;
ALTER TABLE public.routes ADD COLUMN service_type text NOT NULL DEFAULT 'Commercial', ADD COLUMN stop_ids text[] NOT NULL DEFAULT '{}', ADD COLUMN contract_payment numeric NOT NULL DEFAULT 0, ADD COLUMN contract_end_day integer;
CREATE UNIQUE INDEX buses_market_purchase ON public.buses(company_id, market_key) WHERE market_key IS NOT NULL;
CREATE TABLE public.depots (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE, user_id uuid NOT NULL DEFAULT auth.uid(), name text NOT NULL, town text NOT NULL, capacity integer NOT NULL DEFAULT 10 CHECK(capacity > 0), daily_rent numeric NOT NULL DEFAULT 75 CHECK(daily_rent >= 0), UNIQUE(company_id,town));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.depots TO authenticated; GRANT ALL ON public.depots TO service_role;
ALTER TABLE public.depots ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_depots ON public.depots TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.companies WHERE id=company_id AND user_id=auth.uid()));
INSERT INTO public.depots(company_id,user_id,name,town,capacity,daily_rent) SELECT c.id,c.user_id,d.town || ' depot',d.town,GREATEST(10,(SELECT count(*)::integer FROM public.buses b WHERE b.company_id=c.id AND b.depot=d.town)),0 FROM public.companies c CROSS JOIN LATERAL (SELECT DISTINCT depot AS town FROM public.buses WHERE company_id=c.id AND depot<>'' UNION SELECT hq_town FROM public.companies WHERE id=c.id) d;
CREATE TABLE public.tender_bids (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE, user_id uuid NOT NULL DEFAULT auth.uid(), tender_key text NOT NULL, bid numeric NOT NULL CHECK(bid > 0), submitted_day integer NOT NULL, status text NOT NULL DEFAULT 'Pending', UNIQUE(company_id,tender_key));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.tender_bids TO authenticated; GRANT ALL ON public.tender_bids TO service_role;
ALTER TABLE public.tender_bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_bids ON public.tender_bids TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.companies WHERE id=company_id AND user_id=auth.uid()));
CREATE TABLE public.day_reports (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE, user_id uuid NOT NULL DEFAULT auth.uid(), day integer NOT NULL, revenue numeric NOT NULL, costs numeric NOT NULL, profit numeric NOT NULL, details jsonb NOT NULL DEFAULT '{}', UNIQUE(company_id,day));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.day_reports TO authenticated; GRANT ALL ON public.day_reports TO service_role;
ALTER TABLE public.day_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_reports ON public.day_reports TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.companies WHERE id=company_id AND user_id=auth.uid()));
CREATE TABLE public.passenger_reviews (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE, user_id uuid NOT NULL DEFAULT auth.uid(), day integer NOT NULL, route_number text NOT NULL, rating integer NOT NULL CHECK(rating BETWEEN 1 AND 5), comment text NOT NULL);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.passenger_reviews TO authenticated; GRANT ALL ON public.passenger_reviews TO service_role;
ALTER TABLE public.passenger_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_reviews ON public.passenger_reviews TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.companies WHERE id=company_id AND user_id=auth.uid()));
CREATE FUNCTION public.apply_management_action(p_company uuid,p_day integer,p_action text,p_payload jsonb) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE c public.companies; cost numeric; d public.depots; used integer;
BEGIN
 SELECT * INTO c FROM public.companies WHERE id=p_company AND user_id=auth.uid() FOR UPDATE;
 IF c.id IS NULL THEN RAISE EXCEPTION 'Company not found'; END IF;
 IF c.day<>p_day THEN RAISE EXCEPTION 'Company changed; refresh and retry'; END IF;
 IF p_action='purchase' THEN
 cost=(p_payload->>'price')::numeric;
 SELECT * INTO d FROM public.depots WHERE company_id=p_company AND town=p_payload->>'depot';
 IF d.id IS NULL THEN RAISE EXCEPTION 'Choose an open depot'; END IF;
 SELECT count(*) INTO used FROM public.buses WHERE company_id=p_company AND depot=d.town;
 IF used>=d.capacity THEN RAISE EXCEPTION 'Depot is full'; END IF;
 IF cost<=0 OR c.balance<cost THEN RAISE EXCEPTION 'Not enough money'; END IF;
 INSERT INTO public.buses(company_id,fleet_no,registration,model,year,mileage,condition,depot,livery,market_key,features) VALUES(p_company,p_payload->>'fleet_no',p_payload->>'registration',p_payload->>'model',(p_payload->>'year')::integer,(p_payload->>'mileage')::integer,(p_payload->>'condition')::integer,d.town,'Company livery',p_payload->>'market_key',ARRAY(SELECT jsonb_array_elements_text(p_payload->'features')));
 UPDATE public.companies SET balance=balance-cost WHERE id=p_company;
 ELSIF p_action='depot' THEN
 cost=(p_payload->>'cost')::numeric; IF cost<=0 OR c.balance<cost THEN RAISE EXCEPTION 'Not enough money'; END IF;
 INSERT INTO public.depots(company_id,name,town,capacity,daily_rent) VALUES(p_company,p_payload->>'name',p_payload->>'town',(p_payload->>'capacity')::integer,(p_payload->>'daily_rent')::numeric);
 UPDATE public.companies SET balance=balance-cost WHERE id=p_company;
 ELSIF p_action='day' THEN
 INSERT INTO public.day_reports(company_id,day,revenue,costs,profit,details) VALUES(p_company,c.day,(p_payload->>'revenue')::numeric,(p_payload->>'costs')::numeric,(p_payload->>'profit')::numeric,p_payload->'details');
 INSERT INTO public.passenger_reviews(company_id,day,route_number,rating,comment) SELECT p_company,c.day,x->>'route_number',(x->>'rating')::integer,x->>'comment' FROM jsonb_array_elements(p_payload->'reviews') x;
 UPDATE public.companies SET balance=balance+(p_payload->>'profit')::numeric,day=day+1 WHERE id=p_company;
 UPDATE public.buses SET mileage=mileage+200 WHERE company_id=p_company AND status='In service' AND route_id IS NOT NULL;
 ELSE RAISE EXCEPTION 'Unknown action'; END IF;
END; $$;
REVOKE ALL ON FUNCTION public.apply_management_action(uuid,integer,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.apply_management_action(uuid,integer,text,jsonb) TO service_role;