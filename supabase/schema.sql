-- Optional next phase schema for SnapChef saved scans.
-- Run this in Supabase SQL Editor when you are ready to add user accounts/history.

create table if not exists public.snapchef_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  dish_name text not null,
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  summary text not null,
  result jsonb not null,
  image_path text,
  created_at timestamptz not null default now()
);

alter table public.snapchef_scans enable row level security;

create policy "Users can read their own scans"
  on public.snapchef_scans
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own scans"
  on public.snapchef_scans
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own scans"
  on public.snapchef_scans
  for delete
  using (auth.uid() = user_id);
