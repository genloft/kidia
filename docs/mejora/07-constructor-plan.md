# 07 · Plan de mejora global del Constructor

> Estado: COMPLETADO · 2026-07-29
> Decisiones de producto tomadas: **(A) integrar el Constructor a los niveles de Kidia**,
> **(B) adaptarlo a los 3 tramos** (8-9, 10-11, 12-14) y **(C) rehacer su capa visual y adaptativa**.
> Objetivo del usuario: *"gamificar cómo se construye y se mejora una IA por niveles"*.
>
> **Plan COMPLETO: C0, C1, C2, C3, C4 y C5 hechos y verificados** (ver §3).

---

## 1. Diagnóstico (estado actual)

El Constructor (`src/features/constructor/`, ~4.900 LOC, Svelte 5) es un **sandbox de 5 etapas**
(Fundamentos → El cerebro crece → Era generativa → Alineamiento → Singularidad). El niño
coloca piezas en 5 slots (**Datos · Cerebro · Entrenamiento · Examen · Salida**), pulsa
**Entrenar**, y avanza de etapa si cumple 3 objetivos. Tres métricas: `accuracy / performance / complexity`.

Buena maqueta conceptual, pero con cuatro problemas de fondo:

- **Es una isla.** No emite chispas, no otorga insignias, no registra `child_events`, no aparece
  en el mapa, no guarda nada en el Cuaderno de Inventos, no usa `sync-service`.
- **Dos sistemas de "niveles" que no se hablan.** Sus 5 etapas son un eje histórico/arquitectónico,
  no los 4 Niveles Bloom del currículo (Entender · Usar bien · Crear · Construir).
- **El bucle "mejorar" es plano.** Colocar → Entrenar → "avanzas" / "objetivo faltante". Sin
  antes/después ni estados de fallo que enseñen (overfitting, sesgo, alucinación).
- **Sin narrativa ni ética.** Mentor genérico en vez de Vael; falta Morti donde más pega.

### 1.1 Bugs (✅ corregidos en C0)

| # | Gravedad | Qué pasaba | Corrección |
|---|----------|-----------|------------|
| 1 | 🔴 Crítico | `p_recursive_improvement` exigía `p_compute_cluster`, inexistente → objetivo obligatorio `5_recursive` inalcanzable → **juego ininganable**. | prereq → `p_exascale` |
| 2 | 🟠 Alto | `p_auto_alignment` exigía `p_human_feedback` (inexistente) → pieza muerta. | prereq → `p_human_eval` |
| 3 | 🟠 Alto | Al recargar, `initCheck()` lanzaba un `alert()` nativo. | eliminado |
| 4 | 🟡 Medio | `canTrain()` comprobaba `p_model_supervised`, id inexistente. | rama eliminada |
| 5 | 🟢 Bajo | `export let data`, `STORAGE_KEY` sin usar, `substr` deprecado. | limpiados |

### 1.2 Diagnóstico VISUAL (medido)

- **Sistema de diseño paralelo.** `constructor.css` define su propia paleta (`--bg-main`, `--primary`,
  `--color-1..5`, radios, sombras) y los componentes usan **0 tokens `--k-`** frente a **23 colores
  hardcodeados**. El doc `03-sistema-diseno.md` ya lo identifica como "un segundo sistema paralelo"
  que debe migrar **a tokens**.
- **Fuente remota bloqueante.** `@import url('https://fonts.googleapis.com/…Outfit…')` en el CSS:
  petición externa a Google en la primera pintura, con coste de rendimiento y de privacidad (producto
  infantil), e incoherente con el resto del sitio.
- **Estética "consola hacker".** Fondo negro puro (`#09090b`) y acentos neón. Es atractivo para 12-14
  pero choca con la piel **Aventura** del resto de Kidia y es hostil para 8-9.
- **Sin `prefers-reduced-motion`.** El sistema de diseño (§5) lo marca como no opcional y lo
  implementa globalmente en `tokens.css`; el Constructor se lo salta.
