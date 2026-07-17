# 02 · Auditoría de usabilidad

Dos audiencias con necesidades opuestas conviven en la misma web:

- **El niño/a (8-14):** necesita foco, botones grandes, feedback inmediato, cero
  jerga, y que "lo siguiente que hacer" sea siempre obvio.
- **El padre/madre:** necesita confianza (privacidad, método), control (hijos,
  suscripción) y visibilidad del progreso.

El problema transversal de Kidia hoy: **ambas audiencias comparten el mismo header,
la misma navegación y el mismo tono visual.** Un niño de 8 años ve en el header:
Mapa · Insignias · Constructor · Caminos · Metodología · Blog · Info · Zona Padres.
Cinco de esos ocho enlaces no son para él.

## 1. Problema nº 1: no hay separación de modos niño / adulto

**Propuesta central de esta auditoría:** dos "shells" distintos sobre el mismo login.

- **Modo Aventura (niño):** header mínimo (logo → mapa, avatar del hijo, su
  progreso). Sin Blog, Metodología, Caminos ni Zona Padres. Tipografía mayor,
  objetivos de toque ≥ 48px, lenguaje 100 % de personaje (Vael).
- **Modo Familia (adulto):** dashboard de padres como home (progreso de cada hijo,
  misiones en familia pendientes, gestión de hijos y plan). Acceso con el candado 🔒
  actual, idealmente con un gate sencillo (p. ej. una operación matemática, patrón
  común en apps infantiles) para que el niño no entre por error.

Esto reordena todo lo demás: cada pantalla pertenece a un modo y se diseña para
su audiencia.

## 2. Hallazgos por pantalla

### 2.1 Home (`index.astro`)
- Está bien enfocada como funnel de captación (rediseño reciente). Es página de
  **padres**: mantenerla en modo adulto.
- Con sesión iniciada debería llevar directo al dashboard correspondiente en vez
  de repetir el pitch.

### 2.2 Dashboard (`dashboard.astro`)
- «¿Qué quieres hacer hoy?» con dos tarjetas (Mapa / Constructor) es una decisión
  abstracta para un niño de 8 años y una pantalla de más para el flujo diario.
- El selector de hijo ("Jugando como") es funcional pero de aspecto administrativo
  (un `<select>` nativo). Para el niño debería ser una **pantalla de perfiles**
  estilo "elige tu personaje": tarjetas grandes con avatar, al estilo de las
  plataformas de streaming.
- **Propuesta:** tras el login → selector de perfil (si hay >1 hijo) → **el Mapa
  directamente**, con el Constructor accesible como una zona más del mapa. El
  dashboard actual desaparece.

### 2.3 Mapa (`mapa.astro`) — la pantalla más importante y la más problemática
- **Carrusel horizontal con drag de ratón:** el drag está implementado solo con
  eventos de mouse; en táctil depende del scroll nativo que el propio CSS dificulta
  (snap + overflow 2D). En móvil, donde jugará la mayoría, es frágil.
- **Efecto tilt 3D en hover y tooltips en hover:** no existen en táctil; todo lo
  comunicado por hover se pierde en tablet/móvil.
- **20+ tarjetas en una tira plana:** las 16 unidades + 4 especiales del tramo 8-9
  se presentan como una fila infinita. El niño no percibe estructura (las 4 zonas
  del método), ni dónde está, ni cuánto queda.
- **"MODO PROFUNDO" con toggle ON/OFF:** jerga de adulto, sin explicación al niño,
  y el estado vive solo en `localStorage` global (no por hijo).
- **Estados de tarjeta confusos:** «🔒 Requiere suscripción» es un mensaje de pago
  dentro de la pantalla del niño; «📝 Repite el test» no explica por qué.
- **Propuesta:** rediseñar el mapa como **mapa de zonas** (ver doc 04 §3): 4 zonas
  del método como islas/regiones, dentro de cada zona 4 paradas + misión especial,
  camino visible, "estás aquí". Vertical y touch-first (scroll nativo), tooltips
  fuera, la información importante siempre visible en la tarjeta.

### 2.4 Laboratorio / unidad-aventura (`laboratorio/[id].astro` + `unidad-engine.ts`)
- Es el flujo más pulido: secuencia fija de pantallas, barra de 7 pasos, lectura en
  voz alta, misión en familia. Buena base.
- Mejoras: al bloquear una unidad por dependencia (`renderBloqueado`) el enlace
  dice "Volver al Mapa" pero no lleva a la unidad que falta — enlazarla directamente.
