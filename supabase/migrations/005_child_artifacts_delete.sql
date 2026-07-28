-- ============================================================
-- Kidia: policy DELETE para child_artifacts (Cuaderno de Inventor/a)
-- Ejecutar en el SQL Editor de Supabase, sobre el proyecto que ya
-- tiene aplicado supabase_schema.sql, 002, 003 y 004.
--
-- Hallazgo menor #3 de la auditoría RLS (docs/mejora/06-auditoria-rls.md):
-- child_artifacts tenía SELECT/INSERT/UPDATE para el padre/madre, pero
-- ningún DELETE — ni la app lo ofrecía en la UI, ni existía la policy si
-- se intentaba desde la API directamente (el DELETE simplemente no borraba
-- ninguna fila, sin dar error). Confirmado en la práctica el 17/07/2026
-- al intentar limpiar un artefacto de prueba del Cuaderno navegable nuevo
-- (docs/mejora/ESTADO.md): la llamada devolvía éxito pero 0 filas afectadas.
--
-- Sin esto, un padre/madre no puede ejercer el derecho de supresión RGPD
-- sobre una creación concreta de su hijo/a (hoy solo se borra en cascada
-- si se elimina al hijo/a entero desde el Panel Familiar).
-- ============================================================

create policy "Parents can delete own children artifacts"
  on public.child_artifacts for delete
  using (
    exists (select 1 from public.children c where c.id = child_id and c.parent_id = auth.uid())
  );
