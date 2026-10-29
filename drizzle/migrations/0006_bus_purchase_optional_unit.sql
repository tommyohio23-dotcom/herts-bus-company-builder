CREATE OR REPLACE FUNCTION public.purchase_bus_or_features(p_company uuid,p_user uuid,p_day integer,p_cost numeric,p_bus uuid,p_payload jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE c public.companies; BEGIN
SELECT * INTO c FROM public.companies WHERE id=p_company AND user_id=p_user AND transport_mode='bus' FOR UPDATE;
IF c.id IS NULL THEN RAISE EXCEPTION 'Company not found'; END IF;
IF c.day<>p_day THEN RAISE EXCEPTION 'Company changed; refresh and retry'; END IF;
IF p_cost<0 OR c.balance<p_cost THEN RAISE EXCEPTION 'Not enough money'; END IF;
IF p_bus IS NOT NULL AND p_bus<>'00000000-0000-0000-0000-000000000000'::uuid THEN UPDATE public.buses SET features=ARRAY(SELECT jsonb_array_elements_text(p_payload->'features')) WHERE id=p_bus AND company_id=p_company; IF NOT FOUND THEN RAISE EXCEPTION 'Bus not found'; END IF;
ELSE INSERT INTO public.buses(company_id,user_id,fleet_no,registration,model,year,depot,livery,route_id,features) VALUES(p_company,p_user,p_payload->>'fleet_no',p_payload->>'registration',p_payload->>'model',(p_payload->>'year')::integer,p_payload->>'depot',p_payload->>'livery',(p_payload->>'route_id')::uuid,ARRAY(SELECT jsonb_array_elements_text(p_payload->'features'))); END IF;
UPDATE public.companies SET balance=balance-p_cost WHERE id=p_company;
END; $$;