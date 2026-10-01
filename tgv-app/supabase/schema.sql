-- Part 1: run this in Supabase → SQL Editor when you are ready to use Supabase.
create extension if not exists "pgcrypto";

create table if not exists public.visit_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  mobile text not null,
  email text,
  interest text,
  visit_date date,
  guests int check (guests between 1 and 50),
  message text,
  status text not null default 'new'
    check (status in ('new','contacted','scheduled','done','cancelled')),
  created_at timestamptz not null default now()
);

-- Lock the table: only the server (service role key) can read/write.
-- Browsers using the public anon key get no access.
alter table public.visit_requests enable row level security;
