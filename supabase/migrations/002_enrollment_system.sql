-- ============================================================
-- Kidia: varios hijos por cuenta + suscripción familiar
-- Ejecutar en el SQL Editor de Supabase, sobre el proyecto que ya
-- tiene aplicado supabase_schema.sql.
--
-- Modelo real (ver Kidia_Campus_BPlan_Final.docx): NO se paga por
-- hijo ni por camino de edad. Se paga UNA suscripción familiar
-- (Familiar / Familiar Plus / Premium) que da acceso completo; el
-- tramo de cada hijo (8-9 / 10-11 / 12-14) se calcula automáticamente
-- a partir de su fecha de nacimiento, no se "inscribe" ni se compra
-- por separado.
-- ============================================================

-- ------------------------------------------------------------
-- 1. children: uno o varios hijos por cada cuenta de padre/madre
-- ------------------------------------------------------------
create table if not exists public.children (
  id uuid primary key default uuid_generate_v4(),
  parent_id uuid references auth.users on delete cascade not null,
  name text not null,
  birth_date date,
  avatar text,
  completed_scenarios text[] default '{}',
  badges text[] default '{}',
  scores jsonb default '{}',
  scenario_progress jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.children enable row level security;

create policy "Parents can view own children"
  on public.children for select
  using (auth.uid() = parent_id);

create policy "Parents can insert own children"
  on public.children for insert
  with check (auth.uid() = parent_id);

create policy "Parents can update own children"
  on public.children for update
  using (auth.uid() = parent_id);

create policy "Parents can delete own children"
  on public.children for delete
  using (auth.uid() = parent_id);

create index if not exists children_parent_id_idx on public.children(parent_id);

-- ------------------------------------------------------------
-- 2. user_profiles: datos de cuenta del padre + suscripción familiar.
--    El progreso/datos de hijo se mudan a `children`.
-- ------------------------------------------------------------
alter table public.user_profiles drop column if exists child_name;
alter table public.user_profiles drop column if exists child_dob;
alter table public.user_profiles drop column if exists completed_scenarios;
alter table public.user_profiles drop column if exists badges;
alter table public.user_profiles drop column if exists scores;
alter table public.user_profiles drop column if exists scenario_progress;
alter table public.user_profiles drop column if exists is_premium;

alter table public.user_profiles
  add column if not exists plan text check (plan in ('familiar', 'familiar_plus', 'premium')),
  add column if not exists plan_status text default 'inactive' check (plan_status in ('inactive', 'active', 'cancelled')),
  add column if not exists plan_started_at timestamp with time zone;

-- Nota: sin pago real todavía, "activar" un plan (perfil.astro /
-- caminos.astro) escribe directamente plan_status='active'. Cuando
-- se conecte Stripe de verdad, el flujo pasa a crear la suscripción
-- con plan_status='inactive' y activarla solo desde el webhook de
-- pago confirmado.
