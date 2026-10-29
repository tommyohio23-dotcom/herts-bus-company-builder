ALTER TABLE public.companies ADD COLUMN capital_boost_applied boolean NOT NULL DEFAULT false;
CREATE OR REPLACE FUNCTION public.boost_existing_network_capital() RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE affected integer;
BEGIN
  WITH requirements AS (
    SELECT company_id, count(*) AS route_count, sum(greatest(1,ceil(60.0/greatest(1,frequency_mins)))) AS buses_needed
    FROM public.routes GROUP BY company_id
  )
  UPDATE public.companies c SET balance = c.balance + greatest(0, greatest(1000000, r.buses_needed * 500000) - 250000), capital_boost_applied = true
  FROM requirements r WHERE c.id = r.company_id AND c.user_id = auth.uid() AND c.transport_mode = 'bus' AND r.route_count >= 10 AND NOT c.capital_boost_applied;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;
REVOKE ALL ON FUNCTION public.boost_existing_network_capital() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.boost_existing_network_capital() TO authenticated;