ALTER TABLE public.drivers ADD COLUMN portrait_index integer, ADD COLUMN experience_years integer NOT NULL DEFAULT 0, ADD COLUMN qualifications text[] NOT NULL DEFAULT '{}', ADD COLUMN applicant_id uuid;
CREATE TABLE public.job_adverts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,user_id uuid NOT NULL DEFAULT auth.uid(),role text NOT NULL,depot text NOT NULL,wage numeric NOT NULL CHECK(wage>0),positions integer NOT NULL DEFAULT 1 CHECK(positions BETWEEN 1 AND 10),status text NOT NULL DEFAULT 'Open',posted_day integer NOT NULL,description text NOT NULL DEFAULT '');
GRANT SELECT,INSERT,UPDATE,DELETE ON public.job_adverts TO authenticated; GRANT ALL ON public.job_adverts TO service_role;
ALTER TABLE public.job_adverts ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_job_adverts ON public.job_adverts TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.companies WHERE id=company_id AND user_id=auth.uid()));
CREATE TABLE public.job_applicants (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),advert_id uuid NOT NULL REFERENCES public.job_adverts(id) ON DELETE CASCADE,company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,user_id uuid NOT NULL DEFAULT auth.uid(),name text NOT NULL,portrait_index integer NOT NULL,experience_years integer NOT NULL,qualifications text[] NOT NULL DEFAULT '{}',skills text[] NOT NULL DEFAULT '{}',previous_employer text NOT NULL,statement text NOT NULL,availability text NOT NULL,expected_wage numeric NOT NULL,reference_note text NOT NULL,status text NOT NULL DEFAULT 'Applied',applied_day integer NOT NULL);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.job_applicants TO authenticated; GRANT ALL ON public.job_applicants TO service_role;
ALTER TABLE public.job_applicants ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_job_applicants ON public.job_applicants TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.job_adverts a WHERE a.id=advert_id AND a.company_id=job_applicants.company_id AND a.user_id=auth.uid()));
CREATE UNIQUE INDEX driver_hired_applicant ON public.drivers(applicant_id) WHERE applicant_id IS NOT NULL;
CREATE FUNCTION public.publish_job_advert(p_company uuid,p_role text,p_depot text,p_wage numeric,p_positions integer,p_description text,p_candidates jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE ad uuid; day_no integer;
BEGIN
SELECT day INTO day_no FROM public.companies WHERE id=p_company AND user_id=auth.uid();
IF day_no IS NULL THEN RAISE EXCEPTION 'Company not found'; END IF;
IF NOT EXISTS(SELECT 1 FROM public.depots WHERE company_id=p_company AND town=p_depot) THEN RAISE EXCEPTION 'Choose an open depot'; END IF;
INSERT INTO public.job_adverts(company_id,role,depot,wage,positions,posted_day,description) VALUES(p_company,p_role,p_depot,p_wage,p_positions,day_no,p_description) RETURNING id INTO ad;
INSERT INTO public.job_applicants(advert_id,company_id,name,portrait_index,experience_years,qualifications,skills,previous_employer,statement,availability,expected_wage,reference_note,applied_day)
SELECT ad,p_company,x->>'name',(x->>'portrait_index')::integer,(x->>'experience_years')::integer,ARRAY(SELECT jsonb_array_elements_text(x->'qualifications')),ARRAY(SELECT jsonb_array_elements_text(x->'skills')),x->>'previous_employer',x->>'statement',x->>'availability',(x->>'expected_wage')::numeric,x->>'reference_note',day_no FROM jsonb_array_elements(p_candidates) x;
RETURN ad;
END; $$;
REVOKE ALL ON FUNCTION public.publish_job_advert(uuid,text,text,numeric,integer,text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.publish_job_advert(uuid,text,text,numeric,integer,text,jsonb) TO authenticated;
CREATE FUNCTION public.review_job_applicant(p_applicant uuid,p_action text) RETURNS text LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE a public.job_applicants; ad public.job_adverts; hired integer; next_status text;
BEGIN
SELECT * INTO a FROM public.job_applicants WHERE id=p_applicant AND user_id=auth.uid();
IF a.id IS NULL THEN RAISE EXCEPTION 'Application not found'; END IF;
SELECT * INTO ad FROM public.job_adverts WHERE id=a.advert_id AND user_id=auth.uid() FOR UPDATE;
SELECT * INTO a FROM public.job_applicants WHERE id=p_applicant FOR UPDATE;
IF ad.id IS NULL THEN RAISE EXCEPTION 'Advert not found'; END IF;
IF a.status IN ('Hired','Rejected','Declined') THEN RAISE EXCEPTION 'Application already decided'; END IF;
IF p_action='shortlist' THEN next_status='Shortlisted';
ELSIF p_action='reject' THEN next_status='Rejected';
ELSIF p_action='offer' THEN
IF ad.status<>'Open' THEN RAISE EXCEPTION 'Advert is closed'; END IF;
SELECT count(*) INTO hired FROM public.job_applicants WHERE advert_id=ad.id AND status='Hired';
IF hired>=ad.positions THEN RAISE EXCEPTION 'All positions filled'; END IF;
IF ad.wage<a.expected_wage THEN next_status='Declined';
ELSE
INSERT INTO public.drivers(company_id,name,role,depot,wage,staff_no,portrait_index,experience_years,qualifications,applicant_id) VALUES(ad.company_id,a.name,ad.role,ad.depot,ad.wage,'A-'||left(a.id::text,8),a.portrait_index,a.experience_years,a.qualifications,a.id);
next_status='Hired';
IF hired+1>=ad.positions THEN UPDATE public.job_adverts SET status='Filled' WHERE id=ad.id; END IF;
END IF;
ELSE RAISE EXCEPTION 'Unknown application action'; END IF;
UPDATE public.job_applicants SET status=next_status WHERE id=a.id;
RETURN next_status;
END; $$;
REVOKE ALL ON FUNCTION public.review_job_applicant(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.review_job_applicant(uuid,text) TO authenticated;