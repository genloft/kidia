import type { GameState, Metrics, Piece, StageObjective, StageId, SlotCategory } from '../types';
import type { TramoId } from '../../../lib/tramos';
import { PIECES } from '../data/pieces';
import { get } from 'svelte/store';
import { t } from '../stores/i18n';
import {
    OBJETIVOS_POR_TRAMO,
    TRAMO_POR_DEFECTO,
    getTramoConfig,
    pieceInTramo,
    stageForTramo
} from './tramo-config';

export const INITIAL_METRICS: Metrics = {
    accuracy: 0,
    performance: 100,
    complexity: 0
};

export const MAX_METRIC = 100;
export const MIN_METRIC = 0;

export function clampMetric(val: number): number {
    return Math.max(MIN_METRIC, Math.min(MAX_METRIC, val));
}

export function calculateMetrics(placements: GameState['placements']): Metrics {
    const current: Metrics = { ...INITIAL_METRICS };

    const placedPieceIds = Object.values(placements).filter(Boolean) as string[];
    const placedPieces = placedPieceIds.map(id => PIECES.find(p => p.id === id)).filter(Boolean) as Piece[];

    for (const p of placedPieces) {
        current.accuracy += p.effects.accuracy || 0;
        current.performance += p.effects.performance || 0;
        current.complexity += p.effects.complexity || 0;
    }

    current.accuracy = clampMetric(current.accuracy);
    current.performance = clampMetric(current.performance);
    current.complexity = clampMetric(current.complexity);

    return current;
}

export function validateRequirements(piece: Piece, placements: GameState['placements']): { valid: boolean; reason?: string } {
    if (!piece.prerequisites || piece.prerequisites.length === 0) {
        return { valid: true };
    }

    const missing = piece.prerequisites.filter(reqId => {
        // check if reqId is currently in ANY slot
        const isPlaced = Object.values(placements).includes(reqId);
        return !isPlaced;
    });

    if (missing.length > 0) {
        const _t = get(t);
        const missingNames = missing.map(id => _t.pieces?.[id]?.name || PIECES.find(p => p.id === id)?.name || id).join(', ');
        return { valid: false, reason: `${_t.game?.reqBefore || "Requiere que instales antes:"} ${missingNames}` };
    }

    return { valid: true };
}

export function canTrain(
    placements: Partial<Record<SlotCategory, string>>,
    tramo: TramoId = TRAMO_POR_DEFECTO
): { can: boolean; reason?: string } {
    const _t = get(t);
    if (!placements['Datos'] || !placements['Cerebro']) {
        return { can: false, reason: _t.game?.needDataBrain || "Necesitas datos y un cerebro para empezar." };
    }

    // En 8-9 el tablero no tiene hueco de Entrenamiento, así que exigirlo
    // dejaría al niño bloqueado sin manera de avanzar.
    const hayEntrenamiento = getTramoConfig(tramo).slots.includes('Entrenamiento');
    if (hayEntrenamiento && placements['Cerebro'] === 'p_model_linear' && placements['Entrenamiento'] === undefined) {
        return { can: false, reason: _t.game?.reqLabels || 'El modelo simple requiere Etiquetas (Entrenamiento) para saber qué predecir.' };
    }

    return { can: true };
}

// Objetivos por etapa
export const STAGE_OBJECTIVES: Record<StageId, StageObjective[]> = {
    1: [
        { id: '1_all_slots', description: 'Llena al menos 3 slots básicos', isMet: (st) => Object.values(st.placements).filter(Boolean).length >= 3 },
        { id: '1_acc', description: 'Logra Accuracy mayor a 30', isMet: (_, metrics) => metrics.accuracy > 30 },
        {
            id: '1_labels', description: 'Usa etiquetas o limpieza para la calidad', isMet: (st) =>
                Object.values(st.placements).includes('p_labels') || Object.values(st.placements).includes('p_cleaning')
        }
    ],
    2: [
        { id: '2_upgrade_brain', description: 'Moderniza el Cerebro (Usa Capas Ocultas)', isMet: (st) => Object.values(st.placements).includes('p_layers') },
        { id: '2_acc', description: 'Precisión mayor a 60', isMet: (_, metrics) => metrics.accuracy > 60 },
        {
            id: '2_overfitting', description: 'Impide Overfitting (Usa Split o Regularización)', isMet: (st) =>
                Object.values(st.placements).includes('p_traintest_split') || Object.values(st.placements).includes('p_regularization')
        }
    ],
    // Umbrales corregidos: el Transformer exige el Tokenizador en Datos, y esa
    // combinación topa en 85 de precisión y 70 de complejidad. Pedir ">85" y
    // ">70" hacía la etapa 3 literalmente imposible de superar.
    3: [
        { id: '3_transformer', description: 'Usa Modelo Transformer', isMet: (st) => Object.values(st.placements).includes('p_model_transformer') },
        { id: '3_acc', description: 'Precisión de 80 o más', isMet: (_, metrics) => metrics.accuracy >= 80 },
        { id: '3_complex', description: 'Complejidad alta (60 o más)', isMet: (_, metrics) => metrics.complexity >= 60 }
    ],
    4: [
        { id: '4_human', description: 'Agrega feedback humano (RLHF)', isMet: (st) => Object.values(st.placements).includes('p_rlhf') },
        { id: '4_safe', description: 'Implementa filtros (Guardrails)', isMet: (st) => Object.values(st.placements).includes('p_guardrails') },
        { id: '4_acc', description: 'Llega al 100% de Precisión', isMet: (_, metrics) => metrics.accuracy >= 100 }
    ],
    5: [
        { id: '5_compute', description: 'Poder de Cómputo Exaescala', isMet: (st) => Object.values(st.placements).includes('p_exascale') },
        { id: '5_recursive', description: 'Mejora Recursiva', isMet: (st) => Object.values(st.placements).includes('p_recursive_improvement') },
        { id: '5_singularity', description: 'Complejidad Absoluta (Límite 100)', isMet: (_, metrics) => metrics.complexity >= 100 }
    ]
};

/**
 * Objetivos de una etapa para un tramo. 12-14 usa el catálogo original;
 * 8-9 y 10-11 tienen los suyos, con umbrales alcanzables usando solo las
 * piezas que existen en su tramo.
 */
export function getObjectives(stage: StageId, tramo: TramoId = TRAMO_POR_DEFECTO): StageObjective[] {
    const propios = OBJETIVOS_POR_TRAMO[tramo];
    if (propios) return propios[stage] || [];
    return STAGE_OBJECTIVES[stage] || [];
}

export function checkStageCompletion(
    stage: StageId,
    state: GameState,
    metrics: Metrics,
    tramo: TramoId = TRAMO_POR_DEFECTO
): boolean {
    const objectives = getObjectives(stage, tramo);
    if (objectives.length === 0) return true;
    return objectives.every(obj => obj.isMet(state, metrics));
}

// Piezas desbloqueadas para una etapa y tramo: la etapa de entrada puede
// variar por tramo y las piezas fuera del tramo no se ofrecen.
export function getUnlockedPieces(currentStage: StageId, tramo: TramoId = TRAMO_POR_DEFECTO): string[] {
    return PIECES
        .filter(p => pieceInTramo(p, tramo) && stageForTramo(p, tramo) <= currentStage)
        .map(p => p.id);
}
