-- Secure cloud sync table for local app state
-- Run this in Supabase SQL Editor

create extension if not exists pgcrypto;

-- Drop legacy insecure structure if it exists.
drop table if exists public.app_state cascade;

create table public.app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.set_app_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_app_state_set_updated_at
before update on public.app_state
for each row
execute function public.set_app_state_updated_at();

alter table public.app_state enable row level security;

-- Authenticated users can only read/write their own app state.
create policy "Users can read own app state"
on public.app_state
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own app state"
on public.app_state
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own app state"
on public.app_state
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own app state"
on public.app_state
for delete
to authenticated
using (auth.uid() = user_id);
