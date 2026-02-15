-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User Profiles table (Linked to Auth Users)
-- This stores all user progress data in a single table
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  completed_scenarios text[] default '{}',
  badges text[] default '{}',
  scores jsonb default '{}',
  scenario_progress jsonb default '{}',
  is_premium boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for user_profiles
alter table public.user_profiles enable row level security;

create policy "Users can view own profile" 
  on public.user_profiles for select 
  using ( auth.uid() = id );

create policy "Users can insert own profile" 
  on public.user_profiles for insert 
  with check ( auth.uid() = id );

create policy "Users can update own profile" 
  on public.user_profiles for update 
  using ( auth.uid() = id );

-- Handle new user creation trigger
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.user_profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Index for performance
create index if not exists user_profiles_email_idx on public.user_profiles(email);