- No hay forma de **salir a mitad y retomar**: el motor no persiste la pantalla
  actual (el viejo `game-engine` sí guardaba nodo). Un niño de 8 años se levanta a
  merendar y pierde la sesión. Persistir pantalla + `investigaResultado` por unidad.
- El botón "Ya lo hicimos ✓" de la misión en familia se puede pulsar sin hacer nada
  — está bien no policiar, pero conviene un paso de confirmación juguetón
  ("¿Seguro? Vael se entera 😉") para darle valor.

### 2.5 Retos legacy (`scenario/[slug]` + `game-engine.ts`) — tramos 10-11 y 12-14
- Formato chat lineal correcto, pero solo hay **4 unidades por tramo** frente a
  las 16+4 del tramo 8-9. Un hijo de 10 años tiene la cuarta parte de contenido
  y una experiencia visualmente distinta. Es el mayor agujero de producto
  (roadmap Fase 4).
- El quiz final es el único gate de insignia; si sales antes del quiz queda el
  estado ambiguo «📝 Repite el test».

### 2.6 Insignias (`insignias.astro`)
- Página de colección plana. No comunica **cómo conseguir** las que faltan (el
  hueco motivacional clave de una colección). Ver doc 04 §4.

### 2.7 Zona de padres (`parents.astro`, `perfil.astro`)
- El "Panel Familiar" real vive en `parents.astro` y la gestión de hijos en
  `perfil.astro#hijos` — dos sitios para lo mismo. Unificar en el Modo Familia (§1).
- El informe para padres (`computeParentReport`) es texto genérico por reglas;
  con el sistema relacional (palabras, artefactos, misiones) se puede mostrar el
  **trabajo real del hijo** (su cuaderno), que es infinitamente más persuasivo.

### 2.8 Onboarding — el flujo con más fricción y más impacto en conversión
Hoy: registro → callback → dashboard → aviso "no tienes hijos" → ir a perfil →
formulario → volver → elegir hijo → mapa → tarjetas bloqueadas por suscripción.
Son ~8 pasos con 2 callejones sin salida antes de ver valor.

**Propuesta — un wizard de 3 pasos tras el primer login:**
1. "¿Quién va a jugar?" (nombre + año de nacimiento → tramo calculado al vuelo
   con explicación: "Leo, 8 años → Aventuras nivel explorador").
2. "Así funciona Kidia" (3 tarjetas: método, seguridad, familia).
3. → directo a la **unidad 1.1 gratuita** (no al mapa): el valor primero, el
   mapa después.

## 3. Transversales

| Tema | Estado | Acción |
|------|--------|--------|
| **Móvil/tablet** | Header con 8 enlaces y una sola media query; mapa drag-de-ratón; tilt/hover | Auditoría mobile-first tras el sistema de diseño; el niño jugará en tablet |
| **Accesibilidad** | Sin `prefers-reduced-motion` (0 usos) con animaciones constantes (float, glow, tilt); contraste de textos `--color-text-muted` sobre fondos translúcidos sin verificar; controles hechos con `div`+JS | Reglas en el sistema de diseño (doc 03 §5): reduced-motion global, contrastes AA, foco visible, roles ARIA en quiz y widgets |
| **Lectura en voz alta** | Solo en laboratorio 8-9 y blog | Extenderla a scenario/quiz cuando se unifiquen los motores |
| **Idioma/tono** | Mezcla: "Reto", "Misión", "Unidad", "Escenario", "Aventura" según la pantalla | Glosario único en el sistema de diseño (doc 03 §6). Propuesta: **Misión** (unidad), **Zona** (nivel), **Mapa**, **Cuaderno**, **Insignia** |
| **Errores silenciosos** | Los servicios devuelven `{error}` y loguean a consola; el niño no ve nada o ve estados colgados | Patrón único de error amable con Vael ("¡Ups! Mi laboratorio ha hecho puf…") + reintento |

## 4. Priorización de UX

1. **Onboarding wizard → unidad 1.1** (§2.8) — impacto directo en conversión.
2. **Separación Modo Aventura / Modo Familia** (§1) — reordena todo lo demás.
3. **Mapa de zonas touch-first** (§2.3, con doc 04) — la pantalla diaria del niño.
4. **Retomar sesión a mitad de unidad** (§2.4).
5. **Paridad de tramos** (§2.5) — grande, va en Fase 4 del roadmap.
