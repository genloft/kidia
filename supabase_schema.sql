-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (Linked to Auth Users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null,
  email text,
  username text,
  is_premium boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- RLS for Profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile" 
  on public.profiles for select 
  using ( auth.uid() = id );

create policy "Users can update own profile" 
  on public.profiles for update 
  using ( auth.uid() = id );

-- Handle new user creation trigger
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- User Progress Table
create table public.user_progress (
  user_id uuid references public.profiles(id) on delete cascade not null,
  scenario_id text not null,
  completed boolean default false,
  badge_id text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, scenario_id)
);

-- RLS for Progress
alter table public.user_progress enable row level security;

create policy "Users can view own progress" 
  on public.user_progress for select 
  using ( auth.uid() = user_id );

create policy "Users can insert/update own progress" 
  on public.user_progress for all 
  using ( auth.uid() = user_id );
