-- Supabase SQL Migration: Create Trial Bookmarks Table

CREATE TABLE IF NOT EXISTS public.trial_bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  nct_id text not null,
  study_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure a user cannot bookmark the same trial twice
  unique(user_id, nct_id)
);

-- Enable Row Level Security (RLS) but allow anonymous access for prototype
ALTER TABLE public.trial_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read bounds" 
ON public.trial_bookmarks
FOR SELECT 
USING (true);

CREATE POLICY "Allow anonymous insert bounds" 
ON public.trial_bookmarks
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow anonymous delete bounds" 
ON public.trial_bookmarks
FOR DELETE 
USING (true);
