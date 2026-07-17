# 04 · Gamificación

## 0. Qué hay hoy (inventario)

| Mecánica | Dónde | Estado |
|----------|-------|--------|
| Insignias por misión (con quiz como gate en legacy) | `storage.badges`, `insignias.astro`, `Quiz.astro`, `UnidadService.awardBadge` | ✅ Funciona, pero es la única recompensa |
| Progreso global (%) | barra del mapa | ⚠️ Un número plano; no comunica estructura |
| Desbloqueo secuencial | `data-req` (badge previa) + `dependeDe` (unidades) | ✅ |
| Palabras poderosas coleccionables | `children.vocabulary` vía `UnidadService.collectPalabras` | ⚠️ Se recogen pero **no hay ninguna pantalla para verlas** |
| Cuaderno de creaciones | `child_artifacts` | ⚠️ Igual: se guarda, apenas se re-visita |
| Galería con moderación | `laboratorio/galeria.astro` | ✅ Buena mecánica social segura (con el agujero RLS de [06](06-auditoria-rls.md) pendiente) |
| Misiones en familia | `children.family_missions_completed` | ⚠️ Sin recompensa ni rastro visible |
| Feedback de acierto (confeti/shake) | solo en actividades "clasificar" del motor legacy | ⚠️ Inconsistente entre motores |
| "Modo profundo" | toggle en el mapa | ❌ Jerga adulta, sin integración con nada |

**Diagnóstico:** hay materia prima muy buena (colecciones, creaciones, familia,
galería) pero está **desconectada**: el niño acumula cosas que nunca vuelve a ver,
la única moneda es la insignia, y no existe motivo para volver mañana. Falta el
**bucle**: jugar → recompensa visible → progreso hacia algo → razón para volver.

## 1. Principios (edad 8-14, producto educativo)

1. **Celebrar el proceso, no la velocidad.** Nada de rankings entre niños ni
   presión temporal. La comparación es siempre contra uno mismo.
2. **Coleccionar > competir.** A los 8-11 años el motor psicológico dominante es
   completar colecciones y personalizar.
3. **La recompensa enseña.** Cada elemento de gamificación refuerza el método
   (las palabras poderosas SON el vocabulario curricular).
4. **Racha amable.** Los streaks funcionan pero castigan; usar "racha protegida"
   (se pierde tras varios días, Vael la "guarda" una vez por semana).
5. **El padre ve el mismo sistema desde otro ángulo** (su dashboard muestra las
   creaciones y palabras del hijo, no "engagement").

## 2. El bucle central propuesto

```
        ┌─────────────────────────────────────────────┐
        ▼                                             │
  MISIÓN (15-20 min)                                  │
        │  completa                                   │
        ▼                                             │
  RECOMPENSA INMEDIATA                                │
  · Chispas (XP) + palabras + creación al Cuaderno    │
  · pantalla de celebración única                     │
        ▼                                             │
  PROGRESO VISIBLE                                    │
  · la zona del mapa se "ilumina" un paso más         │
  · nivel de inventor/a sube con las chispas          │
        ▼                                             │
  RAZÓN PARA VOLVER ──────────────────────────────────┘
  · siguiente parada visible en el mapa
  · misión en familia pendiente
  · racha de días de laboratorio
```

## 3. Mecánicas, en orden de implementación

### 3.1 Chispas (XP) y Nivel de Inventor/a — el esqueleto
- **Chispas** ⚡ por: misión completada (base), quiz aprobado (bonus), misión en
  familia (bonus alto — es lo que más queremos incentivar), palabra coleccionada,
  creación publicada en la galería.
- **Niveles de Inventor/a** con nombres del universo Kidia (Aprendiz → Explorador/a
  → Inventor/a → Maestro/a de Laboratorio → …). Subir de nivel = celebración +
  desbloqueo cosmético (ver 3.4).
- Modelo de datos: tabla `child_events` (append-only: `child_id, tipo, chispas,
  ref_id, created_at`). Los totales se derivan; esto además **resuelve la
  duplicación de progreso** señalada en la auditoría técnica (§3.2) — un solo
  ledger como fuente de verdad.

