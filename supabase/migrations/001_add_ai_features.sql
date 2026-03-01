-- Migration: Add AI Features (Learning Paths & Mock Interviews)

-- 1. Create Learning Paths Table
CREATE TABLE public.learning_paths (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
  missing_skills jsonb,
  path_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own learning paths." ON public.learning_paths
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning paths." ON public.learning_paths
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning paths." ON public.learning_paths
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own learning paths." ON public.learning_paths
  FOR DELETE USING (auth.uid() = user_id);


-- 2. Create Mock Interviews Table
CREATE TABLE public.mock_interviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  resume_id uuid REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
  messages jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'in_progress', -- 'in_progress' or 'completed'
  feedback jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.mock_interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mock interviews." ON public.mock_interviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mock interviews." ON public.mock_interviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mock interviews." ON public.mock_interviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mock interviews." ON public.mock_interviews
  FOR DELETE USING (auth.uid() = user_id);
