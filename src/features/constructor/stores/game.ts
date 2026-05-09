import { writable, derived, get } from 'svelte/store';
import type { GameState, SlotCategory, StageId, Piece } from '../types';
import { loadState, saveState, clearState } from '../logic/storage';
import * as rules from '../logic/rules';
import { PIECES } from '../data/pieces';
import { t } from './i18n';

const DEFAULT_STATE: GameState = {
    version: 1,
    currentStage: 1,
    unlockedPieces: rules.getUnlockedPieces(1),
    placements: {},
    baseMetrics: { accuracy: 0, performance: 0, complexity: 0 },
    logs: [],
    hasSeenIntroTour: false,
    hasSeenWelcomeModal: false,
    hasWonGame: false,
    stageIntroAck: true
};

export const showSingularityModal = writable(false);
export const showWelcomeModal = writable(false);
export const showVictoryModal = writable(false);
export const pieceFeedback = writable<{ piece: Piece | null; slot: SlotCategory | null; visible: boolean }>({ piece: null, slot: null, visible: false });

function createGameStore() {
    // Initialize from storage or default
    const state = writable<GameState>(typeof window !== 'undefined' ? loadState() : DEFAULT_STATE);

    // Persist changes with debounce to avoid excessive writes
    let saveTimeout: ReturnType<typeof setTimeout>;
    state.subscribe(value => {
        if (typeof window === 'undefined') return;
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveState(value);
        }, 500);
    });

    const logEvent = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
        state.update(s => {
            const newLog = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: Date.now(),
                message,
                type
            };
            return { ...s, logs: [...s.logs.slice(-20), newLog] }; // Mantener últimos 20
        });
    };

    return {
        subscribe: state.subscribe,
        set: state.set,
        update: state.update,

        selectPiece: (pieceId: string | undefined) => {
            state.update(s => ({ ...s, selectedPieceId: pieceId }));
        },

        placePiece: (slot: SlotCategory, pieceId: string) => {
            const _t = get(t);
            const piece = PIECES.find(p => p.id === pieceId);
            if (!piece) return;

            let logToDispatch: { msg: string, type: 'info' | 'success' | 'warn' | 'error' } | null = null;

            state.update(s => {
                const reqs = rules.validateRequirements(piece, s.placements);
                if (!reqs.valid) {
                    logToDispatch = { msg: `${_t.game?.cantUse || "No se puede usar"} "${_t.pieces?.[piece.name]?.name || piece.name}": ${reqs.reason}`, type: 'warn' };
                    return s;
                }

                // Check if piece already exists in another slot, remove it first
                for (const [key, id] of Object.entries(s.placements)) {
                    if (id === pieceId) {
                        s.placements[key as SlotCategory] = undefined;
                    }
                }

                s.placements[slot] = pieceId;

                let effectsText = [];
                if (piece.effects) {
                    if (piece.effects.accuracy) effectsText.push(`${_t.accuracy || 'Precisión'} ${piece.effects.accuracy > 0 ? '+' : ''}${piece.effects.accuracy}`);
                    if (piece.effects.performance) effectsText.push(`${_t.speed || 'Rendimiento'} ${piece.effects.performance > 0 ? '+' : ''}${piece.effects.performance}`);
                    if (piece.effects.complexity) effectsText.push(`${_t.difficulty || 'Complejidad'} ${piece.effects.complexity > 0 ? '+' : ''}${piece.effects.complexity}`);
                }
                const effectStr = effectsText.length > 0 ? ` [${_t.tut?.impact || 'Impacto'}: ${effectsText.join(', ')}]` : '';
                logToDispatch = { msg: `${_t.game?.installedLog || "Instalaste"} ${_t.pieces?.[piece.id]?.name || piece.name}. ${_t.pieces?.[piece.id]?.tooltip || piece.tooltip}${effectStr}`, type: 'info' };

                return s;
            });

            if (logToDispatch) {
                const log = logToDispatch as { msg: string, type: 'info' | 'warn' | 'success' | 'error' };
                logEvent(log.msg, log.type);
            }

            // Show floating assistant explanation after state settles
            setTimeout(() => {
                pieceFeedback.set({ piece, slot, visible: true });
            }, 50);
        },

        removePiece: (slot: SlotCategory) => {
            const _t = get(t);
            let pName = slot;
            let shouldLog = false;

            state.update(s => {
                const pId = s.placements[slot];
                if (pId) {
                    const p = PIECES.find(x => x.id === pId);
                    if (p) {
                        pName = _t.pieces?.[p.id]?.name || p.name || slot;
                        shouldLog = true;
                    }
                }
                s.placements[slot] = undefined;
                return s;
            });

            if (shouldLog) {
                logEvent(`${_t.game?.removed || "Se retiró"} ${pName}`, 'info');
            }
        },

        train: () => {
            let canTrain = false;
            let trainReason = '';
            const _t = get(t);

            state.update(s => {
                const { can, reason } = rules.canTrain(s.placements);
                canTrain = can;
                trainReason = reason || '';

                if (can) {
                    return { ...s, isTraining: true };
                }
                return s;
            });

            if (!canTrain) {
                logEvent(`${_t.game?.trainError || "Error al iniciar:"} ${trainReason}`, 'error');
                return;
            }

            logEvent(_t.game?.trainStart || 'Iniciando flujo de entrenamiento masivo...', 'info');

            setTimeout(() => {
                let evaluationNote = '';
                let successMessage = '';
                let warningMessage = '';
                let infoMessage = '';
                let newStageMessage = '';
                const _tAsync = get(t);

                state.update(s => {
                    const metrics = rules.calculateMetrics(s.placements);

                    if (s.placements.Examen === 'p_metric_basic' && s.placements.Entrenamiento) {
                        evaluationNote = ` ${_tAsync.game?.evalMeanErr || "Evaluados: Error Medio."}`;
                    }
                    if (s.placements.Examen === 'p_traintest_split') {
                        evaluationNote = ` ${_tAsync.game?.evalTest || "Evaluables en Test:"} ${metrics.accuracy}% ${_tAsync.game?.hits || "Acertados."}`;
                    }
                    successMessage = `${_tAsync.game?.trainDone || "Entrenamiento concluido."}${evaluationNote}`;

                    const check = rules.checkStageCompletion(s.currentStage, s, metrics);
                    if (check) {
                        if (s.currentStage < 5) {
                            const nextStage = s.currentStage + 1 as StageId;
                            newStageMessage = `${_tAsync.game?.advancedStage || "¡Avanzaste a la Etapa"} ${nextStage}!`;

                            let hasSeen = s.hasSeenSingularityModal;
                            if (nextStage === 5 && !hasSeen) {
                                showSingularityModal.set(true);
                                hasSeen = true;
                            }

                            return {
                                ...s,
                                isTraining: false,
                                hasSeenSingularityModal: hasSeen,
                                currentStage: nextStage,
                                unlockedPieces: rules.getUnlockedPieces(nextStage),
                                stageIntroAck: false
                            };
                        } else {
                            // Won the game!
                            showVictoryModal.set(true);
                            successMessage = _tAsync.game?.victoryTitle || "¡Victoria!";
                            return {
                                ...s,
                                isTraining: false,
                                hasWonGame: true
                            };
                        }
                    } else {
                        const objs = rules.STAGE_OBJECTIVES[s.currentStage] || [];
                        const missing = objs.filter(o => !o.isMet(s, metrics));
                        if (missing.length > 0) {
                            warningMessage = `${_tAsync.game?.trainAborted || "Entrenamiento abortado. Objetivo faltante:"} ${_tAsync.objectives?.[missing[0].id] || missing[0].description}`;
                        } else {
                            infoMessage = `${_tAsync.game?.metricsStable || 'Métricas estables.'} (Acc: ${metrics.accuracy} | Perf: ${metrics.performance})`;
                        }
                        return { ...s, isTraining: false };
                    }
                });

                // Dispatch logs outside update
                if (successMessage) logEvent(successMessage, 'success');
                if (newStageMessage) logEvent(newStageMessage, 'success');
                if (warningMessage) logEvent(warningMessage, 'warn');
                if (infoMessage) logEvent(infoMessage, 'success');
            }, 800);
        },

        advanceStage: (newStage: StageId) => {
            const _t = get(t);
            state.update(s => {
                return {
                    ...s,
                    currentStage: newStage,
                    unlockedPieces: rules.getUnlockedPieces(newStage),
                    stageIntroAck: false
                };
            });
            logEvent(`${_t.game?.advancedStage || '¡Avanzaste a la Etapa'} ${newStage}!`, 'success');
        },

        reset: () => {
            const _t = get(t);
            clearState();
            state.set({ ...DEFAULT_STATE, isTraining: false, unlockedPieces: rules.getUnlockedPieces(1) });
            logEvent(_t.game?.simReset || 'Simulación reseteada al origen.', 'warn');
        },

        completeIntroTour: () => {
            const _t = get(t);
            state.update(s => {
                return { ...s, hasSeenIntroTour: true };
            });
            logEvent(_t.game?.tourDone || 'Tour introductorio completado.', 'success');
        },

        loadState: (loaded: GameState) => {
            state.set(loaded);
        },

        initCheck: () => {
            const s = get(state);

            if (typeof window !== 'undefined') {
                const isReturning = sessionStorage.getItem('kidia-active-session');
                if (isReturning) {
                    state.update(st => ({ ...st, hasSeenWelcomeModal: true, stageIntroAck: true }));
                    const _t = get(t);
                    logEvent(_t.game?.simReset || 'Partida reseteada automáticamente al recargar la página.', 'warn');
                    // Use a browser alert for guaranteed visibility since modal was requested
                    setTimeout(() => alert(_t.game?.simReset || 'Partida reseteada automáticamente al recargar la página.'), 500);
                } else {
                    sessionStorage.setItem('kidia-active-session', 'true');
                    if (!s.hasSeenWelcomeModal) {
                        showWelcomeModal.set(true);
                    }
                }
            }
        }
    };
}

export const game = createGameStore();

// Derived store to calculate metrics reactively avoiding side-effects everywhere
export const gameMetrics = derived(game, ($game) => {
    return rules.calculateMetrics($game.placements);
});

export const stageProgress = derived([game, gameMetrics], ([$game, $metrics]) => {
    const currentObjectives = rules.STAGE_OBJECTIVES[$game.currentStage] || [];
    return currentObjectives.map(obj => ({
        id: obj.id,
        description: obj.description,
        met: obj.isMet($game, $metrics)
    }));
});