- 🔴 **El panel de depuración se publica a los niños.** `DevPanel` se renderiza **sin ningún guard de
  entorno** (`import.meta.env.DEV`) → el botón "Toggle Debug Panel" es visible en producción.

### 1.3 Diagnóstico ADAPTATIVO (medido en 375×812)

- 🔴 **Sin soporte táctil.** El arrastre es HTML5 `dragstart/drop` puro, que **no funciona en
  móvil/tablet**. Existe un fallback click-para-colocar, pero es **invisible**: la etiqueta accesible
  dice *"Selecciónala y arrástrala"*. En tablet —el dispositivo natural del producto— el niño
  se queda atascado.
- 🔴 **El bucle no cabe en pantalla.** En 375px la página mide **1.575px** y el botón **Entrenar
  queda a y≈1.488**: colocar pieza → ver métricas → entrenar ocupa **casi dos pantallas** de scroll,
  sin barra de acción fija. Se pierde la relación causa-efecto, que es el corazón del juego.
- **Responsive mínimo.** Solo **3 media queries, todas a 1024px**. Nada específico de teléfono.
- 🔴 **Ignora el tramo del niño activo.** Verificado con **Leo (8-9)**: se le ofrecen igualmente
  "Regularización (Dropout)", "Capa Softmax" y "Modelo Transformer".

---

## 2. Modelo de integración (decisión A)

**El Constructor es el capstone del Nivel 4 "Construir"** de cada tramo: la experiencia donde el niño
*construye* una IA con lo aprendido en los Niveles 1-3.

```
Niveles Bloom del currículo        Constructor (etapas internas escaladas por tramo)
─────────────────────────────      ─────────────────────────────────────────────────
1 Entender                         (prepara: qué son datos, cerebro, entrenar)
2 Usar bien                        (prepara: por qué falla, cómo se evalúa)
3 Crear                            (prepara: generar, iterar)
4 CONSTRUIR  ← el Constructor      etapas internas: Datos → Cerebro → … → (Ética)
```

- Se **desbloquea** al alcanzar el Nivel 4 del tramo; antes aparece "bloqueado con pista" en el mapa.
- Cada **etapa interna** completada = evento + chispas + celebración, como una unidad.
- La IA terminada **se guarda en el Cuaderno de Inventos**.

### 2.1 Escalado por tramo (decisión B)

| Tramo | Etapas internas | Slots | Ética (Morti) | Vocabulario |
|-------|-----------------|-------|---------------|-------------|
| **8-9** | 3 (Datos → Cerebro → Salida) | 3 | No | "enseñar con ejemplos", "cerebro que adivina" |
| **10-11** | 4 (+ Entrenamiento/Examen) | 5 | Ligera (una pregunta) | "aprender de errores", "hacer trampas en el examen" |
| **12-14** | 5 (actual, + Alineamiento + Singularidad) | 5 | Sí, dilema real | actual (Transformer, RLHF, overfitting) |

El catálogo gana `tramos: ('8-9'|'10-11'|'12-14')[]` y `nameByTramo` / `tooltipByTramo` opcionales.
El motor filtra piezas, slots y etapas por el tramo del niño activo.

### 2.2 Dirección visual (decisión C)

Tres reglas, no un rediseño desde cero:

1. **Una sola base de tokens.** `constructor.css` deja de definir paleta propia: sus variables se
   remapean a los semánticos `--k-`. Se conserva el *look*, se elimina el sistema paralelo.
2. **Piel por tramo, no un tema único.** La estética "laboratorio nocturno" se mantiene para 12-14;
   para 8-9 se aclara (más luz, más color, tipografía mayor, iconos más grandes), usando el mismo
   contrato de tokens que ya distingue Aventura/Familia.
3. **La métrica es el protagonista.** El feedback visual (Δ de métricas, estado de fallo) debe ser
   lo más visible de la pantalla tras Entrenar — hoy compite con el log de texto.

---

## 3. Plan por fases