### 3.2 Mapa de zonas — convertir el progreso en territorio
Rediseño del mapa (junto con UX doc 02 §2.3): 4 zonas del método como regiones de
un mapa vertical; cada misión es una parada en el camino; la zona se colorea al
completarse; la misión especial es el "jefe amistoso" que cierra la zona y otorga
una insignia de zona destacada. El avatar del hijo aparece **en** el mapa ("estás
aquí"). El % global desaparece a favor de "Zona 2: 3 de 4 paradas".

### 3.3 Racha de laboratorio (amable)
Días con al menos una actividad (misión, repaso de palabras, visita a la galería…
cualquier cosa cuenta). Contador visible en el header del Modo Aventura con la
mascota. Protección: no se rompe hasta 3 días sin entrar, y Vael puede "congelarla"
una vez por semana. Nunca se muestra en negativo ("¡Racha de 4 días!" — jamás
"has perdido tu racha").

### 3.4 Personalización del avatar/laboratorio — el sumidero de chispas
Las chispas se **gastan** en cosméticos: accesorios del avatar, decoración del
laboratorio personal del niño (marcos para el Cuaderno, fondos, mascotas de
escritorio). Sin economía real, sin compras — solo chispas ganadas. Es el motor de
retención más potente a estas edades y da sentido económico al XP.

### 3.5 Colecciones vivas
- **Diccionario de Palabras Poderosas:** pantalla propia (hoy `child_words` no se
  ve en ningún sitio) con las palabras como cartas coleccionables por zona; las que
  faltan aparecen como siluetas ("¿?"). Toca una carta → definición + audio.
- **Cuaderno de Inventos:** galería personal de `child_artifacts` con la creación
  navegable y compartible con la familia. Portada personalizable (3.4).
- **Insignias v2:** cada insignia no ganada muestra **cómo conseguirla** y desde
  dónde; las de zona son visualmente mayores. Fusionar con el catálogo actual.

### 3.6 Misiones en familia con rastro
Al completarlas: bonus de chispas + "foto de familia" en el Cuaderno (el texto de
lo que pasó) + contador de misiones en familia en el panel de padres. El padre las
ve pendientes en su dashboard — el recordatorio llega por el canal adulto, no
interrumpiendo al niño.

### 3.7 Reemplazo del "Modo profundo"
El toggle actual desaparece. El concepto se recicla como **"Reto extra de Vael"**:
al terminar una misión con quiz perfecto, Vael ofrece una pregunta difícil opcional
por chispas extra. Mismo objetivo (profundizar), integrado en el bucle y con
lenguaje de niño.

## 4. Qué NO hacer

- ❌ Leaderboards entre niños o entre familias.
- ❌ Temporizadores/cuenta atrás en actividades de aprendizaje.
- ❌ Recompensas variables tipo caja sorpresa (loot boxes) — regulatoriamente y
  éticamente tóxico en menores.
- ❌ Notificaciones de presión al niño; los "recordatorios" van al padre.
- ❌ Comprar chispas con dinero.

## 5. Sistema de celebración unificado

Un solo componente `Celebration` (doc 03 §3) con 3 intensidades:
1. **Micro** (acierto en actividad): pop + 3 partículas, 400ms.
2. **Media** (misión completada, palabra nueva): pantalla parcial, Vael celebra, contador de chispas sube animado.
3. **Grande** (zona completa, subida de nivel, insignia de zona): pantalla completa, confeti, sonido opcional.

Todas respetan `prefers-reduced-motion` (versión estática con el mismo contenido).

## 6. Métricas para saber si funciona

Con `child_events` salen gratis: misiones/semana por hijo, % que completa la misión
1.1 → 1.2 (activación), retención D7/D30, % de misiones en familia completadas,
chispas gastadas (salud del sumidero). Definir baseline antes de la Fase 3 del
roadmap para poder medir el efecto.
