# 06 · Auditoría RLS (Supabase)

Fecha: 16/07/2026 · Fuente: `supabase_schema.sql`, `supabase/migrations/002`, `003`.
Auditoría hecha sobre los ficheros SQL del repo; conviene verificar en el panel de
Supabase que las policies desplegadas coinciden (el SQL se ejecutó a mano en el editor).

## Resumen

| Tabla | Estado | Riesgo |
|-------|--------|--------|
| `children` | ✅ Correcta (4 ops filtradas por `parent_id = auth.uid()`) | — |
| `user_profiles` | ⚠️ El usuario puede escribirse su propio `plan_status` | Conocido/aceptado en beta |
| `child_artifacts` | ❌ **Un usuario puede autoaprobar sus artefactos** | Alto — salta la moderación de la galería |

## Hallazgo crítico: autoaprobación de artefactos

Las policies de `child_artifacts` (migración 003) para INSERT y UPDATE solo
comprueban que el artefacto pertenece a un hijo del usuario — **no restringen las
columnas**. Consecuencia: cualquier usuario autenticado puede, con la anon key y
una llamada directa a la API de Supabase (sin pasar por la UI):

1. `INSERT` un artefacto ya con `moderation_status = 'approved'`, o
2. `UPDATE` su artefacto a `moderation_status = 'approved'`,

y aparecer en la galería pública **sin revisión humana**. En un producto infantil
con galería visible por otros niños, esto anula la garantía "Vael la revisa".

### Corrección propuesta (SQL completo, pegar en el SQL Editor de Supabase)

Se hace con triggers (no con `revoke` de columnas, que es por rol y rompería el
panel de admin, ya que el admin es un usuario `authenticated` más). El trigger
fuerza `pending` en todo INSERT que no venga del email admin, y bloquea cualquier
cambio de estado de moderación vía UPDATE que no venga del admin:

```sql
create or replace function public.guard_artifact_moderation()
returns trigger language plpgsql security definer as $$
declare
  is_admin boolean := coalesce((auth.jwt() ->> 'email'), '')
                      = any (array['garciagarcia.juanantonio@gmail.com']);
begin
  if is_admin then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- Todo artefacto nuevo entra sin aprobar, diga lo que diga el cliente.
    new.moderation_status := 'pending';
    new.moderation_notes := null;
  elsif tg_op = 'UPDATE' then
    -- El dueño puede editar el contenido y re-enviar a revisión ('pending',
    -- lo que hace submitToGallery), pero nunca aprobar/rechazar.
    if new.moderation_status is distinct from old.moderation_status
       and new.moderation_status <> 'pending' then
      raise exception 'Solo moderación puede aprobar o rechazar artefactos';
    end if;
    new.moderation_notes := old.moderation_notes;
  end if;

  return new;
end $$;

drop trigger if exists child_artifacts_guard_moderation on public.child_artifacts;
create trigger child_artifacts_guard_moderation
  before insert or update on public.child_artifacts
  for each row execute function public.guard_artifact_moderation();
```

Compatibilidad verificada con el código actual: `saveArtifact` inserta sin status
(default `pending`) y `submitToGallery` (`unidad-service.ts:129`) pone `pending` —
ambos siguen funcionando; el panel `admin/moderacion.astro` aprueba con la sesión
del email admin — también sigue funcionando. La allowlist de email sigue duplicada
(policies + trigger + cliente): se unifica en tabla de roles en el punto 4.

## Hallazgos menores

1. **La galería expone `child_id`** — la policy "Anyone can view approved artifacts"
   permite `select('*')`: `child_id` es un identificador estable que correlaciona
   todas las creaciones públicas de un mismo menor. Mitigar con una **vista**
   `gallery_artifacts` (solo `id, tipo, contenido, created_at`) y que la galería
   lea de ella.
2. **Lectura anónima** — esa misma policy no exige sesión: cualquiera con la anon
   key lee los artefactos aprobados aunque la UI esté tras login. Decidir si es
   intencional (galería pública real) o añadir `auth.role() = 'authenticated'`.
3. **Sin policy DELETE en `child_artifacts`** — un padre no puede borrar una
   creación de su hijo (derecho de supresión RGPD; hoy solo cae en cascada al
   borrar el hijo). Añadir DELETE con el mismo filtro de parentesco.
4. **Admin por allowlist de email hardcodeada** en dos policies + duplicada en
   `ADMIN_EMAILS` del cliente. Ya documentado en el propio SQL como provisional;
   sustituir por tabla de roles antes de tener equipo de moderación.
5. **`user_profiles.plan_status` auto-escribible** (activatePlan sin pago): aceptado
   en beta; al conectar Stripe, revocar update de `plan/plan_status/plan_started_at`
   al cliente y escribirlas solo desde el webhook.

## Acciones

- [ ] P0: cerrar la autoaprobación (trigger INSERT + protección UPDATE).
- [ ] P1: vista para la galería sin `child_id`.
- [ ] P1: policy DELETE para padres.
- [ ] P2: tabla de roles de admin (junto con backend de Fase 0).
- [ ] P2: verificar en el panel de Supabase que lo desplegado == lo del repo.
