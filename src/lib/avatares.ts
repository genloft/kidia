import { NIVELES_INVENTOR } from './chispas-service';

/**
 * Catálogo de avatares (doc 04 §3.4, v1 pequeña): 8 emojis, dos libres y el
 * resto desbloqueados por Nivel de Inventor/a. Decisión v1: desbloqueo por
 * nivel en vez de "gastar" chispas — el ledger es append-only (nadie
 * reescribe el pasado) y una economía de gasto necesitaría eventos de débito
 * o una columna de saldo; cuando llegue el laboratorio personalizable
 * completo (v2) se decidirá esa mecánica. Mientras, el avatar da un motivo
 * visible para querer subir de nivel, que es el 80 % del valor.
 *
 * Se guarda el emoji directamente en children.avatar (columna que ya
 * existía y que el selector de perfiles ya lee con fallback a la inicial).
 */

export interface AvatarCatalogEntry {
    emoji: string;
    nombre: string;
    /** Nombre del nivel de NIVELES_INVENTOR que lo desbloquea; null = libre. */
    nivelRequerido: string | null;
}

export const AVATARES: AvatarCatalogEntry[] = [
    { emoji: '🦊', nombre: 'Zorro curioso', nivelRequerido: null },
    { emoji: '🐙', nombre: 'Pulpo inventor', nivelRequerido: null },
    { emoji: '🦉', nombre: 'Búho sabio', nivelRequerido: 'Explorador/a' },
    { emoji: '🚀', nombre: 'Cohete', nivelRequerido: 'Explorador/a' },
    { emoji: '🤖', nombre: 'Robot amigo', nivelRequerido: 'Inventor/a' },
    { emoji: '🐲', nombre: 'Dragón de laboratorio', nivelRequerido: 'Inventor/a' },
    { emoji: '🧪', nombre: 'Poción viva', nivelRequerido: 'Maestro/a de Laboratorio' },
    { emoji: '🌟', nombre: 'Estrella legendaria', nivelRequerido: 'Leyenda del Laboratorio' },
];

/** ¿Este avatar está desbloqueado para un total de chispas dado? */
export function avatarDesbloqueado(avatar: AvatarCatalogEntry, chispasTotal: number): boolean {
    if (!avatar.nivelRequerido) return true;
    const nivel = NIVELES_INVENTOR.find(n => n.nombre === avatar.nivelRequerido);
    if (!nivel) return true; // nombre desconocido: no castigar al niño por un typo del catálogo
    return chispasTotal >= nivel.desde;
}
