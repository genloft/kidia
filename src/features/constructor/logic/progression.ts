// Conexión del Constructor con la progresión de Kidia (docs/mejora/07-constructor-plan.md, Fase C1).
//
// Hasta ahora el Constructor era una isla: un niño podía construir una IA
// entera y su perfil no se enteraba —ni chispas, ni insignias, ni Cuaderno—.
// Aquí se registran los hechos del juego en el mismo ledger (`child_events`)
// y el mismo array `children.badges` que usan las unidades-aventura.
//
// Todo es "mejor esfuerzo": si no hay sesión, hijo/a activo o tablas, el
// juego sigue siendo jugable y solo se pierde el registro.

import type { TramoId } from '../../../lib/tramos';
import type { GameState, Metrics, StageId } from '../types';
import { getTramoConfig } from './tramo-config';

export interface InsigniaConstructor {
    id: string;
    name: string;
    icon: string;
    description: string;
    earnHint: string;
}

// Insignias del Constructor. Son comunes a los tres tramos (cada niño las
// gana en el viaje de su edad), para que /insignias no se llene de variantes.
export const INSIGNIAS_CONSTRUCTOR: InsigniaConstructor[] = [
    {
        id: 'constructor-arquitecto',
        name: 'Arquitecto de Datos',
        icon: '🧱',
        description: 'Montó su primera cadena completa: datos, cerebro y salida.',
        earnHint: 'Completa la primera etapa del Constructor'
    },
    {
        id: 'constructor-entrenador',
        name: 'Entrenador Paciente',
        icon: '🎯',
        description: 'Entrenó su modelo una y otra vez hasta que mejoró.',
        earnHint: 'Entrena con éxito 3 veces en el Constructor'
    },
    {
        id: 'constructor-seguro',
        name: 'Constructor Seguro',
        icon: '🛡️',
        description: 'No dejó suelta su IA: le puso un escudo protector.',
        earnHint: 'Coloca el escudo protector en el Constructor'
    },
    {
        id: 'constructor-ia-completa',
        name: 'Creador de IA',
        icon: '🤖',
        description: 'Construyó una IA completa, etapa a etapa, hasta el final.',
        earnHint: 'Completa todas las etapas del Constructor'
    },
    {
        id: 'constructor-responsable',
        name: 'Constructor Responsable',
        icon: '⚖️',
        description: 'Se hizo cargo de su IA: respondió a la pregunta difícil sin escurrir el bulto.',
        earnHint: 'Responde asumiendo la responsabilidad de tu IA (10-11 y 12-14)'
    }
];

// Chispas por hecho. Calibrado contra la economía existente
// (mision_completada 10, mision_familia 20): una etapa vale menos que una
// misión, y terminar la IA entera vale como una misión en familia.
export const CHISPAS_ETAPA = 5;
export const CHISPAS_IA_COMPLETA = 20;

/** id estable del hecho, para que rejugar no vuelva a dar chispas. */
function refEtapa(tramo: TramoId, stage: StageId): string {
    return `constructor:${tramo}:etapa-${stage}`;
}

async function contexto() {
    if (typeof window === 'undefined') return null;
    try {
        const [{ activeChild }, chispas, unidad] = await Promise.all([
            import('../../../lib/active-child'),
            import('../../../lib/chispas-service'),
            import('../../../lib/unidad-service')
        ]);
        const childId = activeChild.get();
        if (!childId) return null;
        return { childId, ChispasService: chispas.ChispasService, UnidadService: unidad.UnidadService };
    } catch (error) {
        console.error('[Constructor] no se pudo cargar la progresión:', error);
        return null;
    }
}

async function otorgarInsignia(id: string): Promise<boolean> {
    const ctx = await contexto();
    if (!ctx) return false;
    try {
        const insignia = INSIGNIAS_CONSTRUCTOR.find(i => i.id === id);
        await ctx.UnidadService.awardBadge(ctx.childId, id);
        // Las insignias también puntúan, igual que en unidad-aventura.
        await ctx.ChispasService.logEvent(ctx.childId, 'insignia_ganada', id, 15);
        if (insignia) {
            const { celebrate } = await import('../../../lib/celebration');
            celebrate('media', { mensaje: `¡Insignia conseguida! ${insignia.icon} ${insignia.name}` });
        }
        return true;
    } catch (error) {
        console.error('[Constructor] no se pudo otorgar la insignia:', error);
        return false;
    }
}

