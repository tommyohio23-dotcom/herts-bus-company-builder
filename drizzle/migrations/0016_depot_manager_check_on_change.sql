CREATE OR REPLACE FUNCTION public.enforce_depot_managers() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE mgrs integer; deps integer;
BEGIN
IF NEW.role<>'Depot Manager' THEN RETURN NEW; END IF;
IF TG_OP='INSERT' OR OLD.role IS DISTINCT FROM NEW.role THEN
  SELECT count(*) INTO mgrs FROM public.drivers WHERE company_id=NEW.company_id AND role='Depot Manager' AND id<>NEW.id;
  SELECT count(*) INTO deps FROM public.depots WHERE company_id=NEW.company_id;
  IF mgrs>=deps THEN RAISE EXCEPTION 'Only one depot manager per depot: you have % depot(s) and % manager(s)',deps,mgrs; END IF;
END IF;
IF NEW.depot<>'' AND (TG_OP='INSERT' OR OLD.depot IS DISTINCT FROM NEW.depot) THEN
  IF EXISTS(SELECT 1 FROM public.drivers WHERE company_id=NEW.company_id AND role='Depot Manager' AND depot=NEW.depot AND id<>NEW.id) THEN
    IF TG_OP='INSERT' THEN NEW.depot:=''; ELSE RAISE EXCEPTION '% already has a depot manager',NEW.depot; END IF;
  ELSIF TG_OP='UPDATE' AND NOT EXISTS(SELECT 1 FROM public.depots WHERE company_id=NEW.company_id AND town=NEW.depot) THEN
    RAISE EXCEPTION 'Choose one of your depots';
  END IF;
END IF;
RETURN NEW;
END $$;