### ✅ Fase C0 · Arreglar el bucle · HECHO (2026-07-28)
Bugs 1-5 corregidos. `astro check` 0 errores / 0 warnings. Verificado en navegador: el Constructor
monta sin errores, la recarga ya no lanza `alert()`, y la Etapa 5 es completable.

### ✅ Fase C1 · Conectar a la progresión · HECHO (2026-07-29)

El Constructor **deja de ser una isla**.

- Nuevo `logic/progression.ts`: catálogo de insignias del Constructor, chispas y
  guardado en el Cuaderno. Todo "mejor esfuerzo": sin sesión, hijo/a activo o tablas,
  el juego sigue jugable y solo se pierde el registro.
- **Chispas y ledger**: nuevos tipos `constructor_etapa` (5) y `constructor_ia` (20)
  en `chispas-service`, calibrados contra la economía existente (misión 10, familia 20).
  Idempotentes por `ref_id`, así que rejugar no vuelve a puntuar.
- **4 insignias** que se ganan jugando: 🧱 Arquitecto de Datos (1ª etapa),
  🎯 Entrenador Paciente (3 entrenamientos), 🛡️ Constructor Seguro (pone el escudo)
  y 🤖 Creador de IA (termina su viaje). Se otorgan al mismo `children.badges` que
  las unidades y celebran con `celebration.ts`.
- **La IA se guarda en el Cuaderno** con el nombre que le pone el niño, en su
  propio lenguaje ("Datos: Muchísimos ejemplos"), no con ids internos.
- **Capstone en el mapa**: tarjeta "Construye tu propia IA" al final del panel de
  cada tramo, con estado derivado de las insignias. No entra en el conteo de zonas
  ni en el "te toca", porque no es una misión del currículo.

**Defecto encontrado y corregido de paso**: `BadgeGrid` nunca cargaba `unidades-12-14`,
así que las 4 insignias de ese tramo se ganaban y persistían pero **no aparecían en
/insignias** — exactamente el mismo fallo que ese componente ya había arreglado para 8-9.

**Pendiente de C1** (no bloqueante): el *gate* de desbloqueo por Nivel 4. Se dejó fuera
a propósito: el Constructor está hoy en la navegación principal para todos, y un bloqueo
duro es una decisión de producto con coste real. La tarjeta del mapa ya lo presenta como
reto final; falta decidir si se cierra el acceso directo.

**Verificación**: `astro check` 0/0, build verde (88 páginas) y viaje completo con
**Leo (8-9)**: las 4 insignias se otorgan, la IA "Guardián Amable" aparece en
`/cuaderno` legible, y el capstone sale en el mapa con su estado.


### ✅ Fase C2 · Profundizar el "mejorar" · HECHO (2026-07-29)

El bucle era plano: colocar → Entrenar → "avanzas" o "falta un objetivo". Nunca se
explicaba **por qué** un modelo es peor, que es justo lo que enseña a mejorar una IA.

- Nuevo `logic/diagnostics.ts` + `components/TrainResult.svelte`: tras entrenar aparece
  un panel con el **antes/después** (Δ por métrica, ▲/▼) y un **veredicto legible**
  ("¡Mejor que antes! Ha subido 15 puntos" / "Ha empeorado 15 puntos. ¿Qué cambiaste?").
- **4 estados de fallo que enseñan**, deducidos de las piezas y las métricas, cada uno
  con explicación y pista accionable:
  🦜 memoriza (overfitting) · 🔍 pocos datos / sesgo · 🎭 se lo inventa (alucinación) ·
  🐌 va lenta (coste de inferencia).
- **Lenguaje por tramo**: 8-9/10-11 leen "Se lo está aprendiendo de memoria"; 12-14 lee
  "Overfitting" con la explicación técnica. Máximo 2 avisos: una lista larga desanima.

**Bloqueo de diseño corregido**: el botón *Entrenar* estaba **deshabilitado hasta cumplir
los objetivos**, así que era imposible entrenar un modelo malo y ver por qué falla — el
bucle "mide → diagnostica → ajusta → vuelve a medir" era inalcanzable, y dejaba muerto el
mensaje "objetivo faltante" que el propio código ya tenía. Ahora se entrena siempre que el
modelo sea válido; los objetivos deciden si además se **avanza de etapa**.

