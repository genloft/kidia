# ESTADO — bitácora de trabajo del plan de mejora

> Este fichero es el "punto de guardado" entre sesiones de trabajo con Claude.
> Se actualiza al terminar cada bloque de trabajo. Si empiezas una sesión nueva:
> "lee docs/mejora/ESTADO.md y continúa".

## Estado actual

- **Fase activa:** Fase 3 — Gamificación (Fase 1 y 2 CERRADAS el 17/07;
  Fase 2 con la validación e2e completa, incluida por login real — ver
  checkboxes en [05-roadmap.md](05-roadmap.md))
- **Último update:** 19/07/2026 (**Fase 4: LOS 3 TRAMOS COMPLETOS —
  8-9 (16), 10-11 (16) y 12-14 (16) en formato unidad-aventura; Morti,
  4 insignias del docx 12-14, y bug de idea_para_ayudar arreglado**)
- **Modo de trabajo:** el usuario ha pedido seguir mejorando de forma
  autónoma sin pedir confirmación en cada paso — así que las siguientes
  entradas de esta bitácora son iniciativa de Claude, no encargos puntuales.
- **Git:** el trabajo acumulado de las fases 0-2 se commiteó el 17/07
  (`f6b9f08`, 80 ficheros) a petición del usuario. A partir de aquí,
  commits normales por bloque de trabajo.

## Hecho

- ✅ Fase 0 completa (16/07/2026) — detalle y checkboxes en el roadmap.
  Decisión de backend: seguir 100 % estático.
- ✅ Documentación completa en `docs/mejora/` (README + 6 docs).

### Bugs reportados por el usuario y arreglados (19/07/2026)

1. **"El constructor no funciona ahora."** Era el error de hidratación de
   Svelte en dev (`[astro-island] Cannot read properties of undefined
   (reading 'call')`). Causa raíz: `ConstructorApp.svelte` tenía un BOM
   (U+FEFF) al inicio que rompía el parser de vite-plugin-svelte en dev.
   Ya se le había quitado el BOM; verificado ahora que el constructor
   **monta y funciona** en el dev server (8 piezas, 26 slots, entrenar,
   modales) sin errores de consola. (En producción nunca falló.)
2. **"Saltos raros al responder; no sigue de forma continua, vuelve al
   principio, pasa en todos."** Bug real de scroll: al responder, tanto las
   pantallas (`renderScreen`) como los widgets de Investiga re-renderizan su
   contenido con `innerHTML = ''`. Si la pantalla anterior era más alta que
   el viewport (el niño hizo scroll para responder) y la nueva es más corta,
   el navegador **recortaba la posición de scroll de forma inconsistente**
   (medido: saltaba a 121, luego 261…) — de ahí los saltos. Arreglo en
   `unidad-engine.ts`: un `MutationObserver` sobre la etapa lleva la vista al
   inicio de la misión ante cualquier re-render de contenido (llamada directa,
   no en rAF, para no depender de que la pestaña componga frames). Verificado:
   ahora cada respuesta vuelve consistentemente a scrollY 73 (inicio de la
   misión, bajo el header sticky). Además, el auto-scroll del **mapa** solo se
   dispara si la tarjeta "te toca" queda fuera de pantalla (antes centraba en
   cada carga → tirón brusco). typecheck 0/0, build verde.

## Pendiente que depende del usuario (no de Claude)

- ~~🚨 Supabase caído (NXDOMAIN)~~ — **restaurado por el usuario el 17/07
  (tarde)**; verificado: auth responde y la e2e con familia.prueba funciona.
- ⚠️ **P0 de seguridad:** pegar el SQL del trigger anti-autoaprobación en el
  SQL Editor de Supabase — está listo en [06-auditoria-rls.md](06-auditoria-rls.md).
- ⚠️ **Nueva: policy DELETE de `child_artifacts`** — pegar
  `supabase/migrations/005_child_artifacts_delete.sql`. Sin ella el botón
  "Eliminar" del Cuaderno de Inventos (`/cuaderno`) falla limpio con un
  aviso, no borra nada de verdad — confirmado en pruebas el 17/07 (detalle
  en Fase 3 más abajo). También bloquea borrar el artefacto de prueba que
  quedó en el Cuaderno de Leo (familia.prueba) — inofensivo, `pending`.
- ⚠️ **Nueva: ledger de chispas** — pegar
  `supabase/migrations/006_child_events.sql`. Sin ella el sistema de
  chispas ⚡ degrada a "invisible" (0 chispas, sin pill, sin caja en el
  cierre) — nada se rompe, pero la gamificación no luce. Tras pegarla,
  jugar una misión con familia.prueba debería mostrar "+N chispas" en el
  cierre y la pill ⚡ en el header.
- ~~⚠️ Migración del PIN familiar~~ — **pegada por el usuario el 17/07
  (tarde)**; e2e del PIN completa y verde (ver Fase 2).
- Commit del trabajo acumulado cuando el usuario lo pida.

## Fase 1 — progreso

- [x] `src/styles/tokens.css` con tokens semánticos (sin cambio visual).
      Nomenclatura `--k-*` para no colisionar con constructor.css; alias legacy
      (`--color-primary`…) mantenidos hasta migrar todas las páginas. Verificado
      en dev: alias resuelven a los valores idénticos de antes, 0 errores de
      consola, build verde. *(16/07/2026)*
- [x] `global.css` consume tokens + `prefers-reduced-motion` global + foco
      visible (`:focus-visible` con `--k-border-focus`). *(16/07/2026)*
- [x] Self-host de la fuente Outfit vía `@fontsource/outfit` (400/600/800; el 300
      eliminado). Sin peticiones a Google en dist. También: viewport con
      `initial-scale=1` en Layout. *(16/07/2026)*
- [x] Componentes Button, Card, Pill: estilos como clases globales `.k-*` en
      `src/styles/components.css` (usables desde DOM generado por JS) + wrappers
      en `src/components/ui/*.astro`. *(16/07/2026)*
- [x] Componentes ProgressBar, ProgressSteps, Modal (sobre `<dialog>` nativo),
      VaelBubble (con lectura en voz alta vía `speech.ts`), EmptyState y Toast
      (`src/lib/toast.ts`, función JS porque quien lo lanza es siempre JS; con
      `aria-live`). Todos verificados funcionando en `/dev/ui` y sin errores de
      tipos. Los wrappers propagan `...rest` (data-*, aria-*). *(16/07/2026)*
- [x] Página `/dev/ui` con la biblioteca — SOLO en `astro dev` (ruta inyectada
      desde `astro.config.mjs`, fichero en `src/dev/ui.astro`). Verificado: no
      existe en dist. *(16/07/2026)*
