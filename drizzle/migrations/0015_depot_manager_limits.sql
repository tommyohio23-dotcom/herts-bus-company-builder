CREATE OR REPLACE FUNCTION public.enforce_depot_managers() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE mgrs integer; deps integer;
BEGIN
IF NEW.role<>'Depot Manager' THEN RETURN NEW; END IF;
IF TG_OP='INSERT' OR OLD.role IS DISTINCT FROM NEW.role THEN
  SELECT count(*) INTO mgrs FROM public.drivers WHERE company_id=NEW.company_id AND role='Depot Manager' AND id<>NEW.id;
  SELECT count(*) INTO deps FROM public.depots WHERE company_id=NEW.company_id;
  IF mgrs>=deps THEN RAISE EXCEPTION 'Only one depot manager per depot: you have % depot(s) and % manager(s)',deps,mgrs; END IF;
END IF;
IF NEW.depot<>'' AND (TG_OP='INSERT' OR OLD.depot IS DISTINCT FROM NEW.depot) AND EXISTS(SELECT 1 FROM public.drivers WHERE company_id=NEW.company_id AND role='Depot Manager' AND depot=NEW.depot AND id<>NEW.id) THEN
  IF TG_OP='INSERT' THEN NEW.depot:=''; ELSE RAISE EXCEPTION '% already has a depot manager',NEW.depot; END IF;
END IF;
IF NEW.depot<>'' AND NOT EXISTS(SELECT 1 FROM public.depots WHERE company_id=NEW.company_id AND town=NEW.depot) THEN RAISE EXCEPTION 'Choose one of your depots'; END IF;
RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS enforce_depot_managers ON public.drivers;
CREATE TRIGGER enforce_depot_managers BEFORE INSERT OR UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.enforce_depot_managers();

CREATE OR REPLACE FUNCTION public.hire_all_qualified(p_company uuid) RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE ad public.job_adverts; a public.job_applicants; hired integer; total integer:=0; mgr_room integer;
BEGIN
IF NOT EXISTS(SELECT 1 FROM public.companies WHERE id=p_company AND user_id=auth.uid()) THEN RAISE EXCEPTION 'Company not found'; END IF;
FOR ad IN SELECT * FROM public.job_adverts WHERE company_id=p_company AND user_id=auth.uid() AND status='Open' FOR UPDATE LOOP
  SELECT count(*) INTO hired FROM public.job_applicants WHERE advert_id=ad.id AND status='Hired';
  FOR a IN SELECT * FROM public.job_applicants WHERE advert_id=ad.id AND status IN ('Applied','Shortlisted') AND expected_wage<=ad.wage ORDER BY experience_years DESC FOR UPDATE LOOP
    IF ad.role='Depot Manager' THEN
      SELECT (SELECT count(*) FROM public.depots WHERE company_id=p_company)-(SELECT count(*) FROM public.drivers WHERE company_id=p_company AND role='Depot Manager') INTO mgr_room;
      EXIT WHEN mgr_room<=0;
    END IF;
    INSERT INTO public.drivers(company_id,name,role,depot,wage,staff_no,portrait_index,experience_years,qualifications,applicant_id) VALUES(ad.company_id,a.name,ad.role,ad.depot,ad.wage,'A-'||left(a.id::text,8),a.portrait_index,a.experience_years,a.qualifications,a.id);
    UPDATE public.job_applicants SET status='Hired' WHERE id=a.id;
    hired:=hired+1; total:=total+1;
  END LOOP;
  UPDATE public.job_adverts SET positions=LEAST(500,GREATEST(positions,hired)), status=CASE WHEN hired>=GREATEST(positions,hired) THEN 'Filled' ELSE status END WHERE id=ad.id;
END LOOP;
RETURN total;
END $$;