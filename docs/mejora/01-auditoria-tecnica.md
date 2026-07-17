# 01 · Auditoría técnica

Estado del código a 16/07/2026 (rama `main`, commit `d0adc93`).

## 1. Fotografía del stack

- **Framework:** Astro 5 (build estático, sin adapter) + Svelte 5 (solo en el Constructor).
- **Datos:** Supabase (auth, tablas `user_profiles`, `children`, `child_words`,
  `child_artifacts`, `family_missions`…). Progreso en `localStorage` con sync a la nube.
- **Pagos:** Stripe instalado pero sin flujo real (la suscripción se activa sin pago
  en `subscription-service.ts` → `activatePlan`).
- **IA:** OpenAI instalado; `/api/chat` existe pero no funciona en producción (ver 2.1).
  El Nivel 1 del tramo 8-9 funciona a propósito **sin generación real** (bancos
  cerrados en JSON + moderación determinista local en `moderation.ts`).
- **Hosting:** Hostinger, estático.

### Mapa de módulos

| Zona | Ficheros clave | Estado |
|------|----------------|--------|
| Motor unidad-aventura (8-9) | `src/lib/unidad-engine.ts`, `src/lib/unidad-widgets/*` (14 widgets), `src/schemas/unidad.ts` | ✅ Bien estructurado, tipado con schema |
| Motor scenario/chat (10-11, 12-14) | `src/lib/game-engine.ts`, `src/schemas/scenario.ts` | ⚠️ Legacy: `any` por todas partes, DOM imperativo |
| Progreso y sync | `storage-simple.ts`, `sync-service.ts`, `progress-service.ts`, `unidad-service.ts` | ⚠️ Funciona, pero dos sistemas de datos en paralelo (ver 3.2) |
| Constructor | `src/features/constructor/*` (Svelte) | ✅ Autocontenido. ❌ Duplicado en `/constructor` raíz (ver 2.2) |
| Páginas | `src/pages/*` | ⚠️ Mucho CSS y JS inline por página, sin componentes compartidos |

## 2. Problemas críticos (bloquean o rompen)

### 2.1 Build estático con endpoints POST muertos — **la decisión pendiente nº 1**

`astro.config.mjs` no declara `output: 'server'` ni adapter ⇒ `astro build` genera
HTML estático. `src/pages/api/chat.ts` y `src/pages/api/checkout.ts` definen POST
que **no existen en producción** (en `dist/api/` solo queda el GET prerenderizado).
El propio código lo reconoce (`moderation.ts` líneas 13-17, `speech.ts` líneas 1-7).

Consecuencias en cadena: sin chat con IA real, sin moderación por modelo, sin
checkout de Stripe, sin webhooks. Todo el roadmap de producto choca aquí.

**Opciones (elegir una):**

| Opción | Coste | Notas |
|--------|-------|-------|
| A. Migrar hosting a algo con SSR (Vercel/Netlify/Cloudflare o VPS con `@astrojs/node`, que ya está en `package.json`) | Medio | La más limpia. Astro soporta `output: 'static'` + páginas `prerender = false` selectivas |
| B. Backend separado (Supabase Edge Functions) manteniendo Hostinger estático | Medio | Encaja bien: ya hay Supabase. Chat, moderación y webhook de Stripe como Edge Functions |
| C. Seguir 100 % estático y posponer IA real / pago real | Cero | Válido para la beta actual, pero hay que **borrar** los endpoints muertos y el código que los referencia para no confundir |

**Recomendación:** B (Edge Functions) — no cambia el hosting actual, resuelve chat +
moderación + Stripe webhook, y las claves secretas viven en Supabase, no en el build.

### 2.2 Carpeta `/constructor` duplicada en la raíz

Proyecto Svelte completo (con su `node_modules`, `package.json`, `build_log.txt`)
duplicando `src/features/constructor`. Está en `.gitignore` pero ocupa disco y genera
confusión sobre cuál es la fuente de verdad. **Acción:** confirmar que
`src/features/constructor` es la versión viva (lo es: `constructor.astro` importa de ahí)
y borrar la carpeta raíz.

### 2.3 Checkout legacy inconsistente con el modelo de negocio

`api/checkout.ts` crea un pago único de 4,99 € ("Kidia Premium: Reto Avanzado") —
es de la época pre-suscripción. El modelo real son 3 planes de suscripción familiar
(19/39/69 €, `subscription-service.ts`). Además no verifica sesión del usuario.
**Acción:** eliminarlo; reconstruir sobre Stripe Subscriptions cuando se resuelva 2.1.

### 2.4 Prompt del chat con identidad equivocada

`api/chat.ts` define «Eres Kidia, una niña de 12 años» — anterior al rebrand con
Dra. Vael/Morti y sin las reglas de seguridad infantil del método (no pedir datos
personales, etc.). Si el chat se reactiva, el system prompt debe reconstruirse desde
la documentación del método (existe un system prompt de Vael en los docx del producto).

## 3. Deuda técnica importante (no rompe, pero frena)

### 3.1 Motor legacy `game-engine.ts` sin tipos

