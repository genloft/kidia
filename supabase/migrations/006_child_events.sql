-- ============================================================
-- Kidia: ledger de eventos de progreso (chispas ⚡ y niveles)
-- Ejecutar en el SQL Editor de Supabase, sobre el proyecto que ya
-- tiene aplicado supabase_schema.sql, 002, 003, 004 y 005.
--
-- doc 04 §3.1: "el esqueleto" de la gamificación. Cada fila es un hecho
-- inmutable ("completó la misión 1.1", "coleccionó las palabras de 2.3")
-- con las chispas que otorgó. Los totales SIEMPRE se derivan sumando el
-- ledger, nunca se guardan como agregado — esto, además de dar historial
-- gratis (métricas doc 04 §6), es el primer paso para resolver la
-- duplicación de progreso señalada en la auditoría técnica (01 §3.2).
--
-- Idempotencia: el índice único (child_id, tipo, ref_id) hace que repetir
-- una misión NO vuelva a dar chispas (el insert choca y se ignora desde el
-- cliente con ignoreDuplicates). Un niño puede rejugar todo lo que quiera;
-- la recompensa es una sola vez por hecho.
--
-- Append-only a propósito: hay policies de SELECT e INSERT pero ninguna de
-- UPDATE ni DELETE — ni el cliente ni el niño pueden reescribir el pasado.
-- (Borrar al hijo/a sí arrastra sus eventos, por la FK en cascada: RGPD.)
-- ============================================================

create table if not exists public.child_events (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid not null references public.children(id) on delete cascade,
  tipo text not null,          -- 'mision_completada' | 'palabras_coleccionadas' | 'mision_familia' | 'creacion_publicada' | 'insignia_ganada' | ...
  chispas integer not null default 0 check (chispas >= 0),
  ref_id text not null,        -- id de la unidad/insignia a la que se refiere el evento
  created_at timestamptz not null default now()
);

alter table public.child_events enable row level security;

create policy "Parents can view own children events"
  on public.child_events for select
  using (
    exists (select 1 from public.children c where c.id = child_id and c.parent_id = auth.uid())
  );

create policy "Parents can insert own children events"
  on public.child_events for insert
  with check (
    exists (select 1 from public.children c where c.id = child_id and c.parent_id = auth.uid())
  );

-- Un evento por hecho: repetir misión no da chispas otra vez.
create unique index if not exists child_events_unique_fact_idx
  on public.child_events(child_id, tipo, ref_id);

create index if not exists child_events_child_id_idx on public.child_events(child_id);
