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
