# ESTADO — bitácora de trabajo del plan de mejora

> Este fichero es el "punto de guardado" entre sesiones de trabajo con Claude.
> Se actualiza al terminar cada bloque de trabajo. Si empiezas una sesión nueva:
> "lee docs/mejora/ESTADO.md y continúa".

## Estado actual

- **Fase activa:** Fase 2 — Usabilidad núcleo, con TODO el código hecho:
  pendiente solo de validación con login real (Fase 1 CERRADA el 17/07;
  ver checkboxes en [05-roadmap.md](05-roadmap.md))
- **Último update:** 17/07/2026 (Modo Aventura/Familia implementado, Fase 1
  cerrada, roadmap sincronizado; Supabase caído — ver Pendiente)
- **Git:** TODO el trabajo de Fase 0 + lo que sigue está **sin commitear** a
  propósito (decisión del 16/07): se commiteará más adelante. No hacer `git
  checkout/reset` destructivo sin revisar `git status` primero.

## Hecho

- ✅ Fase 0 completa (16/07/2026) — detalle y checkboxes en el roadmap.
  Decisión de backend: seguir 100 % estático.
- ✅ Documentación completa en `docs/mejora/` (README + 6 docs).

## Pendiente que depende del usuario (no de Claude)

- ~~🚨 Supabase caído (NXDOMAIN)~~ — **restaurado por el usuario el 17/07
  (tarde)**; verificado: auth responde y la e2e con familia.prueba funciona.
- ⚠️ **P0 de seguridad:** pegar el SQL del trigger anti-autoaprobación en el
  SQL Editor de Supabase — está listo en [06-auditoria-rls.md](06-auditoria-rls.md).
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
- [ ] Mapa: valorar avatar-en-mapa (resto del rediseño ya hecho en Fase 1)

## Siguiente acción concreta

Estado 17/07 (noche): **Fase 1 CERRADA; Fase 2 con todo el código hecho y la
e2e funcional verde** (login, selector, modos, gate con PIN — Claude, con
familia.prueba). Supabase restaurado y migración 004 pegada.

1. **Prueba humana en móvil real** (el criterio "Hecho cuando" de Fase 2):
   de registro nuevo a "misión 1.1 terminada" sin callejones, en un móvil
   de verdad — el wizard de bienvenida necesita una cuenta nueva sin hijos.
   Verificar de paso el trigger P0 (¿se pegó también? no está confirmado).
2. Con eso → **Fase 3 (gamificación, doc 04)**: empezar por el ledger
   `child_events` + chispas (Supabase ya está vivo) o Insignias v2 ("cómo
   conseguir cada una", doc 04 §4). El avatar-en-mapa se valora dentro de
   Fase 3.
3. Sigue pendiente de decisión del usuario: **commit del trabajo acumulado**
   (todo sigue sin commitear a propósito desde Fase 0).
