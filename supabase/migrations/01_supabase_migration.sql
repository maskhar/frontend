-- 1. Create the "plans" table
CREATE TABLE public.plans (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    price TEXT,
    period TEXT,
    description TEXT,
    features JSONB,
    popular BOOLEAN DEFAULT false,
    display_order INTEGER,
    CONSTRAINT plans_pkey PRIMARY KEY (id)
);

-- 2. Enable RLS on the table
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for the "plans" table
CREATE POLICY "Allow read access to everyone"
ON public.plans
FOR SELECT
USING (true);

-- NOTE: We will rely on the service_role key for admin actions (insert, update, delete)
-- by not creating policies for them. This is more secure for now.