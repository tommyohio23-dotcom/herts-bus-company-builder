ALTER TABLE public.job_adverts DROP CONSTRAINT IF EXISTS job_adverts_positions_check;
ALTER TABLE public.job_adverts ADD CONSTRAINT job_adverts_positions_check CHECK (positions BETWEEN 1 AND 500);