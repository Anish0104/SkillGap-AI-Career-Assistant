-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  bio text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Resumes table
create table public.resumes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  file_path text not null, -- Path in Supabase Storage
  file_name text not null,
  extracted_text text,
  structured_data jsonb, -- Parsed skills, experience, etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.resumes enable row level security;

create policy "Users can view own resumes." on public.resumes
  for select using (auth.uid() = user_id);

create policy "Users can insert own resumes." on public.resumes
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own resumes." on public.resumes
  for delete using (auth.uid() = user_id);

-- Jobs table
create table public.jobs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  company text,
  location text,
  description text,
  url text,
  apply_url text,
  external_job_id text,
  company_logo text,
  salary_range text,
  salary_min numeric,
  salary_max numeric,
  is_remote boolean default false,
  employment_type text,
  status text default 'open', -- open, closed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Saved Jobs table
create table public.saved_jobs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  job_id uuid references public.jobs(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, job_id)
);

alter table public.saved_jobs enable row level security;

create policy "Users can view own saved jobs." on public.saved_jobs
  for select using (auth.uid() = user_id);

create policy "Users can insert own saved jobs." on public.saved_jobs
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own saved jobs." on public.saved_jobs
  for delete using (auth.uid() = user_id);

alter table public.jobs enable row level security;

create policy "Users can view own jobs." on public.jobs
  for select using (auth.uid() = user_id);

create policy "Users can insert own jobs." on public.jobs
  for insert with check (auth.uid() = user_id);

create policy "Users can update own jobs." on public.jobs
  for update using (auth.uid() = user_id);

create policy "Users can delete own jobs." on public.jobs
  for delete using (auth.uid() = user_id);

-- Applications table
create table public.applications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  job_id uuid references public.jobs(id) on delete cascade not null,
  resume_id uuid references public.resumes(id) on delete set null,
  status text default 'applied', -- applied, interviewing, offer, rejected
  notes text,
  applied_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.applications enable row level security;

create policy "Users can view own applications." on public.applications
  for select using (auth.uid() = user_id);

create policy "Users can insert own applications." on public.applications
  for insert with check (auth.uid() = user_id);

create policy "Users can update own applications." on public.applications
  for update using (auth.uid() = user_id);

create policy "Users can delete own applications." on public.applications
  for delete using (auth.uid() = user_id);

-- Job Analyses table (AI Results)
create table public.job_analyses (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  resume_id uuid references public.resumes(id) on delete cascade not null,
  match_score integer, -- 0-100
  missing_skills jsonb,
  recommendations jsonb,
  analysis_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.job_analyses enable row level security;

create policy "Users can view own analyses." on public.job_analyses
  for select using (
    exists (
      select 1 from public.jobs where id = job_analyses.job_id and user_id = auth.uid()
    )
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage Bucket for Resumes
insert into storage.buckets (id, name, public) values ('resumes', 'resumes', false);

create policy "Resume Access" on storage.objects for select using ( bucket_id = 'resumes' and auth.uid() = owner );
create policy "Resume Upload" on storage.objects for insert with check ( bucket_id = 'resumes' and auth.uid() = owner );
create policy "Resume Delete" on storage.objects for delete using ( bucket_id = 'resumes' and auth.uid() = owner );
