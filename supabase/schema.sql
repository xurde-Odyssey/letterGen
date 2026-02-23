-- Letter Generator schema for Supabase
-- Run this in Supabase SQL Editor

create extension if not exists pgcrypto;

-- Company profiles per user
create table if not exists public.company_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null,
  applicant_name text,
  company_address text,
  pan_no text,
  letterpad_image_base64 text,
  signature_stamp_image_base64 text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_company_profiles_user_id on public.company_profiles(user_id);

-- Saved draft (one current draft per user)
create table if not exists public.user_drafts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active_template_id text,
  form_data jsonb not null default '{}'::jsonb,
  selected_company_profile_id uuid references public.company_profiles(id) on delete set null,
  saved_at timestamptz not null default now()
);

-- Update timestamp helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger for company profile updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_company_profiles_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_company_profiles_set_updated_at
    BEFORE UPDATE ON public.company_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END$$;

-- Enable RLS
alter table public.company_profiles enable row level security;
alter table public.user_drafts enable row level security;

-- RLS: company profiles access only for owner
create policy "Users can view own company profiles"
on public.company_profiles
for select
using (auth.uid() = user_id);

create policy "Users can insert own company profiles"
on public.company_profiles
for insert
with check (auth.uid() = user_id);

create policy "Users can update own company profiles"
on public.company_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own company profiles"
on public.company_profiles
for delete
using (auth.uid() = user_id);

-- RLS: draft access only for owner
create policy "Users can view own draft"
on public.user_drafts
for select
using (auth.uid() = user_id);

create policy "Users can insert own draft"
on public.user_drafts
for insert
with check (auth.uid() = user_id);

create policy "Users can update own draft"
on public.user_drafts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own draft"
on public.user_drafts
for delete
using (auth.uid() = user_id);
