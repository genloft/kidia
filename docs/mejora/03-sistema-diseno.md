# 03 · Sistema de diseño Kidia

## 0. Diagnóstico

Hoy existe un embrión de sistema en `src/styles/global.css` (~30 variables: colores
base, radios, sombras, 4 tamaños de texto, `.btn`, `.card`, `.pill`) pero:

- **177+ colores hardcodeados** en páginas y componentes (`#94a3b8`, `#0f172a`,
  `rgba(255,255,255,…)` repetidos con valores ligeramente distintos).
- Cada página redefine sus propios botones (`.btn-primary`, `.btn-outline`,
  `.btn-login`, `.btn-option`, `.btn-continue`, `.btn-deep-mode`…), tooltips,
  modales y barras de progreso.
- `constructor.css` es un segundo sistema paralelo (alineado a mano en radios/sombras,
  según los comentarios).
- No hay escala de espaciado, ni tokens de movimiento, ni modo de tema, ni
  documentación.

Consecuencia: cualquier cambio visual ("los botones más grandes para niños") toca
N ficheros. El sistema de diseño es la **fundación** del resto del plan (usabilidad
y gamificación se construyen encima).

## 1. Principios

1. **Un producto, dos pieles.** La misma base de tokens con dos temas: **Aventura**
   (niño: más contraste, más color, tipografía mayor, más movimiento) y **Familia**
   (adulto: más sobrio, denso y legible). Se implementa con `data-theme` en `<html>`.
2. **Touch-first.** Todo control interactivo ≥ 48×48 px en modo Aventura. Nada
   depende de hover.
3. **El movimiento premia, no decora.** Animación reservada para feedback (acierto,
   insignia, subida de nivel), no ambiental permanente. `prefers-reduced-motion`
   respetado globalmente.
4. **Tokens antes que componentes, componentes antes que páginas.** Prohibido el
   hex suelto en un `.astro` nuevo.

## 2. Tokens (nivel 1: primitivos → nivel 2: semánticos)

Fichero: `src/styles/tokens.css` (importado por `global.css`). **Creado el 16/07/2026.**

**Decisión de nomenclatura:** los tokens semánticos llevan prefijo `--k-`
(`--k-text-muted`, `--k-brand-primary`…) porque `constructor.css` ya define en
`:root` nombres sin prefijo (`--text-muted`, `--primary`…) que colisionarían en
la página del constructor. Los nombres viejos de `global.css` (`--color-primary`…)
se mantienen como alias hasta terminar la migración de páginas.

### 2.1 Color

Primitivos (escalas 100-900): `--cyan-*`, `--violet-*`, `--fuchsia-*` (marca),
`--slate-*` (neutros), `--green-*` / `--amber-*` / `--red-*` (estado).

Semánticos (los que usa el código):

```css
--bg-page / --bg-surface / --bg-surface-raised / --bg-overlay
--text-strong / --text-body / --text-muted / --text-inverse
--brand-primary (cyan) / --brand-secondary (fuchsia) / --brand-accent (violet)
--border-subtle / --border-strong / --border-focus
--state-success / --state-warning / --state-danger / --state-locked
--fx-glow-primary / --fx-glow-secondary
```

Cada **zona del mapa** tiene además su acento (ver doc 04): `--zona-1` … `--zona-4`.
Reglas: contraste AA mínimo (4.5:1 texto normal, 3:1 texto grande) verificado por
combinación semántica, no a ojo. `--text-muted` actual (`#94a3b8`) sobre superficies
translúcidas necesita revisión.

### 2.2 Tipografía

- Familia: Outfit (self-hosted, `woff2`, pesos 400/600/800; eliminar el 300 — poco
  legible para niños).
- Escala con `clamp()` (ya existe parcialmente): `--text-xs/sm/base/lg/xl/h3/h2/h1/hero`.
- **Modo Aventura:** `--text-base` ≥ 1.125rem, line-height 1.6, párrafos ≤ 60ch.

### 2.3 Espaciado, radios, sombras, movimiento

- Espaciado: escala de 4px (`--space-1` = 4px … `--space-12` = 96px). Hoy no existe.
- Radios y sombras: conservar los actuales (ya unificados con el constructor).
- Movimiento: `--motion-fast: 150ms` / `--motion-base: 250ms` / `--motion-celebrate:
  600ms`, con curvas nombradas (`--ease-out`, `--ease-spring`). Bajo
  `prefers-reduced-motion`: transiciones a 0 y celebraciones sustituidas por
  cambio de estado estático.

