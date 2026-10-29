GRANT EXECUTE ON FUNCTION public.apply_management_action(uuid,integer,text,jsonb) TO authenticated;
ALTER TABLE public.routes ADD COLUMN tender_key text;
CREATE UNIQUE INDEX routes_tender_contract ON public.routes(company_id,tender_key) WHERE tender_key IS NOT NULL;
CREATE FUNCTION public.submit_game_bid(p_company uuid,p_day integer,p_key text,p_bid numeric) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE c public.companies;
BEGIN SELECT * INTO c FROM public.companies WHERE id=p_company AND user_id=auth.uid() FOR UPDATE;
IF c.id IS NULL OR c.day<>p_day THEN RAISE EXCEPTION 'Company changed; refresh and retry'; END IF;
INSERT INTO public.tender_bids(company_id,tender_key,bid,submitted_day) VALUES(p_company,p_key,p_bid,p_day);
END; $$;
REVOKE ALL ON FUNCTION public.submit_game_bid(uuid,integer,text,numeric) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.submit_game_bid(uuid,integer,text,numeric) TO authenticated;
CREATE FUNCTION public.resolve_game_bid(p_company uuid,p_key text,p_won boolean,p_route jsonb) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE b public.tender_bids;
BEGIN SELECT * INTO b FROM public.tender_bids WHERE company_id=p_company AND tender_key=p_key AND user_id=auth.uid() FOR UPDATE;
IF b.id IS NULL OR b.status<>'Pending' THEN RETURN; END IF;
IF p_won THEN INSERT INTO public.routes(company_id,number,origin,destination,via,frequency_mins,fare,service_type,contract_payment,contract_end_day,tender_key) VALUES(p_company,p_route->>'number',p_route->>'origin',p_route->>'destination',p_route->>'via',(p_route->>'frequency_mins')::integer,0,'Tender',b.bid,(p_route->>'end_day')::integer,p_key); END IF;
UPDATE public.tender_bids SET status=CASE WHEN p_won THEN 'Won' ELSE 'Lost' END WHERE id=b.id;
END; $$;
REVOKE ALL ON FUNCTION public.resolve_game_bid(uuid,text,boolean,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.resolve_game_bid(uuid,text,boolean,jsonb) TO authenticated;