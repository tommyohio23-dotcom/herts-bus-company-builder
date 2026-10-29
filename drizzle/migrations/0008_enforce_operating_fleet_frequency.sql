CREATE FUNCTION public.check_operating_fleet_frequency() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$ DECLARE r record; BEGIN
FOR r IN SELECT rt.number,rt.frequency_mins,count(b.id) AS allocated FROM public.routes rt LEFT JOIN public.buses b ON b.route_id=rt.id AND b.company_id=rt.company_id AND b.status='In service' WHERE rt.company_id=NEW.company_id AND (rt.contract_end_day IS NULL OR rt.contract_end_day>=NEW.day) GROUP BY rt.id,rt.number,rt.frequency_mins LOOP
IF r.allocated>0 AND r.allocated<ceil(60.0/greatest(5,r.frequency_mins)) THEN RAISE EXCEPTION 'Route %: every % minutes needs % in-service buses; % allocated. Add buses or increase the interval.',r.number,r.frequency_mins,ceil(60.0/greatest(5,r.frequency_mins)),r.allocated; END IF;
END LOOP;
RETURN NEW;
END; $$;
CREATE TRIGGER check_fleet_before_day_report BEFORE INSERT ON public.day_reports FOR EACH ROW EXECUTE FUNCTION public.check_operating_fleet_frequency();