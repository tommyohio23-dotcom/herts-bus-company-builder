CREATE OR REPLACE FUNCTION public.hire_all_qualified(p_company uuid) RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE ad public.job_adverts; a public.job_applicants; hired integer; total integer:=0;
BEGIN
IF NOT EXISTS(SELECT 1 FROM public.companies WHERE id=p_company AND user_id=auth.uid()) THEN RAISE EXCEPTION 'Company not found'; END IF;
FOR ad IN SELECT * FROM public.job_adverts WHERE company_id=p_company AND user_id=auth.uid() AND status='Open' FOR UPDATE LOOP
  SELECT count(*) INTO hired FROM public.job_applicants WHERE advert_id=ad.id AND status='Hired';
  FOR a IN SELECT * FROM public.job_applicants WHERE advert_id=ad.id AND status IN ('Applied','Shortlisted') AND expected_wage<=ad.wage ORDER BY expected_wage, experience_years DESC FOR UPDATE LOOP
    EXIT WHEN hired>=ad.positions;
    INSERT INTO public.drivers(company_id,name,role,depot,wage,staff_no,portrait_index,experience_years,qualifications,applicant_id) VALUES(ad.company_id,a.name,ad.role,ad.depot,ad.wage,'A-'||left(a.id::text,8),a.portrait_index,a.experience_years,a.qualifications,a.id);
    UPDATE public.job_applicants SET status='Hired' WHERE id=a.id;
    hired:=hired+1; total:=total+1;
  END LOOP;
  IF hired>=ad.positions THEN UPDATE public.job_adverts SET status='Filled' WHERE id=ad.id; END IF;
END LOOP;
RETURN total;
END $$;
REVOKE ALL ON FUNCTION public.hire_all_qualified(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.hire_all_qualified(uuid) TO authenticated;