-- Email + password login (see lib/passwords.ts, app/api/auth/login, app/api/auth/set-password).
-- Run once in the Supabase SQL editor.

-- One row per account. Passwords are stored only as scrypt hashes.
create table if not exists public.account_passwords (
  email         text primary key,
  password_hash text not null,
  updated_at    timestamptz not null default now()
);

-- Failed login attempts, used to slow down password guessing.
create table if not exists public.login_attempts (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  ip         text,
  created_at timestamptz not null default now()
);

create index if not exists login_attempts_email_idx on public.login_attempts (email, created_at);
create index if not exists login_attempts_ip_idx    on public.login_attempts (ip, created_at);

-- Only the server (service role) touches these tables; no public access.
alter table public.account_passwords enable row level security;
alter table public.login_attempts    enable row level security;
