
import type { GameState } from '../types';
import { INITIAL_METRICS, getUnlockedPieces } from './rules';

const CURRENT_VERSION = 1;

export const DEFAULT_STATE: GameState = {
    version: CURRENT_VERSION,
    currentStage: 1,
    unlockedPieces: getUnlockedPieces(1),
    placements: {
        Datos: undefined,
        Cerebro: undefined,
        Entrenamiento: undefined,
    },
    hasSeenIntroTour: false,
    baseMetrics: { ...INITIAL_METRICS },
    logs: []
};

// Guardas SSR: usar funciones de storage seguras
export function saveState(state: GameState): void {
    // Intentionally left blank. We no longer save to localStorage so the game resets on refresh.
}

export function loadState(): GameState {
    return { ...DEFAULT_STATE };
}

export function clearState(): void {
    // Intentionally left blank.
}