**Verificación e2e**: con **Leo (8-9)** el ciclo completo — modelo pobre → "Ha visto pocos
ejemplos" + pista → seguir la pista → "¡Mejor que antes! ▲ +15" y el aviso desaparece →
empeorar a propósito → "Ha empeorado 15 puntos ▼ -15". Con **Hugo (12-14)**, hasta la etapa
3, saltan a la vez **Overfitting** y **Riesgo de alucinación** con el texto técnico.
`astro check` 0/0, build verde (88 páginas).


### ✅ Fase C3 · Narrativa + ética · HECHO (2026-07-29)

- **El mentor pasa a ser la Dra. Vael**, no un asistente anónimo: nombre propio en la
  cabecera, avatar que cambia de gesto según el estado (trabajando / bien / mal / duda),
  etiquetas accesibles en castellano y pistas en su voz ("Te falta algo en Datos. ¿Qué le
  pondrías?" en vez de "👉 objetivo: Datos"). Además ahora lee los huecos del tramo,
  así que en 8-9 no sugiere rellenar huecos que no existen.
- **Momento ético antes de la victoria** (`logic/etica.ts` + `ModalEtica.svelte`): ya no se
  celebra sin más haber construido algo potente. El dilema **se elige según la IA que el
  niño acaba de construir** — si no le puso escudo, si aprendió de datos ajenos, o a quién
  perjudica cuando falle.
- **Quién pregunta respeta la metodología** (`src/lib/tramos.ts`): **Morti solo en 12-14**,
  con voz morada y tono incómodo; en **10-11 pregunta la Dra. Vael**, más suave. En **8-9
  no hay dilema**: su cierre es celebrar lo construido.
- Nueva insignia **⚖️ Constructor Responsable**, que se gana al responder asumiendo la
  responsabilidad en vez de escurrir el bulto. Ninguna respuesta bloquea el juego.

### 🐛 Bugs de jugabilidad encontrados al validar C3

Una simulación exhaustiva que **respeta los prerrequisitos** (la de C4 no lo hacía) destapó
dos trampas más, de la misma familia que la crítica de C0:

1. 🔴 **La etapa 3 de 12-14 era imposible.** Exigía Transformer + precisión >85 +
   complejidad >70, pero el Transformer obliga a poner el Tokenizador en Datos, y esa
   combinación topa exactamente en 85 y 70: ambas condiciones quedaban un punto por
   encima del máximo alcanzable. Umbrales corregidos a ≥80 y ≥60 (4 combinaciones válidas).
2. 🟠 **Elegir la pieza buena bloqueaba la partida.** `Etiquetas Básicas` exigía tener
   puesto `Datos Crudos`; si el niño elegía la pieza *mejor* del mismo hueco (Limpieza de
   Datos), las Etiquetas quedaban incolocables… y `canTrain` las exige con el modelo
   simple. Premiar la elección peor es justo lo contrario de lo que enseña el juego.
   Prerrequisito eliminado.
3. 🟡 **Rechazo silencioso al entrenar.** Al abrir el botón *Entrenar* en C2, los rechazos
   de `canTrain` solo salían en el log. Ahora se ven en el panel de resultado ("🔧 El
   modelo simple requiere Etiquetas…").

**Verificación**: simulación exhaustiva de los 3 tramos → **0 etapas imposibles**
(8-9: 1/3/1 combinaciones; 10-11: 11/39/8/4; 12-14: 11/39/8/4/145). E2E con **Hugo (12-14)**
recorriendo las 5 etapas hasta Morti, respondiendo y recibiendo la insignia ⚖️.
`astro check` 0/0, build verde (88 páginas).


### ✅ Fase C4 · Adaptación real (táctil, móvil, tramo) · HECHO (2026-07-28)

**Táctil y móvil**
- `DevPanel` gateado tras `import.meta.env.DEV`: verificado que **no aparece en `dist/`**.
- **Tocar-para-colocar** como interacción principal en táctil, y por fin *descubrible*:
  etiquetas corregidas ("Toca para elegirla" → "Ahora toca un hueco"), pista visible en la
  pieza elegida, y los huecos libres se anuncian con "👇 Toca aquí" y un pulso.
  *Decisión:* no se construyó un motor de arrastre táctil — entra en conflicto con el scroll
  de la lista y es frágil para 8-9; el fallback de toque ya existía, el fallo real era que
  nadie podía descubrirlo.
- **Bucle en una pantalla**: barra de acción `sticky` con métricas compactas + Entrenar
  siempre visibles; biblioteca convertida en cajón con scroll propio (`max-height: 40vh`).
  Página de 1.575px → **1.302px**, y "Entrenar" visible en *todas* las posiciones de scroll.
- **Causa raíz encontrada**: `global.css` pone `overflow-x: hidden` en `<body>`, lo que hace que
  el eje vertical compute a `auto`; el body pasa a ser contenedor de scroll y **ningún `sticky`
  se ancla al viewport**. Corregido solo en la página del Constructor.
- **Breakpoints reales** (900px táctil, 640px teléfono) y `prefers-reduced-motion` respetado.

**Por tramo**
- Nuevos `logic/tramo-config.ts` (huecos, etapas, objetivos y textos por tramo),
  `stores/tramo.ts` (resuelve el tramo del hijo/a activo) y `utils/pieceText.ts` (vocabulario).
- `Piece` gana `tramos`, `stageByTramo`, `nameByTramo`, `tooltipByTramo`.
- **8-9**: 3 huecos, 3 etapas, vocabulario infantil ("Cerebro que adivina", "Escudo protector")
  y cierre propio — antes ganaba con *"La Singularidad ha despertado"*.
- **10-11**: 5 huecos, 4 etapas, objetivos y textos propios.
- **12-14**: intacto (5 huecos, 5 etapas, vocabulario técnico original).

**Bug de fondo encontrado al validar la jugabilidad**
Una pieza cuyo prerrequisito ocupa **el mismo hueco único** no puede colocarse jamás. Afectaba a
6 piezas (`p_cleaning`, `p_context_window`, `p_memory`, `p_probabilities`, `p_moe`,
`p_auto_alignment`) — incluida la que C0 creyó arreglar, que seguía muerta. Prerrequisitos
imposibles eliminados; la simulación confirma que los 3 tramos son ganables.

**Verificación**: `astro check` 0/0, build verde (88 páginas), viaje completo jugado e2e con
**Leo (8-9)** hasta la victoria, y comprobación de huecos/objetivos con **Marta (10-11)** y
**Hugo (12-14)**.

### ✅ Fase C5 · Sistema de diseño: migrar a tokens · HECHO (2026-07-29)

`constructor.css` era un segundo sistema de diseño paralelo: 22 variables con valores
literales que ningún cambio de marca alcanzaba nunca.

- **Paleta derivada de los tokens**: las 22 variables pasan a ser alias de los semánticos
  `--k-*` (`--bg-main` → `--k-bg-page`, `--primary` → `--k-brand-primary`, los 5 colores de
  categoría → primitivos de marca/estado). Se conservan los *nombres* viejos para no
  reescribir 4.900 líneas de componentes de golpe, pero los *valores* ya vienen del sistema.
- **Fuera Google Fonts**: el `@import` remoto era redundante —el Layout ya autoaloja Outfit
  con `@fontsource`— pero seguía pidiendo la fuente a Google en cada carga, con la IP del
  niño. Verificado: **0 referencias a `fonts.googleapis`/`gstatic` en `dist/`**.
- **Pesos reales, sin *faux bold***: el Constructor usaba 500/700/900, que el Layout no
  carga. Se importa el 700 (peso dominante) en la página y se normalizan 500→600 y
  900→800 sobre la escala del sistema.
- **27 colores hardcodeados** sustituidos por tokens. Entre ellos, el anillo de foco usaba
  `rgba(146,151,254,…)` —un primario azulado antiguo— que ya no coincidía con el cian de
  marca.

**Contraste AA verificado por token** sobre el panel: los 8 colores pasan AA de texto
(cian 9.80:1, magenta 7.20, ámbar 10.61, verde 10.17, violeta 9.60, texto 16.17, apagado 6.91).
Dos correcciones a raíz de medirlo:
- `--color-5` (Salida) se queda en 4.18:1 con `violet-500` → sube a `violet-300` (9.60:1).
- El nombre del hueco vacío se pintaba a `opacity: 0.5`, ilegible: sube a 0.8.

*Nota:* la migración cambia ligeramente dos colores de categoría (verde y violeta se
aclaran). Es el efecto buscado al adoptar el sistema, y en ambos casos **mejora** el
contraste sobre el fondo oscuro.


---

## 4. Cambios técnicos principales

- `types.ts`: `Piece.tramos`, `nameByTramo?`, `tooltipByTramo?`; `GameState.aiName?`.
- `data/pieces.ts`: etiquetar `tramos`; vocabulario por tramo.
- `logic/rules.ts`: objetivos y `canTrain` parametrizados por tramo.
- `stores/game.ts`: hooks de integración (chispas/eventos/celebración/cuaderno); persistencia por
  niño vía `sync-service`.
- Nuevo `logic/diagnostics.ts`: estados de fallo y veredictos.
- Nuevo `components/BeforeAfterPanel.svelte` y `components/MobileActionBar.svelte`.
- Nuevo `utils/dragPointer.ts`: arrastre unificado ratón/táctil.
- `styles/constructor.css`: remapeo a tokens `--k-`, fuente autoalojada, reduced-motion.

---

## 5. Insignias del Constructor (implementadas)

| id | nombre | icono | cómo se consigue |
|----|--------|-------|------------------|
| `constructor-arquitecto` | Arquitecto de Datos | 🧱 | Completa la primera etapa. |
| `constructor-entrenador` | Entrenador Paciente | 🎯 | Entrena con éxito 3 veces. |
| `constructor-seguro` | Constructor Seguro | 🛡️ | Coloca el escudo protector. |
| `constructor-ia-completa` | Creador de IA | 🤖 | Completa todas las etapas de su tramo. |
| `constructor-responsable` | Constructor Responsable | ⚖️ | Responde asumiendo la responsabilidad ante Morti (12-14) o la Dra. Vael (10-11). |

Todas viven en `logic/progression.ts` y aparecen en `/insignias` bajo el Nivel 4.

----|--------|-------|------------------|
| `arquitecto-datos` | Arquitecto de Datos | 🧱 | Completa la etapa de Datos con limpieza + etiquetas. |
| `domador-overfitting` | Domador del Overfitting | 🛡️ | Detecta y corrige un overfitting (10-11, 12-14). |
| `entrenador-paciente` | Entrenador Paciente | 🎯 | Entrena 3 veces mejorando la precisión cada vez. |
| `constructor-responsable` | Constructor Responsable | ⚖️ | Supera el dilema de Morti antes de terminar (12-14). |
| `ia-completa` | Creador de IA | 🤖 | Completa todas las etapas de su tramo. |

---

## 6. Orden recomendado

**C0 ✅ → C4 ✅ → C1 ✅ → C2 ✅ → C3 ✅ → C5 ✅ — plan completo.**

Cambio de orden respecto a la v1 del plan: **C4 (adaptación) sube justo detrás de C0**, porque
contiene los dos 🔴 que impiden *jugar* hoy — sin táctil ni bucle en pantalla, en tablet y móvil el
Constructor no es usable, y verificar C1/C2 sobre una base injugable es trabajo perdido. El gateo de
`DevPanel` (C3) conviene adelantarlo a C4 por ser una línea y tener impacto en producción.

Después: C1 (deja de ser isla) → C2 (el núcleo de "cómo se mejora una IA") → C3 (coherencia visual
completa) → C5 (narrativa y ética).