/**
 * Insignia del momento ético (Fase C3). Se otorga aparte porque no depende
 * del tablero sino de cómo respondió el niño a Morti o a la Dra. Vael.
 */
export async function otorgarInsigniaEtica(): Promise<void> {
    await otorgarInsignia('constructor-responsable');
}

/** Insignias que corresponden al estado actual del tablero. */
export function insigniasMerecidas(
    state: GameState,
    tramo: TramoId,
    entrenamientosConExito: number
): string[] {
    const ganadas: string[] = [];
    const colocadas = Object.values(state.placements).filter(Boolean) as string[];
    const maxStage = getTramoConfig(tramo).maxStage;

    if (state.currentStage > 1 || state.hasWonGame) ganadas.push('constructor-arquitecto');
    if (entrenamientosConExito >= 3) ganadas.push('constructor-entrenador');
    if (colocadas.includes('p_guardrails')) ganadas.push('constructor-seguro');
    if (state.hasWonGame || state.currentStage >= maxStage) {
        // Solo al ganar de verdad, no por llegar a la última etapa.
        if (state.hasWonGame) ganadas.push('constructor-ia-completa');
    }
    return ganadas;
}

/** Etapa superada: chispas + evento idempotente. */
export async function registrarEtapaCompletada(tramo: TramoId, stage: StageId): Promise<void> {
    const ctx = await contexto();
    if (!ctx) return;
    try {
        const { otorgadas } = await ctx.ChispasService.logEvent(
            ctx.childId, 'constructor_etapa', refEtapa(tramo, stage), CHISPAS_ETAPA
        );
        if (otorgadas > 0) {
            const { celebrate } = await import('../../../lib/celebration');
            celebrate('micro', { mensaje: `+${otorgadas} chispas ⚡` });
        }
    } catch (error) {
        console.error('[Constructor] no se pudo registrar la etapa:', error);
    }
}

/** Insignias pendientes según el estado; otorga solo las que falten. */
export async function sincronizarInsignias(
    state: GameState,
    tramo: TramoId,
    entrenamientosConExito: number,
    yaOtorgadas: Set<string>
): Promise<string[]> {
    const merecidas = insigniasMerecidas(state, tramo, entrenamientosConExito);
    const nuevas = merecidas.filter(id => !yaOtorgadas.has(id));
    for (const id of nuevas) {
        await otorgarInsignia(id);
        yaOtorgadas.add(id);
    }
    return nuevas;
}

/**
 * IA terminada: la guarda en el Cuaderno de Inventos con el nombre que le
 * ponga el niño, registra el hecho y celebra a lo grande.
 */
export async function registrarIACompletada(
    tramo: TramoId,
    state: GameState,
    metrics: Metrics,
    nombre: string
): Promise<{ guardada: boolean }> {
    const ctx = await contexto();
    if (!ctx) return { guardada: false };

    try {
        // El Cuaderno lo lee el niño (y su familia): se guardan nombres
        // legibles del tramo, no ids internos como "p_dataset_large".
        const { PIECES } = await import('../data/pieces');
        const { pieceName } = await import('../utils/pieceText');
        const piezas: Record<string, string> = {};
        for (const [hueco, pieceId] of Object.entries(state.placements)) {
            if (!pieceId) continue;
            const pieza = PIECES.find(p => p.id === pieceId);
            if (pieza) piezas[hueco] = pieceName(pieza, tramo);
        }

        await ctx.UnidadService.saveArtifact(
            ctx.childId,
            `constructor-${tramo}`,
            'ia_construida',
            {
                nombre: nombre.trim() || 'Mi IA',
                'con qué la construí': piezas,
                precisión: metrics.accuracy,
                velocidad: metrics.performance,
                dificultad: metrics.complexity
            }
        );
        await ctx.ChispasService.logEvent(
            ctx.childId, 'constructor_ia', `constructor:${tramo}:completa`, CHISPAS_IA_COMPLETA
        );
        return { guardada: true };
    } catch (error) {
        console.error('[Constructor] no se pudo guardar la IA construida:', error);
        return { guardada: false };
    }
}
