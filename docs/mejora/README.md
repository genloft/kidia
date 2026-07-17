# Plan de Mejora Integral de Kidia

> Fecha de la auditoría: 16 de julio de 2026
> Alcance: revisión completa del código, la UX, el diseño visual y la gamificación.

Esta carpeta es la documentación de trabajo para la mejora completa del proyecto.
Cada documento es independiente pero están ordenados: la numeración indica el
orden de lectura recomendado, no necesariamente el orden de ejecución (ese está
en el roadmap).

## Índice

| Doc | Contenido |
|-----|-----------|
| [01-auditoria-tecnica.md](01-auditoria-tecnica.md) | Estado del código, arquitectura, deuda técnica, riesgos y correcciones priorizadas |
| [02-auditoria-usabilidad.md](02-auditoria-usabilidad.md) | Problemas de UX por pantalla y por audiencia (niño 8-14 / padre), con propuestas |
| [03-sistema-diseno.md](03-sistema-diseno.md) | Especificación del sistema de diseño Kidia: tokens, componentes, voz, accesibilidad |
| [04-gamificacion.md](04-gamificacion.md) | Diagnóstico del sistema actual y diseño del sistema de gamificación completo |
| [05-roadmap.md](05-roadmap.md) | Plan de ejecución por fases, con dependencias y criterios de "hecho" |
| [06-auditoria-rls.md](06-auditoria-rls.md) | Auditoría de seguridad RLS en Supabase (Fase 0) — incluye un hallazgo crítico |

## Resumen ejecutivo (TL;DR)

**Lo que está bien:** el contenido pedagógico del tramo 8-9 (16 unidades-aventura +
4 misiones especiales) es sólido y el motor `unidad-engine.ts` está limpio. El modelo
de datos (familia → hijos → tramo por edad → suscripción familiar) refleja el plan
de negocio real. El repo tiene un historial de commits cuidado.

**Los 3 problemas estructurales:**

1. **Hosting estático vs. rutas de servidor.** El build es estático (Hostinger) pero
   `/api/chat` y `/api/checkout` son endpoints POST que no funcionan en producción.
   Todo lo que dependa de IA real, moderación con modelo o pago real está bloqueado
   por esta decisión de infraestructura. Es la decisión nº 1 a tomar.
2. **Dos generaciones de producto conviviendo.** El tramo 8-9 usa el formato nuevo
   (unidad-aventura, 16 unidades) y los tramos 10-11 y 12-14 siguen en el formato
   viejo (scenario/chat, solo 4 unidades por tramo). El mapa, las insignias y el
   progreso mezclan ambos mundos. La experiencia es inconsistente según la edad del hijo.
3. **No hay sistema de diseño.** Hay ~30 variables CSS en `global.css` pero 177+
   colores hardcodeados repartidos por páginas y componentes, botones redefinidos
   en cada página y ningún componente compartido de UI. Cada mejora visual hoy cuesta
   N páginas en vez de 1 token.

**Por dónde empezar (propuesta):** ver [05-roadmap.md](05-roadmap.md). En corto:
Fase 0 (limpieza + decisión de hosting) → Fase 1 (sistema de diseño como fundación) →
Fase 2 (usabilidad núcleo: mapa + flujo del niño) → Fase 3 (gamificación) →
Fase 4 (paridad de tramos 10-11 / 12-14).

**Principio rector:** el tramo 8-9 es el único nivel realmente desarrollado y actúa
como piloto — las Fases 1-3 se ejecutan y pulen sobre él, y solo entonces la Fase 4
replica todo lo conseguido a 10-11 y 12-14 (ver detalle en el roadmap).