- [x] Migrar Header a tokens: 0 colores literales restantes (los grises
      casi-duplicados #f8fafc/#e2e8f0/#cbd5e1 unificados en tokens de texto;
      verificado render idéntico en dev). Los rgba-tint de marca con alpha
      (p. ej. rgba(34,211,238,.08)) se quedan — no tienen equivalente semántico.
      *(16/07/2026)*
- [x] **Mapa v2 "mapa de zonas"** (decisión del usuario: adelantar el rediseño de
      Fase 2 en vez de pulir el carrusel). `mapa.astro` reescrito: vertical y
      touch-first, 4 zonas del método como secciones con camino y nodos, estados
      claros (✅ Completada / ⭐ ¡Te toca! / 📝 Termina el test / 🔒), contador
      por zona, scroll automático a "te toca", paneles por tramo (8-9 completo;
      10-11 y 12-14 con sus 4 retos legacy como "Nivel 1"). Eliminados: drag de
      ratón, tilt 3D, tooltips-hover y el toggle "Modo Profundo" (muerto — nada
      consumía su clase; el concepto vuelve en Fase 3 como "Reto extra de Vael").
      `ScenarioMapCard.astro` borrado (huérfano). mapa.astro pasa de 49 errores
      de tipos a 0 (total legacy: 186 → 137). Verificado: estructura SSR (28
      tarjetas, zonas con nombres reales), estados y color-mix por computed
      styles, móvil 375px sin overflow horizontal. PENDIENTE: prueba end-to-end
      con login real (cuenta familia.prueba) — el guard de login impide a Claude
      verificar la hidratación completa. *(16/07/2026)*
- [x] **Laboratorio migrado al sistema.** Los 32 botones que generan
      `unidad-engine.ts` + los 14 widgets por JS pasan de `btn btn-primary/
      secondary` (`.btn-primary` ni existía) a `k-btn k-btn--*` con tamaño
      lg/xl (≥48px táctil; el continuar principal es xl=58px). Estilos de
      `UnidadAventura.astro` y `laboratorio/especial/[id].astro` tokenizados:
      0 literales de color. Verificado montando el motor real en el navegador
      (portada → misión) sobre los estilos reales de la página. Decisión: se
      mantienen los 7 puntos-con-etiqueta (`ua-progress`) en vez de `.k-steps`
      — mejor UX que segmentos anónimos; se extraerá a componente compartido
      cuando haya un segundo consumidor. VaelBubble no se usa aquí de momento
      (la cabecera ya tiene el avatar de Vael; evitaría duplicar personaje).
      *(16/07/2026)*
- [x] Migrar páginas restantes: dashboard (reescrito como selector de
      perfiles, tokens desde el inicio), perfil y login — verificado 17/07:
      0 alias legacy `--color-*` en los tres; solo quedan rgba-tints de marca
      con alpha, que se quedan por criterio (sin equivalente semántico).
      (Layout.astro: solo blobs decorativos del fondo, intencionales.)
      NOTA: los alias legacy de tokens.css aún no se pueden borrar — los
      consumen las páginas de marketing y componentes sin migrar (index,
      blog, Quiz, Footer…); eso ya es tarea de barrido posterior, no de
      Fase 1. *(17/07/2026)*
- [x] Glosario aplicado (Misión/Zona/Cuaderno/Insignia) en páginas migradas.
      Barrido 17/07: quedaban "reto" visible en insignias.astro y 2 en
      parents.astro → "misión". Lo que queda de "reto/escenario" son
      identificadores de código y las páginas legacy sin migrar
      (scenario/[slug], tramos 10-11/12-14 — Fase 4). *(17/07/2026)*

**FASE 1 CERRADA (17/07/2026).**

## Fase 2 — progreso

- [x] Onboarding wizard `/bienvenida` (3 pasos → misión 1.1). Bug pillado en
      verificación: `[data-step]` matcheaba también los puntos de
      ProgressSteps — selector corregido a `section[data-step]`. *(17/07/2026)*
- [x] Selector de perfiles (dashboard.astro reescrito): elegir hijo → /mapa;
      1 hijo → salta; 0 hijos → /bienvenida. *(17/07/2026)*
- [x] Retomar misión a medias: unidad-engine persiste pantalla +
      investigaResultado + artifactId en localStorage por hijo+unidad (clave
      `kidia-unidad-resume-*`, transitorio, sin sync a nube). La portada ofrece
      "Seguir donde lo dejé →" / "Empezar desde el principio". Verificado
      funcionalmente en navegador (guardar en palabras → remontar → retomar →
      cae en palabras; reiniciar limpia). *(17/07/2026)*
- [x] Patrón de error amable — primer uso: si falla el guardado de la creación
      (saveArtifact), toast danger con voz de Vael y el niño se queda en Crea
      para reintentar (antes avanzaba a ciegas y se perdía la creación).
      Extender el patrón al resto de servicios cuando toque cada pantalla.
      *(17/07/2026)*
