-- ============================================================
-- Kidia: módulo de retos "unidad-aventura" (rediseño tramo 8-9)
-- Ejecutar en el SQL Editor de Supabase, sobre el proyecto que ya
-- tiene aplicado supabase_schema.sql y 002_enrollment_system.sql.
--
-- Ver Kidia_Programa_Retos_8-9_v2.docx: añade tres sistemas nuevos
-- que no existían — Cuaderno de Inventor/a (child_artifacts, con
-- moderación previa a compartir), Muro de Palabras (children.vocabulary)
-- y registro de Misión en familia (children.family_missions_completed,
-- para que aparezca en el Panel Familiar).
-- ============================================================

-- ------------------------------------------------------------
-- 1. child_artifacts: Cuaderno de Inventor/a de cada hijo/a.
--    Cada fila es un artefacto real creado en el paso "Crea" de una
--    unidad-aventura (Detector de IA, mini-cerebro entrenado, imagen +
--    prompt, ficha de error cazado...).
-- ------------------------------------------------------------
create table if not exists public.child_artifacts (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid references public.children on delete cascade not null,
  unidad_id text not null, -- "1.1", "1.2"...
  tipo text not null, -- detector_ia | mini_cerebro | hechizo_imagen | expediente_error...
  contenido jsonb not null default '{}',
  depende_de text[] default '{}', -- ids de otros child_artifacts que este reutiliza (unidades futuras)
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected')),
  moderation_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.child_artifacts enable row level security;

-- El padre/madre ve y gestiona los artefactos de sus propios hijos.
create policy "Parents can view own children artifacts"
  on public.child_artifacts for select
  using (
    exists (select 1 from public.children c where c.id = child_id and c.parent_id = auth.uid())
  );

create policy "Parents can insert own children artifacts"
  on public.child_artifacts for insert
  with check (
    exists (select 1 from public.children c where c.id = child_id and c.parent_id = auth.uid())
  );

create policy "Parents can update own children artifacts"
  on public.child_artifacts for update
  using (
    exists (select 1 from public.children c where c.id = child_id and c.parent_id = auth.uid())
  );

-- Lectura pública de artefactos ya aprobados: alimenta la galería
-- moderada (sin filtrar por parent_id — son de solo lectura, sin datos
-- identificativos, y solo cuando moderation_status = 'approved').
create policy "Anyone can view approved artifacts"
  on public.child_artifacts for select
  using (moderation_status = 'approved');

-- Panel de moderación (src/pages/admin/moderacion.astro): sin sistema de
-- roles de staff todavía, así que el acceso se controla aquí, a nivel de
-- base de datos (no basta con ocultar el botón en el cliente), contra una
-- allowlist fija de emails. Debe mantenerse en sync con ADMIN_EMAILS en
-- admin/moderacion.astro. Sustituir por una tabla de roles reales antes
-- de operar con equipo de moderación de verdad.
create policy "Admins can view all artifacts for moderation"
  on public.child_artifacts for select
  using ((auth.jwt() ->> 'email') = any (array['garciagarcia.juanantonio@gmail.com']));

create policy "Admins can update moderation status"
  on public.child_artifacts for update
  using ((auth.jwt() ->> 'email') = any (array['garciagarcia.juanantonio@gmail.com']));

create index if not exists child_artifacts_child_id_idx on public.child_artifacts(child_id);
create index if not exists child_artifacts_moderation_status_idx on public.child_artifacts(moderation_status);

-- ------------------------------------------------------------
-- 2. children.vocabulary: Muro de Palabras (palabras coleccionadas).
--    children.family_missions_completed: registro de "Misión en
--    familia" completada, para que el Panel Familiar la muestre.
-- ------------------------------------------------------------
alter table public.children
  add column if not exists vocabulary jsonb default '[]',
  add column if not exists family_missions_completed jsonb default '[]';
