# 05 · Roadmap de ejecución

Orden pensado para que cada fase se apoye en la anterior y el producto sea
desplegable al final de cada una. Las duraciones son orientativas trabajando
a ritmo constante con ayuda de Claude.

## Principio rector: 8-9 primero, luego replicar

El tramo 8-9 es el único nivel realmente desarrollado (16 unidades + 4 misiones
especiales en el formato nuevo); 10-11 y 12-14 apenas tienen 4 retos legacy cada
uno. Por eso la estrategia es deliberada:

1. **Fases 1-3 se ejecutan sobre el tramo 8-9** como experiencia de referencia:
   sistema de diseño, usabilidad y gamificación se diseñan, prueban y pulen ahí.
2. **Fase 4 replica al resto.** Una vez 8-9 esté a nivel objetivo, se lleva todo
   lo conseguido (motor, formato, diseño, gamificación) a 10-11 y 12-14, que se
   desarrollan directamente sobre la base ya mejorada — nunca sobre el formato
   legacy.

Consecuencia práctica: no se invierte esfuerzo en mejorar `game-engine.ts` ni las
pantallas legacy más allá de que no estorben; todo lo nuevo se construye para que
escalar a los otros tramos sea configuración + contenido, no otro rediseño.

```
Fase 0          Fase 1              Fase 2                Fase 3            Fase 4
Limpieza   →    Sistema de     →    Usabilidad núcleo →   Gamificación  →   Paridad de
y decisión      diseño              (onboarding, modos,   (bucle completo)  tramos 10-11
de hosting      (fundación)         mapa)                                   y 12-14
~1 semana       ~2 semanas          ~2-3 semanas          ~2-3 semanas      ~4+ semanas
```

## Fase 0 — Limpieza y decisiones (≈1 semana)

Objetivo: terreno despejado y la decisión de infraestructura tomada.

- [x] **Decidir hosting/backend** (doc 01 §2.1). **Decisión (16/07/2026): seguir
      100 % estático por ahora** — la beta funciona sin backend (bancos cerrados +
      moderación local + Web Speech). IA real, moderación por modelo y Stripe se
      posponen; cuando toquen (Fase 4), la opción por defecto a reevaluar son las
      Supabase Edge Functions. Los endpoints muertos ya se han eliminado, así que
      no queda código engañoso.
- [x] Borrar carpeta `/constructor` raíz (duplicada). *(16/07/2026)*
- [x] Borrar `src/pages/api/checkout.ts` y `src/pages/api/chat.ts` (muertos en
      producción) y `src/lib/stripe.ts` / `src/lib/openai.ts` + dependencias npm
      `openai`, `stripe`, `@astrojs/node`. *(16/07/2026)*
- [x] `.env.example` con placeholders; `.astro/` a `.gitignore`; retirar
      `REPORTE_MEJORAS.txt` y `Report`. *(16/07/2026)*
- [x] CI mínima: GitHub Actions con build bloqueante + `astro check` informativo
      (186 errores de tipos en código legacy; pasa a bloqueante al jubilarlo en
      Fase 4). *(16/07/2026)*
- [x] Auditoría de policies RLS → [06-auditoria-rls.md](06-auditoria-rls.md).
      **Deja abierto un P0:** cerrar la autoaprobación de artefactos (SQL en el
      panel de Supabase). *(16/07/2026)*
- [x] Recomprimir `public/morti.webp` (596 KB → 132 KB). *(16/07/2026)*
- [ ] Aplicar la corrección RLS P0 en Supabase (ver doc 06).

**Hecho cuando:** build verde en CI, repo sin duplicados, decisión de backend escrita.

## Fase 1 — Sistema de diseño (≈2 semanas) — doc 03

Objetivo: tokens + componentes núcleo, migración de las páginas principales.

- [x] `src/styles/tokens.css` (semánticos mapeados a valores actuales; cero cambio visual). *(16/07/2026)*
- [x] Componentes: Button, Card, Pill, ProgressBar/Steps, Modal, VaelBubble,
      EmptyState, Toast + página `/dev/ui` (solo dev). *(16/07/2026)*
- [x] `prefers-reduced-motion` global + estilo de foco visible. *(16/07/2026)*
- [x] Self-host de la fuente Outfit (@fontsource, 400/600/800). *(16/07/2026)*
- [x] Migrar: Layout/Header → mapa (rediseñado como mapa de zonas) → laboratorio
      (motor incluido) → dashboard/perfil → login. 0 literales de color en todas.
      Contraste AA verificado (muted 6.9-7.8; locked 3.7 aceptado: elementos
      deshabilitados están exentos en WCAG y llevan icono 🔒). *(16/07/2026)*
- [x] Glosario de lenguaje aplicado (Misión/Zona/Cuaderno/Insignia) en las páginas migradas. *(16/07/2026)*

**Hecho cuando:** ninguna página migrada contiene colores literales ✓; `/dev/ui`
muestra la biblioteca completa ✓. (Pendiente diferido: constructor.css migra solo
a nivel de tokens al final, según doc 03 §7; Lighthouse formal cuando el usuario
pruebe con login real.)