- [x] **Modo Aventura / Modo Familia** (doc 02 §1) — implementado 17/07/2026.
      Decisión del usuario (preguntado explícitamente): gate por **PIN de 4
      dígitos configurable** (frente a operación matemática/pulsación larga).
      Piezas:
      - `Header.astro` con prop `mode`: `aventura` (logo→/mapa, nav 🗺️🏅🤖,
        badge de hijo, botón "Familia 🔒"; sin nav de adulto ni menú de email;
        en ≤768px la nav del niño sobrevive como emojis táctiles), `familia`
        (Panel Familiar · Mi Cuenta · Metodología · Blog + botón "Modo
        Aventura 🚀" que además echa el candado) y `publico` (como antes).
        Modo asignado en las 22 páginas.
      - `src/lib/familia-gate.ts`: PIN con hash SHA-256 (salt=user id) en
        `user_profiles.parent_pin_hash` (migración 004, pendiente de pegar),
        desbloqueo en sessionStorage con TTL 15 min, modal sobre `<dialog>`
        (k-modal) y `requireFamiliaAccess()` para páginas de adulto. Degrada
        a "sin gate" si la columna no existe. Honesto por diseño: barrera de
        despiste, no seguridad (el niño usa la sesión del padre).
      - `parents.astro` reconstruido como **home del Modo Familia**: tarjetas
        de progreso de TODOS los hijos con datos de nube (misiones, insignias,
        palabras, misiones en familia + informe por reglas — nuevo
        `ProgressService.computeParentReportFrom()` puro), gestión de hijos
        absorbida de perfil#hijos, sección de PIN, y "Jugar como X →" que
        activa al hijo y echa el candado. Contenido oculto (`familia-locked`)
        hasta pasar el gate.
      - `perfil.astro` = solo "Mi Cuenta" (correo/contraseña/tutor), también
        tras el gate; arreglado su `</body></html>` huérfano.
      Verificación en dos tandas. Sin backend (17/07 mañana): SSR de los 3
      modos, modal del gate, estilos computados, 375px sin overflow y
      rótulos→emojis, typecheck 137→136 errores (0 en lo tocado). Con Supabase
      restaurado (17/07 tarde), e2e real con familia.prueba: login → selector
      (Leo/Marta/Hugo con tramos) → mapa como Leo (header aventura + badge) →
      Familia 🔒 sin PIN entra directo → Panel Familiar con datos reales de
      nube (Leo: 4 palabras) → "Jugar como Marta" activa a Marta y vuelve al
      mapa. **Bug cazado en la e2e:** Astro se come el `\` de `pattern="\d{4}"`
      (quedaba `d{4}`, que nunca valida) → el form del PIN no enviaba nunca;
      corregido a `[0-9]{4}` en parents.astro y familia-gate.ts, reverificado
      (con la columna ausente sale el toast "Falta aplicar la migración 004").
      Con la migración 004 pegada (17/07 tarde), e2e del PIN completa y verde:
      guardar PIN → "PIN activo" + botón Cambiar/Quitar → "Modo Aventura 🚀"
      echa el candado → "Familia 🔒" muestra el gate con el panel oculto
      detrás → PIN erróneo rechaza (error visible, modal sigue) → PIN correcto
      entra y carga los 3 hijos → /perfil también protegido (y sin gate
      mientras dura el desbloqueo de 15 min) → cancelar redirige a /mapa →
      "Quitar PIN" funciona. La cuenta familia.prueba queda SIN PIN a
      propósito para no bloquear pruebas manuales.
- [x] Mapa: valorado avatar-en-mapa (resto del rediseño ya hecho en Fase 1) —
      se traslada a Fase 3 (doc 04 §3.2, junto con el mapa como territorio
      real); no aporta por sí solo sin el resto de esa mecánica.

**FASE 2 CERRADA (17/07/2026, tras la e2e por login real con familia.prueba).**

## Fase 3 — progreso (doc 04, gamificación)

- [x] **Insignias v2** (doc 04 §3.5): dos bugs/huecos corregidos.
      1. **Bug real:** `BadgeGrid.astro` (usado por `insignias.astro`) solo
         leía el catálogo legacy (`loadScenarios`, tramos 10-11/12-14, 4
         unidades). Los 3 badges reales del tramo 8-9 — el tramo insignia,
         con las 16 unidades ya construidas — se ganaban y persistían
         correctamente (`unidad-engine.ts` → mismo array `children.badges`)
         pero **nunca aparecían** en la Colección de Insignias. Corregido
         fusionando ambos catálogos (`loadScenarios` + `loadUnidadesAventura`)
         en un tipo común `BadgeCatalogEntry`.
      2. **Hueco de UX** (doc 02 §2.6): las insignias no ganadas mostraban un
         "❓" opaco tapando toda la tarjeta, sin decir cómo conseguirlas.
         Ahora el icono queda apagado (grayscale) y aparece el texto de pista
         en vez de la descripción: para legacy, "Completa el reto ‹título›"
         o, si depende de otra insignia (`required_badge_id`), "Antes
         consigue la insignia ‹nombre›"; para unidad-aventura, "Completa las
         N misiones de la ‹Zona X›" (calculado contando unidades por zona,
         no hardcodeado).
      Verificado en navegador con Leo (familia.prueba, tramo 8-9): las 3
      tarjetas de sus badges reales aparecen con la pista correcta; toggle a
      `.earned` intercambia descripción real/pista y oculta el candado;
      cadena `required_badge_id` de un legacy (10-11) resuelta a texto;
      375px sin overflow; typecheck sin errores nuevos (136, igual que antes).
      **Nota de contenido (no de código):** la Zona Creación (unidad 3.4) no
      tiene `insigniaPosible` en su JSON — hueco real del contenido del
      método, no algo que Claude deba inventar; queda para cuando se revise
      el docx de la Zona Creación. *(17/07/2026)*
- [x] **Diccionario de Palabras Poderosas** (doc 04 §3.5): `children.vocabulary`
      se coleccionaba desde cada unidad-aventura pero no tenía ninguna
      pantalla — hueco motivacional real, el niño acumulaba algo que nunca
      volvía a ver. Nueva página `/palabras`, enlazada con 📖 en el nav del
      Modo Aventura (entre Insignias y Constructor). Catálogo construido
      cruzando `loadUnidadesAventura('8-9')` (única fuente hoy) con
      `UnidadService.getVocabulario()` (nuevo método). Cartas agrupadas por
      zona (mismos tokens `--k-zona-N` que el mapa); coleccionadas muestran
      icono/palabra/definición y al tocarlas la leen en voz alta (reusa
      `speech.ts`); las que faltan quedan como silueta "¿?".
      **Cuidado de diseño explícito:** la primera versión renderizaba la
      palabra y definición reales de TODAS las tarjetas en el HTML servido
      (solo ocultas por CSS) — cualquiera con "ver código fuente" habría
      visto las respuestas antes de ganarlas, reventando el efecto sorpresa.
      Corregido: el servidor no imprime contenido real de las bloqueadas;
      viaja en un `<script type="application/json">` y solo se pinta por JS
      para las palabras ya coleccionadas (verificado con curl sobre el HTML
      crudo: 0 fugas en los 53 spans bloqueados de Leo).
      Verificado en navegador: Leo (8-9) ve sus 4 palabras reales + 53
      siluetas, tocar una coleccionada dispara la voz correcta; Marta
      (10-11, sin contenido en este formato) ve el aviso "todavía solo
      existen para el tramo 8-9" en vez de una cuadrícula vacía; 375px sin
      overflow; typecheck 0 errores/0 warnings nuevos (136 total, igual).
      Pendiente de la lista de doc 04 (no de esta pieza): Cuaderno de
      Inventos navegable (galería personal de `child_artifacts`). *(17/07/2026)*
- [x] **Cuaderno de Inventos navegable** (doc 04 §3.5): `UnidadService.getCuaderno`
      ya existía pero solo se usaba internamente para resolver dependencias
      entre unidades (`dependeDe`) — nunca se enseñaba al niño/a. Nueva
      página `/cuaderno` (🧪 en el nav, 5º icono ya sin overflow en 375px),
      creaciones en orden cronológico (más reciente primero) con: título
      dado por el niño/a, zona/unidad de origen, fecha, estado de moderación
      (solo si la unidad publica en galería) y un resumen legible de lo
      investigado — reutilizando `RESUMEN_LABELS`/`formatearValor`, que
      vivían privados dentro de `unidad-engine.ts` y se movieron a
      `unidad-widgets/shared.ts` para no duplicar el diccionario de
      etiquetas entre el motor y esta página.
      **Hallazgo en el camino (confirmado, no solo de auditoría):** al
      probar el flujo end-to-end guardé un artefacto de prueba y luego
      intenté borrarlo — Supabase devolvió éxito sin error pero 0 filas
      afectadas. Es el hallazgo menor #3 de
      [06-auditoria-rls.md](06-auditoria-rls.md) (falta policy DELETE en
      `child_artifacts`), ahora confirmado en la práctica, no solo por
      lectura del SQL. Añadido `supabase/migrations/005_child_artifacts_delete.sql`
      con la policy, `UnidadService.deleteArtifact()` (detecta el caso de
      0 filas y devuelve un error explicativo en vez de fingir éxito) y un
      botón "Eliminar" por tarjeta en `/cuaderno` con confirmación.
      Verificado en navegador: tarjeta se renderiza con datos reales
      (probado guardando y luego borrando un artefacto de prueba en Leo);
      sin la migración pegada, el botón Eliminar falla limpio con el toast
      "falta la policy de permisos" y NO borra la tarjeta de la vista (nada
      de éxito falso); con Marta (10-11, sin `unidad_info` en su tramo) no
      se probó por no aplicar — el Cuaderno no depende de tramo, solo de si
      el hijo/a tiene artefactos. typecheck 0 errores/warnings nuevos.
      *(17/07/2026, cuenta familia.prueba queda limpia: el artefacto de
      prueba no pudo borrarse por el propio hueco de RLS que este bloque
      documenta — queda como "Mi Detector Supremo" en el Cuaderno de Leo,
      estado `pending`, inofensivo, hasta que se pegue la migración 005 y
      alguien lo borre desde la UI.)*
- [x] **Ledger `child_events` + chispas ⚡ + Niveles de Inventor/a** (doc 04
      §3.1 — "el esqueleto" de la gamificación).
      - **Migración 006** (`supabase/migrations/006_child_events.sql`,
        pendiente de pegar): tabla append-only (SELECT/INSERT por parentesco,
        sin UPDATE/DELETE — nadie reescribe el pasado; FK cascade para RGPD)
        con índice único `(child_id, tipo, ref_id)`: repetir una misión NO
        vuelve a dar chispas — la idempotencia vive en el servidor, no en
        el cliente, imposible de farmear.
      - **`src/lib/chispas-service.ts`**: `logEvent` (upsert con
        ignoreDuplicates; devuelve las chispas realmente otorgadas — el
        `.select()` tras el upsert viene vacío si el hecho ya existía, así
        el "+N chispas" nunca miente en un replay), `getTotalChispas` (suma
        del ledger, nunca agregado guardado), `nivelInventor` con 5 niveles
        (Aprendiz 🌱 0 → Explorador/a 🔭 40 → Inventor/a 💡 120 → Maestro/a
        de Laboratorio 🧪 250 → Leyenda 🌟 400; umbrales calibrados a la
        economía real: una unidad completa ≈ 35-40 chispas, las 16 ≈ 500).
        Valores: misión 10, familia 20 (lo más premiado a propósito, doc 04),
        palabra 1 (una fila por unidad, no por palabra), publicación 5,
        insignia 15. Degradación si falta la migración: mismo patrón que el
        PIN — todo funciona, chispas a 0, un solo aviso en consola.
      - **Hooks en `unidad-engine.ts`**: coleccionar palabras, misión en
        familia, publicar en galería, insignia y misión completada. El
        acumulador `chispasGanadas` NO se persiste en el resume state a
        propósito (el ledger es la fuente de verdad).
      - **UI**: caja "⚡ +N chispas" en el cierre de la unidad (solo si se
        otorgó algo de verdad; en replay o sin migración no aparece — nada
        de celebrar recompensas falsas) + total y nivel con "a N de
        ‹siguiente›"; pill "⚡ total" en el header del Modo Aventura junto
        al nombre del hijo/a (oculta si 0).
      Verificado en navegador (sin la tabla, que es el estado actual):
      degradación limpia — `logEvent` otorga 0, pill oculta, UN solo warn
      con llamadas concurrentes, `nivelInventor` correcto en los 3 casos
      límite (0/50/500), y la misión 1.1 real avanza portada→misión→
      palabras→investiga sin errores de consola con el hook activo.
      Build de producción verde. **El happy path con tabla (chispas
      otorgadas de verdad, pill visible, +N en el cierre) queda pendiente
      de pegar la migración 006 — mismo ciclo que se siguió con el PIN.**
      *(17/07/2026)*
- [x] **Sistema de celebración unificado** (doc 04 §5): `src/lib/celebration.ts`
      con las 3 intensidades del doc — micro (pop + 3 partículas sobre el
      elemento; enganchada en `showFeedback` de los widgets, solo en
      aciertos), media (ráfaga de 14 partículas + chip de mensaje; al
      completar misión en el cierre) y grande (40 confetis cayendo +
      mensaje destacado; al ganar insignia o cruzar un umbral de nivel de
      inventor/a — se calcula comparando `nivelInventor(total)` con
      `nivelInventor(total - chispasGanadas)`). El overlay es
      `aria-hidden` (decorativo) pero el chip de mensaje es `role="status"`
      para que los lectores de pantalla lo anuncien.
      `prefers-reduced-motion`: versión estática con el MISMO contenido —
      el mensaje se muestra igual y no se generan partículas (además del
      kill-switch global de global.css, que solo acortaría la animación
      pero dejaría los nodos). La insignia solo se celebra en grande si
      este cierre otorgó chispas (señal de primera vez, no replay).
      Verificado en navegador las 4 rutas: grande (40 confetis + chip,
      autolimpieza del DOM a los 3s), media (14 + chip), micro (3
      partículas sobre el elemento), y reduced-motion simulado (0
      partículas, mensaje visible). Typecheck y build verdes. *(17/07/2026)*
- [x] **Racha amable de laboratorio** (doc 04 §3.3), montada sobre el mismo
      ledger: evento `actividad_diaria` con `ref_id = fecha local`
      (YYYY-MM-DD del dispositivo del niño, no UTC) y 0 chispas — el índice
      único lo hace idempotente por día, así que "una fila por día de
      actividad" sale gratis. Se registra al entrar a cualquier página del
      Modo Aventura (doc: "cualquier cosa cuenta" — la racha premia volver,
      no rendir). `calcularRacha()` es una función PURA exportada (separada
      de la query a propósito, para poder probarla con fechas sintéticas):
      cuenta días con actividad hacia atrás permitiendo huecos de hasta 3
      días ("racha protegida"); >3 días sin entrar la rompe a 0. Pill "🔥 N"
      en el header aventura solo desde 2 días (un "🔥 1" en la primera
      visita es ruido) y jamás un mensaje en negativo. La congelación
      semanal de Vael (doc 04) queda como refinamiento cuando haya UI de
      Vael reactiva. Verificado: 10 casos sintéticos de `calcularRacha`
      todos correctos (vacía/1 día/consecutiva/huecos de 3 exactos
      sobreviven/huecos de 4+ rompen/última hace 4 días → 0/fechas
      desordenadas/basura filtrada); degradación sin migración 006 → racha
      0 y pill oculta sin errores. Typecheck y build verdes. *(17/07/2026)*
- [x] **Avatar personalizable v1** (doc 04 §3.4, la "v1 pequeña" del
      roadmap): catálogo de 8 avatares emoji en `src/lib/avatares.ts` — 2
      libres (🦊 🐙) y 6 desbloqueados por Nivel de Inventor/a (🦉🚀 a
      Explorador/a, 🤖🐲 a Inventor/a, 🧪 a Maestro/a, 🌟 a Leyenda).
      **Decisión v1 explícita:** desbloqueo por nivel en vez de "gastar"
      chispas — el ledger es append-only y una economía de débito
      necesitaría eventos negativos o columna de saldo; el avatar ya da el
      80 % del valor (motivo visible para subir de nivel) sin comprometer
      el diseño del ledger. El gasto real + laboratorio decorable = v2
      (añadida al roadmap como pendiente).
      UI: sección "Tu avatar" en `/cuaderno` (radiogroup accesible;
      bloqueados muestran 🔒 + nivel necesario, disabled real). Persistencia
      en `children.avatar` — columna que YA existía y que el selector de
      perfiles ya leía con fallback a la inicial: cero migración.
      `ChildrenService.updateChild` ampliado para aceptar `avatar`. Elegir
      dispara celebración media y notifica al header (active-child:changed).
      Verificado en navegador con Leo (0 chispas): 8 tarjetas, solo las 2
      libres clicables, elegir 🦊 → guardado real en Supabase + marca de
      seleccionado + "🦊 ¡Avatar nuevo!", y el selector de perfiles muestra
      el zorro para Leo (Marta/Hugo siguen con inicial). Typecheck y build
      verdes. NOTA: Leo queda con el avatar 🦊 puesto — cambio legítimo de
      producto, reversible desde la propia UI. *(17/07/2026)*
- [x] **Barrido de deuda typecheck: 136 → 0 errores, 0 warnings** (18/07,
      madrugada). El objetivo de calidad de Fase 1 ("ningún error nuevo")
      pasa a "cero errores en absoluto": Quiz.astro (52), Growth (32),
      TokenProcess/GazapoDetector/Probabilities, caminos, insignias,
      scenario/[slug], ChatBox, parent-rules (reglas ahora tipadas con
      `ParentReportState`), sync-service (catch unknown), game-engine y
      constructor. Sin cambios de comportamiento salvo dos mejoras
      deliberadas de paso:
      1. **Paridad de gamificación en tramos 10-11/12-14**: el quiz legacy
         (su cierre de misión) no otorgaba chispas — ahora al aprobar
         (≥ 70) registra `mision_completada` y, con insignia,
         `insignia_ganada` en el mismo ledger (idempotente: repetir el quiz
         no re-otorga).
      2. `ConstructorApp.svelte`: eliminada la prop `data` declarada y
         nunca usada (causaba el último error de tipos).
      **Hallazgo investigado a fondo (18/07):** el Constructor no montaba
      en el navegador — `[astro-island] Error hydrating
      ConstructorApp.svelte: Cannot read properties of undefined (reading
      'call')`. Diagnóstico por descarte: (1) no lo causó el barrido —
      reproducido restaurando el fichero original; (2) no son los alias
      `$lib/*` — todos los módulos resuelven (Astro lee los paths de
      tsconfig); (3) no era el BOM U+FEFF que tenía ConstructorApp.svelte
      (único .svelte con BOM; eliminado igualmente, es higiene); (4) no hay
      svelte duplicado (npm ls: una sola copia 5.55.5 dedupeada).
      **Resolución del diagnóstico: SOLO ocurre en `astro dev`.** En el
      build de producción (astro preview, login real + Leo activo) el
      Constructor monta y funciona completo: filtros de piezas, slots por
      categoría, objetivos de etapa, métricas y el mentor. Es decir:
      producción NO está rota; es fricción de desarrollo por el desajuste
      vite-plugin-svelte 5.1.1 (fijado por @astrojs/svelte 7.2.5) con
      svelte flotado a 5.55.5.
      **Experimento de arreglo (18/07, revertido):** se probó forzar
      vite-plugin-svelte 6.2.4 vía npm overrides. Resultado: el dev server
      SÍ quedó arreglado (el Constructor montó en `astro dev`, confirmado
      en navegador)… pero el build de producción ROMPE — el módulo virtual
      `astro-entry:*.svelte` que @astrojs/svelte 7 genera para `client:only`
      no pasa el parser del plugin 6 (js_parse_error). Trade-off
      inaceptable → revertido a estado original (build verde, dev-constructor
      con la fricción conocida). **El arreglo real es subir a Astro 6 +
      @astrojs/svelte 8** (la 7.2.5 es la última compatible con Astro 5) —
      upgrade mayor, para hacer con el usuario delante. Mientras, para
      trabajar en el Constructor en local: `npm run build && npm run
      preview`. *(18/07/2026)*
      Smoke test tras el barrido: insignias (stats "0 / 3" + rango),
      caminos, mapa como Marta → scenario legacy u1-1-10-11 (GameEngine
      renderiza, indicador de pasos con "chispa" activo, consola limpia).
      Typecheck 0/0 y build verdes. *(18/07/2026)*

## Fase 4 — progreso (paridad de tramos)

- [x] **Piloto de migración 10-11: unidad 1.1 "El mapa de la IA en mi día"**
      *(18/07/2026, madrugada — trabajo autónomo con mandato explícito del
      usuario de continuar todo el plan sin su actuación).*
      Primera unidad del tramo 10-11 en formato unidad-aventura, producida
      **fielmente desde la ficha real** de `Kidia_Programa_Retos_10-11.docx`
      (leído del disco): chispa, banco de momentos del día (5 con IA + la
      trampa del docx "abrir la puerta con llave", sin IA), pasos del bloque
      «Lo que ve el niño», preguntas socráticas, misión en familia "Tres IA
      en la cena" y cierre de Vael — TODO textual del docx, nada inventado.
      Decisiones de fidelidad: **sin Palabras Poderosas** (el programa 10-11
      no las define) y **sin insignia** (el docx da 4 insignias POR NIVEL —
      Cazaerrores N2/Detective de datos/Creador de personajes/Constructor
      10-11 — no una por reto).
      Infraestructura del pipeline (sirve para las 15 restantes y para
      12-14): loader por tramo (`unidades-<tramo>/`, ids repetidos entre
      tramos se resuelven por tramo), `ZonaNombre` ampliado con los nombres
      de nivel del método, el motor salta la pantalla Palabras si la unidad
      no trae (barra de 6 pasos en vez de 7, SSR y evento alineados), ruta
      `/laboratorio/10-11/[id]`, y el mapa hace **migración incremental**:
      la tarjeta legacy de una unidad migrada se sustituye por la nueva, y
      el gate del siguiente reto legacy acepta la unidad migrada completada
      como llave (`data-req-unidad`) además de la insignia vieja.
      **Verificado jugándola entera con Marta (10-11)**: mapa muestra 1.1
      nueva "⭐ Te toca" → misión → investiga (6 momentos, pistas del docx,
      regla formulada con moderación) → crea (guardado real en Supabase) →
      detective → familia → publica → cierre con el texto del docx; al
      volver, mapa marca "✅ Completada" y **la 1.2 legacy se desbloquea**
      por la llave nueva. 0 errores de consola; typecheck 0/0; build verde
      con `/laboratorio/10-11/1.1` en dist.
      **Hallazgo de contenido (decidir con el usuario):** las insignias
      por-reto del legacy 10-11 (agente-secreto-ia, reparador-ia,
      chef-prompts, cazaerrores-2) NO salen del docx — el método define solo
      4 por nivel. Al migrar 1.4/2.2/3.1/4.x conviene decidir si se adoptan
      las 4 del docx y qué pasa con las viejas ya ganadas.
      **Datos de prueba generados en la e2e** (cuenta familia.prueba,
      Marta): completedScenarios "1.1", artefacto "Mi mapa del día con IA"
      (pending; imborrable hasta pegar la migración 005) y una misión en
      familia registrada.
- [x] **Nivel 1 de 10-11 COMPLETO (unidades 1.2, 1.3 y 1.4)** *(18/07/2026,
      mismo mandato autónomo)*. Las tres restantes del nivel, desde sus
      fichas del docx:
      - **1.2 "Entrena (y rompe) la máquina"** — `entrenar_clasificador`
        con el ejemplo LITERAL del docx (perros marrones → falla con el
        perro blanco → arreglo con banco variado). Jugada e2e completa.
      - **1.3 "La receta del buen prompt"** — `afinar_prompt_detalles` con
        el ejemplo del docx («un cartel» → divertido/colores alegres/feria
        de ciencias/mi clase). Verificado el montaje del widget con su
        banco; pendiente de e2e completa (misma plantilla que las demás).
      - **1.4 "Caza el error: nivel sutil"** — `detectar_invencion` con
        4 datos verdaderos + 2 errores sutiles "que suenan a verdad".
        **Única producción editorial no literal del docx**: el docx dice
        "errores prediseñados sobre temas neutros" sin darlos — se
        produjeron con mitos clásicos verificables (la Gran Muralla desde
        la Luna; los murciélagos ciegos) y hechos escolares seguros.
        REVISAR por el usuario si quiere otros temas. Trae la **primera
        insignia real del docx**: «Cazaerrores Nivel 2» 🔎, reutilizando el
        id legacy `cazaerrores-2` (quien la tuviera del quiz viejo la
        conserva; sin duplicados en el catálogo). Jugada e2e: 6/6 frases,
        insignia otorgada de verdad en `children.badges` de Marta.
      Además:
      - **Catálogo de insignias**: BadgeGrid incluye las unidades-aventura
        de 10-11 (con dedupe por id — la entrada migrada pisa a la legacy) y
        **oculta las insignias huérfanas** (las por-reto del legacy cuyo
        reto migró y que el docx no contempla: agente-secreto-ia,
        reparador-ia, chef-prompts) SALVO a quien ya las tenga ganadas — no
        se muestra nada imposible y no se quita nada ganado. Marta ve ahora
        "1 / 1" (la suya). Cuando se migren los niveles 2-4 llegarán las
        otras 3 insignias del docx.
      - **Fix de celebración**: la insignia se celebra en grande usando
        "no la tenía antes" (storage.hasBadge) como señal de primera vez,
        en vez de depender del ledger de chispas (que aún no está migrado).
      Verificado: mapa 10-11 100 % formato nuevo (1.1 ✅, 1.2 jugada, 1.3 🚀,
      1.4 ✅ con insignia), typecheck 0/0, build verde con las 4 rutas en
      dist. Datos de prueba de Marta ampliados: 1.1/1.2/1.4 completadas,
      insignia cazaerrores-2, 3 artefactos pending y 3 misiones en familia.
- [x] **Nivel 2 de 10-11 COMPLETO (2.1-2.4) — 8 de 16 unidades** *(18/07/2026,
      mandato autónomo)*. Desde las fichas del docx:
      - **2.1 "Cirujano de prompts"** — `afinar_prompt_detalles`; las
        restricciones «solo 3 ideas»/«en lenguaje fácil» son literales del
        docx; misión familiar «pon la mesa con detalles» literal.
      - **2.2 "El detective de datos"** — **WIDGET NUEVO
        `dos_respuestas_verifica`** (el único del nivel que lo necesitaba):
        dos respuestas contradictorias → registra la corazonada → fuente
        segura → veredicto; el resumen guarda "¿Cambiaste al comprobar?",
        que es LA señal del docx («razonamiento, no intuición»). Veredicto
        equivocado → reintento con la fuente, no avanza. Trae la **segunda
        insignia real del docx**: «Detective de datos» 🕵️. Caso editorial
        producido (el docx no lo da): patas de araña 8 vs 6, con 3 fuentes
        seguras — REVISAR si se quiere otro caso.
      - **2.3 "El jurado experto"** — `comparar_versiones`; criterio
        explícito del docx (¿cumple? ¿claro? ¿original?); encargo editorial
        (cartel del club de lectura) — REVISAR.
      - **2.4 "La IA inventa (y otros límites)"** — `decision_consecuencia`
        con las 4 tarjetas LITERALES del docx (2+2 / libro raro / partido
        de anoche / tu dirección) y las 3 categorías del juego del docx.
        La «tarjeta-insignia Conozco los límites de la IA» se modeló como
        producto del Cuaderno, NO como insignia formal (la sección oficial
        de insignias del docx lista solo 4 y esta no está — decidir con el
        usuario si debe ser la 5ª).
      - **Mapa generalizado**: los paneles 10-11/12-14 ahora agrupan por
        nivel (secciones de zona con el nombre real del método) y mezclan
        unidades migradas con retos legacy pendientes — antes solo se
        sustituían tarjetas legacy existentes y las unidades sin legacy
        (2.x) no habrían aparecido.
      Verificado e2e con Marta: mapa con 2 zonas ("Entender" 3/4, "Usar
      bien" 0/4); 2.2 jugada entera INCLUYENDO el camino del error
      (corazonada B incorrecta → fuente → veredicto B rechazado con
      reintento → veredicto A acertado → resumen con el cambio registrado
      → insignia otorgada en children.badges + celebración grande con
      confeti); 2.4 montada con sus 3 categorías; 2.1/2.3 responden 200.
      Typecheck 0/0, build verde (8 rutas). Marta acumula ya 2 de las 4
      insignias reales del docx (cazaerrores-2, detective-datos).
- [x] **Nivel 3 de 10-11 COMPLETO (3.1-3.4) — 12 de 16** *(18/07/2026,
      mandato autónomo)*. Desde las fichas del docx:
      - **3.1 "Diseña tu personaje"** — `construir_prompt_imagen` con
        categorías Aspecto/Personalidad/Habilidad (la estructura de ficha
        del docx) + detalle libre + iteración v1→v2 dirigida
        (comparaCambiandoUna). Trae la **tercera insignia real**: «Creador
        de personajes» 🎬. Chips editoriales (el docx no da ejemplos) —
        REVISAR. Jugada e2e completa: insignia otorgada + celebración.
      - **3.2 "Tu cómic de 4 viñetas"** — `construir_historia`
        (principio/lío/giro libre/final, como pide la ficha); bancos de
        opciones editoriales — REVISAR. duracionMinutos 45 (el docx la
        marca multi-sesión de 2).
      - **3.3 "El cartel con estilo"** — `afinar_prompt_detalles` por capas
        con los TRES estilos literales del docx (acuarela, cómic,
        pixel-art).
      - **3.4 "De la v1 a la v3"** — **`iterar_version` EXTENDIDO** (compat
        con 8-9): `iteraciones: 2` + `pideMotivo` — dos mejoras documentadas
        con su porqué y elección de favorita, exactamente la ficha.
        `dependeDe: ["3.1"]` (el docx: "toma una creación anterior").
        Jugada e2e: el bloqueo dependeDe dejó pasar con 3.1 en el Cuaderno,
        el resumen del Crea documenta las 2 mejoras con motivos y la
        favorita.
      Mapa con 3 zonas del método ("Entender" 3/4, "Usar bien" 1/4,
      "Crear" 2/4). Typecheck 0/0, build verde (12 rutas). Marta: 3 de 4
      insignias del docx. Falta el Nivel 4 "Construir" y decidir el formato
      de las "fotos de nivel".
- [x] **Nivel 4 "Construir" COMPLETO → TRAMO 10-11 TERMINADO (16/16 +
      las 4 insignias del docx)** *(19/07/2026, madrugada, mandato
      autónomo)*. Desde las fichas del docx:
      - **4.1 "Tu mini-quiz interactivo"** — `construir_juego`; banco de 7
        preguntas verificables con pista y dificultad (editorial, temas
        neutros: naturaleza/espacio/inventos — REVISAR). Jugada e2e.
      - **4.2 "Tu audiocuento o mini-podcast"** — `montar_libro` con
        estructura de guion de audio; `dependeDe: ["3.2"]` (el cómic).
      - **4.3 "Una idea para mejorar mi cole o mi barrio"** —
        `idea_para_ayudar`; destinatarios clase/barrio/casa del docx, con
        la reflexión "¿a quién ayuda y a quién podría no convenir?" en
        crea/detective (semilla de ética SIN Morti, como exige el docx).
      - **4.4 "Presenta tu proyecto al equipo"** — `presentar_creacion`
        con `dependeDe: ["4.1"]`; el widget listó las 7 creaciones REALES
        de Marta acumuladas en la migración (cierre integrador de verdad).
        Trae la **cuarta y última insignia del docx**: «Constructor con IA
        10-11» 🏗️ — otorgada en e2e con celebración grande.
      **Estado final verificado**: el mapa 10-11 tiene CERO retos legacy —
      4 zonas del método (Entender/Usar bien/Crear/Construir), 16 paradas,
      todo formato unidad-aventura. Marta termina con las 4 insignias del
      docx en `children.badges`. Typecheck 0/0, build verde (16 rutas).
      Un fix de contenido en el camino: comillas sin escapar en el
      guionVael de 4.4 (JSON inválido, cazado por validación previa al
      build). Queda para después: "fotos de nivel" (instrumento de
      medición pre/post — decidir formato con el usuario), quiz colectivo
      real de 4.1 y feedback entre pares de 4.4 (necesitan mecánica social
      moderada que hoy no existe — la galería moderada cubre la parte de
      compartir).
- [x] **Piloto del tramo 12-14: unidad 1.1 "¿Qué hay dentro de una IA?"**
      *(19/07/2026, mandato autónomo)*. Docx 12-14 extraído y estudiado:
      andamiaje mínimo, sesiones 35-45 min, verificación rigurosa, y
      **Morti** (detonante ético, voz propia — aparece en 1.4, 2.3, 2.4 y
      4.3; NO en la 1.1). Piloto sin Morti a propósito: valida el pipeline
      del tercer tramo sin tocar todavía el schema. La unidad usa
      `detectar_invencion` con los 3 mitos LITERALES del docx (piensa /
      siente / sabe la verdad, cada uno refutado con el texto del Explora)
      + la verdad literal ("predice lo más probable a partir de patrones");
      el argumento propio del alumno va en el Crea. **Limitación anotada:**
      el juego "predecir la siguiente palabra" de la ficha no tiene widget
      — pendiente `predecir_palabra` como widget futuro, decidir si merece
      la pena antes de producir más unidades N1. Ruta
      `/laboratorio/12-14/[id]` creada (el mapa ya lo soportaba). Jugada
      e2e con Hugo: 4/4 mitos, cierre del docx, mapa con 1.1 nueva "Te
      toca" y la 1.2 legacy encadenada por `data-req-unidad`. Typecheck
      0/0, build verde. **Siguiente paso del tramo: extensión del schema
      para la voz de Morti** (campo por unidad + estilo visual morado que
      indica el docx) antes de producir 1.4/2.3/2.4/4.3.
- [x] **Niveles 1 y 2 del tramo 12-14 COMPLETOS (8/16) + Morti integrado**
      *(19/07/2026, con el usuario que levantó el servidor y pidió terminar
      el tramo)*.
      - **Morti en el schema**: campo opcional `morti: { texto }` en
        `UnidadAventuraSchema` + `MortiIntervencion`. El motor lo pinta en
        la pantalla de misión, tras la voz de Vael, con estilo propio
        (`.ua-morti`: borde y nombre morados = `--k-brand-accent`, texto en
        cursiva) — el color que el docx marca para Morti. Verificado en
        navegador: color rgb(139,92,246), voz correcta.
      - **Nivel 1 "Entender"**: 1.1 (mitos de la IA — `detectar_invencion`,
        ya estaba del piloto), 1.2 (datos/patrones/sesgo —
        `decision_consecuencia`, con Morti), 1.3 (ingeniería de prompts —
        `afinar_prompt_detalles` con rol/objetivo/contexto/formato), 1.4
        (caza experto — `verificar_con_fuente`, con Morti + insignia real
        **«Verificador experto»** 🔬). Jugada e2e con Hugo: Morti visible,
        insignia otorgada en `children.badges`.
      - **Nivel 2 "Usar bien"**: 2.1 (prompt profesional con criterios —
        `afinar_prompt_detalles`), 2.2 (**verificación cruzada** — WIDGET
        NUEVO `verificacion_cruzada`: contrastar ≥2 fuentes marcadas
        fiable/no-fiable, veredicto con grado de confianza; veredicto
        erróneo → reintento), 2.3 (detecta y corrige sesgo —
        `decision_consecuencia`, con Morti), 2.4 (¿quién es responsable? —
        `decision_consecuencia` con 3 dilemas de responsabilidad + RGPD,
        con Morti). Verificado e2e: 2.2 completa (distingue fuentes de
        salud del anuncio publicitario, veredicto sólido); 2.3/2.4
        responden 200 con Morti en la pantalla de misión.
      typecheck 0/0, build verde (8 rutas 12-14). El mapa 12-14 mezcla las
      unidades nuevas con los retos legacy que aún no se han migrado (el
      panel generalizado ya lo soporta). **Piezas editoriales del docx que
      solo daba a medias — REVISAR**: casos de sesgo (buscador científico,
      enfermera/jefe), afirmaciones a verificar (muralla desde el espacio,
      8 vasos de agua), dilemas de responsabilidad. Todos con temas neutros
      y verificables, como pide el docx.
- [x] **Niveles 3 y 4 de 12-14 → TRAMO 12-14 COMPLETO (16/16)**
      *(19/07/2026)*.
      - **Nivel 3 "Crear"**: 3.1 worldbuilding (`construir_prompt_imagen`
        con idea/regla/conflicto — insignia **«Creador de mundos» 🌍**),
        3.2 relato con giro (`construir_historia`, dependeDe 3.1), 3.3
        identidad visual (`afinar_prompt_detalles` con logo/paleta/estilo),
        3.4 crítica y revisión (`iterar_version` x2 con motivo, dependeDe
        3.1).
      - **Nivel 4 "Construir"**: 4.1 prototipo (`construir_juego`, app de
        preguntas verificadas), 4.2 entregable publicado (`montar_libro`,
        dependeDe 4.1), 4.3 proyecto con impacto + **dilema de Morti**
        (`idea_para_ayudar`, buque insignia), 4.4 pitch final
        (`presentar_creacion`, dependeDe 4.3 — insignia **«Constructor con
        impacto» 🚀**, cierre del viaje Kidia).
      Las **4 insignias del docx 12-14** ya existen: Verificador experto
      (1.4), Analista de sesgos (2.3), Creador de mundos (3.1), Constructor
      con impacto (4.4). Morti en 5 unidades (1.2, 1.4, 2.3, 2.4, 4.3).
      **Bug de contenido cazado y arreglado**: el widget `idea_para_ayudar`
      (4.3 de 10-11 Y de 12-14) busca las necesidades por el `id` del
      destinatario, pero se habían escrito con el `valor` como clave → la
      cuadrícula de necesidades salía VACÍA. Alineadas las claves con los
      ids en ambos ficheros. Verificado e2e con Hugo: mapa 12-14 con 4
      zonas y 16 unidades (0 legacy), Morti visible en 4.3, necesidades
      renderizan, y el viaje 4.3 → 4.4 otorga la insignia final «Constructor
      con impacto» con celebración. typecheck 0/0, build verde (16+16 rutas).
      **Los 3 tramos (8-9, 10-11, 12-14) tienen ya su programa completo de
      Fase 1 en formato unidad-aventura.** Pendiente de contenido/decisión:
      las "fotos de nivel" (instrumento pre/post por nivel — falta decidir
      formato), y jubilar los escenarios legacy que ya no salen en el mapa.

## Siguiente acción concreta

Estado 17/07 (noche): **Fases 1 y 2 CERRADAS** (incluida la validación e2e
por login real). **Fase 3 en marcha**, cuatro piezas hechas: Insignias v2,
Diccionario de Palabras Poderosas, Cuaderno de Inventos navegable y el
**ledger de chispas ⚡** (la pieza esqueleto). El usuario ha pedido continuar
de forma autónoma sin pedir confirmación — todo este trabajo se hizo sin
supervisión en vivo, de ahí el detalle extra en cada verificación.

**Fase 3: todo el código que se podía hacer está hecho** (7 piezas:
Insignias v2, Palabras, Cuaderno, ledger ⚡, celebración, racha 🔥,
avatares). Lo que queda de Fase 3 no es código de Claude:
- "Reto extra de Vael": bloqueado por contenido (deep_mode vacío en los 8
  escenarios legacy — verificado; las preguntas del método no se inventan).
- Laboratorio v2 (gasto de chispas): pendiente de decidir mecánica de débito.
- Métricas baseline (doc 04 §6): necesitan la tabla 006 pegada y datos reales.

1. **Fase 4: LOS 3 TRAMOS COMPLETOS (16+16+16 unidades)**. Ya no queda
   contenido curricular de Fase 1 por producir. Siguientes bloques, por
   orden de valor:
   a) **"Fotos de nivel"** (los 3 tramos, doc del método): reto breve
      pre/post por nivel que mide las 4 competencias. Decidir con el
      usuario el formato (¿misión especial ligera? ¿instrumento con
      métricas al ledger?) antes de producir.
   b) "Fotos de nivel" de 10-11 y 12-14 (pre/post por nivel) — decidir
      formato con el usuario (¿misión especial? ¿instrumento con métricas?).
   c) Jubilar los 8 escenarios legacy de 10-11 (ya no se usan en el mapa;
      los de 12-14 se van jubilando según se migran).
   Nota previa del Constructor sigue vigente: hidratación rota SOLO en dev
   (producción OK); arreglo real = Astro 6 + @astrojs/svelte 8, con el
   usuario.
2. Pendiente de un humano, no de Claude: pegar las migraciones acumuladas
   (P0 trigger, **005 DELETE**, **006 child_events**); tras la 006, jugar
   una misión con familia.prueba y confirmar "+N chispas" en el cierre y
   la pill ⚡ del header; prueba en móvil real del "Hecho cuando" de Fase 2.
3. Commit de todo este bloque de Fase 3 cuando el usuario lo pida — sigue
   sin commitear a propósito: mejor un commit por sesión de trabajo que el
   usuario revise de una vez.