## 3. Componentes (biblioteca compartida)

Componentes Astro en `src/components/ui/` (y equivalentes de clase CSS para el
código imperativo de los motores, que generan DOM con JS):

| Componente | Sustituye a | Notas |
|------------|-------------|-------|
| `Button` (primary/secondary/ghost + size sm/md/lg/xl) | ~7 variantes dispersas | `xl` = botón de acción del niño |
| `Card` (base/interactiva/locked) | `.card`, `.option-card`, `.mission-card-v3` | Estados: disponible, completada, bloqueada, "en curso" |
| `Pill` / `Badge` | `.pill`, `.tramo-pill`, pills ad-hoc | |
| `ProgressBar` + `ProgressSteps` | barra del mapa, pasos de unidad, quiz counter | |
| `Modal` | quiz, reminder, modales del constructor | Focus-trap y `Escape` |
| `Toast` / feedback | mensajes de error/éxito ad-hoc | Con variante "voz de Vael" |
| `VaelBubble` | `.ua-vael-texto`, burbujas del chat | Personaje + texto + botón de audio (integra `speech.ts`) |
| `EmptyState` | prompts tipo "no tienes hijos" | Ilustración + acción única |
| `Confetti/Celebration` | partículas del game-engine | Un solo sistema de celebración (doc 04 §5) |

Documentación viva: una página `/dev/ui` (excluida del build de producción o tras
login admin) que renderiza todos los componentes con sus variantes — sirve de
contrato visual y de test manual.

## 4. Los dos temas

| Token | Aventura (niño) | Familia (adulto) |
|-------|-----------------|------------------|
| `--bg-page` | Azul noche actual (#09090b→#0f172a) con fondo estelar sutil | Slate neutro, menos efectos |
| `--text-base` | 1.125-1.25rem | 1rem |
| Densidad | Aire: `--space` ×1.25 | Compacta |
| Movimiento | Celebraciones activas | Mínimo |
| Header | Logo + avatar + progreso | Navegación completa |

El modo oscuro único actual se mantiene como base (encaja con la estética "espacio/
laboratorio"); un modo claro es opcional y solo tendría sentido en Modo Familia.

## 5. Accesibilidad (reglas del sistema, no opcionales)

1. `prefers-reduced-motion` implementado globalmente en `tokens.css`.
2. Contraste AA verificado por token; ningún texto sobre `rgba` translúcido sin comprobar.
3. Foco visible (`--border-focus`, `outline-offset`) en todo interactivo; hoy no hay estilo de foco.
4. Controles reales (`<button>`, `<a>`) — los motores generan algunos controles como divs.
5. Lectura en voz alta como capacidad del componente `VaelBubble`, no de páginas sueltas.
6. Objetivos táctiles ≥ 48px (Aventura) / ≥ 40px (Familia).

## 6. Lenguaje (parte del sistema de diseño)

Glosario único — el código y la UI usan la misma palabra:

| Concepto | Palabra única | Hoy se dice también… |
|----------|--------------|----------------------|
| Una sesión de aprendizaje | **Misión** | reto, unidad, escenario, aventura |
| Grupo de 4 misiones | **Zona** | nivel, mundo |
| Cierre de zona | **Misión especial** | ✅ ya consistente |
| Producto creado por el niño | **Creación** | artefacto, producto |
| Donde se guardan | **Cuaderno** | ✅ |
| Recompensa | **Insignia** | badge, logro |
| Actividad con padres | **Misión en familia** | ✅ |

Voz de Vael: siempre 2ª persona, frases cortas, sin exclamaciones dobles, celebra
el proceso ("¡Qué buena pregunta hiciste!") más que el resultado.

## 7. Plan de implementación (incremental, sin big-bang)

1. **Semana 1 — Tokens:** crear `tokens.css` con semánticos mapeados a los valores
   actuales (cero cambio visual). Migrar `global.css` a consumirlos.
2. **Semana 1-2 — Componentes núcleo:** Button, Card, Pill, ProgressBar, Modal,
   VaelBubble + página `/dev/ui`.
3. **Semana 2-3 — Migración por página** (orden: Header/Layout → mapa → laboratorio
   → dashboard/perfil → resto). Cada página migrada elimina su CSS duplicado.
4. **Continuo:** regla de PR: ningún color/espaciado literal nuevo; el constructor
   (`constructor.css`) migra el último, solo a nivel de tokens.
