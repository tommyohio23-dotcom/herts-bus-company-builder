CREATE TABLE public.review_ai_access (user_id uuid PRIMARY KEY, blocked_status integer NOT NULL, message text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.review_ai_access TO authenticated; GRANT ALL ON public.review_ai_access TO service_role;
ALTER TABLE public.review_ai_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_review_ai_access ON public.review_ai_access FOR SELECT TO authenticated USING(user_id=auth.uid());