`scenario: any`, `node.action_data?: any`, render imperativo con `innerHTML`.
Contrasta con `unidad-engine.ts` (tipado con `UnidadAventuraSchema`). Cuando se
haga la paridad de tramos (roadmap Fase 4), lo razonable es **extender el formato
unidad-aventura a 10-11 y 12-14** y jubilar este motor, no invertir en arreglarlo.

### 3.2 Progreso duplicado en dos sistemas

1. **Sistema viejo:** arrays `completed_scenarios`, `badges`, `scores` en la tabla
   `children`, espejo de `localStorage` (`storage-simple.ts` + `sync-service.ts`).
2. **Sistema nuevo:** `child_artifacts` (tabla) + columnas jsonb
   `children.vocabulary` y `children.family_missions_completed`, vía `unidad-service.ts`.

`unidad-engine.ts` escribe en **ambos** (comentario explícito en `renderComparte`).
Riesgos: divergencia entre fuentes, sync last-write-wins por hijo (el merge solo
ocurre en `onLogin`), y `localStorage` con clave global `kidia-progress` para
sesiones pre-hijo que nunca se migra. **Acción a medio plazo:** consolidar en el
sistema relacional y derivar los agregados (badges, %) de él; `localStorage` queda
como caché offline, no como fuente de verdad.

### 3.3 Sin herramientas de calidad

- No hay ESLint, Prettier, ni `astro check` en CI. No hay CI.
- No hay tests (los `scripts/test-*.js` son scripts manuales de diagnóstico).
- `tsconfig.json` mínimo; `strict` no verificado sobre los `.ts` de `lib/`.

**Acción propuesta (barata, gran retorno):** `astro check` + Prettier + un workflow
de GitHub Actions que haga `build + check` en cada push. Tests con Vitest solo para
la lógica pura (`tramos.ts`, `moderation.ts`, `rules.ts` del constructor, widgets).

### 3.4 Higiene del repo

- `REPORTE_MEJORAS.txt` (mayo 2026) y fichero vacío `Report` en la raíz → mover lo
  vigente a `docs/` y borrar. Varios puntos de ese reporte ya están resueltos
  (imágenes WebP, test-supabase eliminado); otros siguen vivos (Stripe dummy-key).
- `.env.example` contiene una URL y clave publishable **reales** de Supabase. Aunque
  la anon key es pública por diseño, un example debe llevar placeholders.
- `.astro/` (caché generada) aparece como modificada en git — añadir a `.gitignore`.
- `public/morti.webp` pesa 596 KB (10-20× el resto de personajes) — recomprimir.

### 3.5 Rendimiento y semántica

- CSS/JS inline duplicado por página (el mapa define su propio sistema de tooltips,
  el dashboard sus botones, etc.) — se resuelve con el sistema de diseño (doc 03).
- Fuente Outfit desde Google Fonts sin `font-display` controlado ni self-hosting;
  para una app infantil conviene self-host (privacidad + velocidad).
- `console.log` de depuración repartidos por todo el código de producción.
- Falta `initial-scale=1` en el meta viewport (`Layout.astro:22`).

## 4. Seguridad y privacidad (producto infantil — prioridad alta)

| Punto | Estado | Acción |
|-------|--------|--------|
| Moderación de texto libre del niño | ✅ Filtro determinista local (`moderation.ts`), suficiente para bancos cerrados | Al activar IA real, moverla a servidor (Edge Function) con modelo de moderación |
| Galería pública con revisión | ✅ Flujo "Vael la revisa" + `admin/moderacion.astro` | Verificar RLS: que un niño no pueda leer artefactos no aprobados de otros |
| RLS en Supabase | ❌ Auditada — hallazgo crítico | Ver [06-auditoria-rls.md](06-auditoria-rls.md): un usuario puede autoaprobar artefactos y saltarse la moderación de la galería |
| Claves | ✅ `.env.local` fuera de git; solo anon key en cliente | Placeholder en `.env.example`; secretos de OpenAI/Stripe solo en servidor |
| Datos personales de menores | ⚠️ Se guarda nombre y fecha de nacimiento del hijo | Revisar página de privacidad contra la realidad (RGPD, consentimiento parental); minimizar: ¿hace falta fecha exacta o vale mes/año? |
| `activatePlan` sin pago | ⚠️ Cualquier cuenta puede autoactivarse el plan | Aceptable en beta consciente; cerrar al conectar Stripe |

## 5. Priorización

**P0 (esta semana):** decisión 2.1 · borrar `/constructor` raíz y endpoints muertos
(2.2, 2.3) · placeholders en `.env.example` · `.astro/` a `.gitignore` · retirar
`REPORTE_MEJORAS.txt`.

**P1 (este mes):** CI con `astro check` + build · auditoría RLS · consolidar textos
legales/privacidad · recomprimir `morti.webp` · limpiar `console.log`.

**P2 (con el roadmap):** consolidación del progreso (3.2) · jubilar `game-engine.ts`
vía paridad de tramos (3.1) · tests de lógica pura.
