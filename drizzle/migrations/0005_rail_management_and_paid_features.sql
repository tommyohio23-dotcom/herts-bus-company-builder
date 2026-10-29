ALTER TABLE public.companies ADD COLUMN transport_mode text NOT NULL DEFAULT 'bus' CHECK (transport_mode IN ('bus','train'));
CREATE TABLE public.rail_games (company_id uuid PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE, user_id uuid NOT NULL, revision integer NOT NULL DEFAULT 0, state jsonb NOT NULL);
GRANT SELECT ON public.rail_games TO authenticated; GRANT ALL ON public.rail_games TO service_role;
ALTER TABLE public.rail_games ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_rail_read ON public.rail_games FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE FUNCTION public.save_rail_game(p_company uuid,p_user uuid,p_revision integer,p_state jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
IF NOT EXISTS(SELECT 1 FROM public.companies WHERE id=p_company AND user_id=p_user AND transport_mode='train') THEN RAISE EXCEPTION 'Train company not found'; END IF;
IF p_revision=-1 THEN INSERT INTO public.rail_games(company_id,user_id,state) VALUES(p_company,p_user,p_state); ELSE UPDATE public.rail_games SET state=p_state,revision=revision+1 WHERE company_id=p_company AND user_id=p_user AND revision=p_revision; IF NOT FOUND THEN RAISE EXCEPTION 'Game changed; refresh and retry'; END IF; END IF;
UPDATE public.companies SET balance=(p_state->>'balance')::numeric,day=(p_state->>'day')::integer WHERE id=p_company;
END; $$;
REVOKE ALL ON FUNCTION public.save_rail_game(uuid,uuid,integer,jsonb) FROM PUBLIC,anon,authenticated; GRANT EXECUTE ON FUNCTION public.save_rail_game(uuid,uuid,integer,jsonb) TO service_role;
CREATE FUNCTION public.purchase_bus_or_features(p_company uuid,p_user uuid,p_day integer,p_cost numeric,p_bus uuid,p_payload jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE c public.companies; BEGIN
SELECT * INTO c FROM public.companies WHERE id=p_company AND user_id=p_user AND transport_mode='bus' FOR UPDATE;
IF c.id IS NULL THEN RAISE EXCEPTION 'Company not found'; END IF;
IF c.day<>p_day THEN RAISE EXCEPTION 'Company changed; refresh and retry'; END IF;
IF p_cost<0 OR c.balance<p_cost THEN RAISE EXCEPTION 'Not enough money'; END IF;
IF p_bus IS NOT NULL THEN UPDATE public.buses SET features=ARRAY(SELECT jsonb_array_elements_text(p_payload->'features')) WHERE id=p_bus AND company_id=p_company; IF NOT FOUND THEN RAISE EXCEPTION 'Bus not found'; END IF;
ELSE INSERT INTO public.buses(company_id,user_id,fleet_no,registration,model,year,depot,livery,route_id,features) VALUES(p_company,p_user,p_payload->>'fleet_no',p_payload->>'registration',p_payload->>'model',(p_payload->>'year')::integer,p_payload->>'depot',p_payload->>'livery',(p_payload->>'route_id')::uuid,ARRAY(SELECT jsonb_array_elements_text(p_payload->'features'))); END IF;
UPDATE public.companies SET balance=balance-p_cost WHERE id=p_company;
END; $$;
REVOKE ALL ON FUNCTION public.purchase_bus_or_features(uuid,uuid,integer,numeric,uuid,jsonb) FROM PUBLIC,anon,authenticated; GRANT EXECUTE ON FUNCTION public.purchase_bus_or_features(uuid,uuid,integer,numeric,uuid,jsonb) TO service_role;