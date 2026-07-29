import type { TramoId } from '../../lib/tramos';

export type StageId = 1 | 2 | 3 | 4 | 5;

// Analogías infantiles de los Slots
export type SlotCategory = 'Datos' | 'Cerebro' | 'Entrenamiento' | 'Examen' | 'Salida';

export interface Metrics {
    accuracy: number;
    performance: number;
    complexity: number;
}

export interface Piece {
    id: string;
    name: string;
    stage: StageId;
    category: SlotCategory;
    recommendedSlot: SlotCategory;
    prerequisites?: string[]; // Array of Piece IDs required to be placed first
    effects: Partial<Metrics>; // Metrics to add when placed/trained
    tooltip: string;
    curiousFact: string;

    // --- Adaptación por tramo de edad (ver logic/tramo-config.ts) ---
    // Tramos en los que la pieza aparece. Si falta, la pieza es solo de 12-14
    // (el catálogo original se escribió con ese vocabulario).
    tramos?: TramoId[];
    // Algunas piezas entran antes o después según el tramo: el viaje de 8-9
    // tiene 3 etapas y el de 12-14 cinco, así que la misma pieza puede caer
    // en etapas distintas.
    stageByTramo?: Partial<Record<TramoId, StageId>>;
    // Vocabulario adaptado: "Capas Ocultas" no significa nada a los 8 años.
    nameByTramo?: Partial<Record<TramoId, string>>;
    tooltipByTramo?: Partial<Record<TramoId, string>>;
}

export interface Placement {
    slotId: SlotCategory;
    pieceId: string;
}

export interface GameState {
    version: number;
    currentStage: StageId;
    unlockedPieces: string[];
    placements: Partial<Record<SlotCategory, string>>;
    selectedPieceId?: string; // Newly added
    isTraining?: boolean;
    hasSeenSingularityModal?: boolean;
    hasSeenIntroTour?: boolean; // NEW
    hasSeenWelcomeModal?: boolean;
    hasWonGame?: boolean;
    stageIntroAck?: boolean;
    // Métricas del entrenamiento anterior, para poder contar qué cambió
    // desde entonces (Fase C2: el antes/después es lo que enseña a mejorar).
    lastTrainedMetrics?: Metrics;
    baseMetrics: Metrics;
    logs: LogEvent[];
}

export interface LogEvent {
    id: string;
    timestamp: number;
    message: string;
    type: 'info' | 'success' | 'warn' | 'error';
}

export interface StageObjective {
    id: string;
    description: string;
    isMet: (state: GameState, currentMetrics: Metrics) => boolean;
}
