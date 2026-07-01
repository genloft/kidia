-- ============================================================
-- Kidia: sistema de inscripciones (padres/hijos) por camino/edad
-- Ejecutar en el SQL Editor de Supabase, sobre el proyecto que ya
-- tiene aplicado supabase_schema.sql.
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
-- 2. learning_paths: catálogo público de caminos por edad
--    (gestionado a mano por SQL, sin panel de admin todavía)
-- ------------------------------------------------------------
create table if not exists public.learning_paths (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  age_min int not null,
  age_max int not null,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  price_cents int,
  display_order int default 0,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.learning_paths enable row level security;

-- Catálogo público: cualquiera (incluso sin sesión) puede ver los caminos activos
create policy "Anyone can view active learning paths"
  on public.learning_paths for select
  using (active = true);

-- ------------------------------------------------------------
-- 3. enrollments: qué hijo está inscrito en qué camino
-- ------------------------------------------------------------
create table if not exists public.enrollments (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid references public.children on delete cascade not null,
  path_id uuid references public.learning_paths on delete cascade not null,
  parent_id uuid references auth.users on delete cascade not null,
  status text default 'active' check (status in ('active', 'cancelled', 'pending_payment')),
  payment_status text default 'unpaid' check (payment_status in ('unpaid', 'paid')),
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (child_id, path_id)
);

alter table public.enrollments enable row level security;

create policy "Parents can view own enrollments"
  on public.enrollments for select
  using (auth.uid() = parent_id);

create policy "Parents can insert own enrollments"
  on public.enrollments for insert
  with check (auth.uid() = parent_id);

create policy "Parents can update own enrollments"
  on public.enrollments for update
  using (auth.uid() = parent_id);

create policy "Parents can delete own enrollments"
  on public.enrollments for delete
  using (auth.uid() = parent_id);

create index if not exists enrollments_parent_id_idx on public.enrollments(parent_id);
create index if not exists enrollments_child_id_idx on public.enrollments(child_id);

-- ------------------------------------------------------------
-- 4. user_profiles: se queda solo con datos de cuenta del padre.
--    El progreso/datos de hijo se mudan a `children`.
-- ------------------------------------------------------------
alter table public.user_profiles drop column if exists child_name;
alter table public.user_profiles drop column if exists child_dob;
alter table public.user_profiles drop column if exists completed_scenarios;
alter table public.user_profiles drop column if exists badges;
alter table public.user_profiles drop column if exists scores;
alter table public.user_profiles drop column if exists scenario_progress;
alter table public.user_profiles drop column if exists is_premium;

-- ------------------------------------------------------------
-- 5. Seed: los 3 caminos iniciales (mapeados 1:1 con el campo
--    `difficulty` que ya tiene cada escenario en src/content/es/*.json)
-- ------------------------------------------------------------
insert into public.learning_paths (slug, name, description, age_min, age_max, difficulty, display_order)
values
  (
    'iniciacion-ia',
    'Iniciación IA',
    'Los primeros pasos: qué es la Inteligencia Artificial, cómo aprende de patrones y por qué a veces se equivoca.',
    9, 10,
    'beginner',
    1
  ),
  (
    'exploradores-ia',
    'Exploradores IA',
    'Un paso más allá: historia de la IA, cómo "entienden" el lenguaje los modelos y el arte de pedirle las cosas bien.',
    11, 12,
    'intermediate',
    2
  ),
  (
    'maestros-ia',
    'Maestros IA',
    'Para los más avanzados: ética y sesgos, redes neuronales, el debate sobre si la IA "entiende" de verdad, y el futuro de la tecnología.',
    13, 14,
    'advanced',
    3
  )
on conflict (slug) do nothing;