**FASE 1 COMPLETADA el 16/07/2026** — falta únicamente la validación visual del
usuario con la cuenta de prueba.

## Fase 2 — Usabilidad núcleo (≈2-3 semanas) — doc 02

Objetivo: el flujo del niño y el del padre separados y sin fricción.

- [x] **Onboarding wizard** (`/bienvenida`, 3 pasos → directo a misión 1.1
      gratuita): nombre + fecha con preview del tramo en vivo, 3 tarjetas de
      confianza, cierre con Vael. El dashboard redirige aquí si no hay hijos.
      Validación: solo nombre de pila (protección de identidad), edad 4-17.
      *(17/07/2026)*
- [x] **Modo Aventura / Modo Familia:** Header con 3 modos (aventura/familia/
      publico); Panel Familiar unificado en parents.astro (progreso de todos
      los hijos + gestión absorbida de perfil#hijos + PIN); gate por PIN de
      4 dígitos (decisión del usuario; `familia-gate.ts` + migración 004,
      pendiente de pegar en Supabase). Detalle en ESTADO.md. *(17/07/2026)*
- [x] **Selector de perfil** tipo "elige tu personaje" (dashboard.astro
      reescrito): tarjetas grandes con inicial/avatar + tramo → elegir lleva
      directo al Mapa; con 1 solo hijo salta el selector; con 0, al wizard.
      El antiguo dashboard de dos tarjetas Mapa/Constructor desaparece.
      *(17/07/2026)*
- [x] **Mapa de zonas v1:** vertical, touch-first, 4 zonas visibles con paradas,
      sin tilt/hover-tooltips, estados de tarjeta claros. (Se adelantó a la
      Fase 1 por decisión del usuario; avatar-en-mapa queda para valorar en
      Fase 3.) *(16/07/2026)*
- [x] **Retomar misión a medias** (pantalla + investigaResultado + artifactId
      en localStorage por hijo+unidad; portada con "Seguir donde lo dejé").
      *(17/07/2026)*
- [x] Patrón de error amable unificado (Vael + reintento) — primer uso en el
      guardado de creaciones (saveArtifact); extender al resto de servicios
      cuando se toque cada pantalla. *(17/07/2026)*

**Hecho cuando:** un padre nuevo llega de registro a "su hijo terminó la misión 1.1"
sin callejones sin salida, en móvil.

## Fase 3 — Gamificación (≈2-3 semanas) — doc 04

Objetivo: el bucle jugar → recompensa → progreso → volver, completo.

- [ ] Ledger `child_events` + chispas + niveles de inventor/a (migrando los
      agregados actuales; resuelve la doble fuente de progreso).
- [ ] Sistema de celebración unificado (3 intensidades).
- [ ] Diccionario de Palabras Poderosas + Cuaderno de Inventos navegable.
- [ ] Insignias v2 (cómo conseguir cada una).
- [ ] Racha amable + misiones en familia con bonus y rastro en el panel adulto.
- [ ] Retirar "Modo profundo" → "Reto extra de Vael".
- [ ] Avatar/laboratorio personalizable (v1 pequeña: 6-8 cosméticos).

**Hecho cuando:** al completar una misión el niño ve chispas + celebración + su
mapa avanzar, y tiene algo que mirar (colecciones) y algo que querer (cosméticos).

## Fase 4 — Paridad de tramos: llevar lo de 8-9 al resto (≈4+ semanas)

Objetivo: que un hijo de 10 o 13 años tenga una experiencia tan completa como uno
de 8. Se arranca solo cuando el tramo 8-9 haya alcanzado el nivel objetivo de las
Fases 1-3 (es el molde que se replica).

- [ ] Extender el schema unidad-aventura con los grados de autonomía de 10-11
      (semiguiado) y 12-14 (autónomo + Morti).
- [ ] Producir las 16 unidades de 10-11 y las de 12-14 desde los docx del método
      (mismo pipeline JSON que 8-9).
- [ ] Migrar los 12 retos legacy al formato nuevo; jubilar `game-engine.ts`,
      `scenario/[slug]` y el Quiz separado (el quiz pasa a ser pantalla del motor).
- [ ] Chat con Vael/Morti real (si Fase 0 eligió backend): system prompt desde la
      documentación del método, moderación por modelo en servidor.
- [ ] Stripe Subscriptions real (3 planes) + webhook.

**Hecho cuando:** los 3 tramos usan un solo motor; `game-engine.ts` eliminado;
suscripción real cobrable.

## Reglas de trabajo durante todo el plan

1. Cada fase termina desplegada y probada con la cuenta de familia de prueba
   (Leo 8-9 / Marta 10-11 / Hugo 12-14).
2. Ningún PR introduce colores/espaciados literales tras la Fase 1.
3. Los textos de niño pasan el filtro de voz de Vael (doc 03 §6).
4. Antes de la Fase 3, capturar métricas baseline (doc 04 §6).
