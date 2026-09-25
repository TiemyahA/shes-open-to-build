CREATE TABLE public.activity_counters (
  event_name TEXT PRIMARY KEY CHECK (event_name IN ('photo_upload', 'ring_download')),
  event_count BIGINT NOT NULL DEFAULT 0 CHECK (event_count >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.activity_counters TO anon, authenticated;
GRANT ALL ON public.activity_counters TO service_role;

ALTER TABLE public.activity_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read activity counters"
ON public.activity_counters
FOR SELECT
TO anon, authenticated
USING (true);

CREATE OR REPLACE FUNCTION public.increment_activity_counter(_event_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _event_name NOT IN ('photo_upload', 'ring_download') THEN
    RAISE EXCEPTION 'Unsupported activity event';
  END IF;

  INSERT INTO public.activity_counters (event_name, event_count)
  VALUES (_event_name, 1)
  ON CONFLICT (event_name)
  DO UPDATE SET
    event_count = public.activity_counters.event_count + 1,
    updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.increment_activity_counter(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_activity_counter(TEXT) TO anon, authenticated, service_role;