import { writable, derived, get } from 'svelte/store';
import type { GameState, SlotCategory, StageId, Piece } from '../types';
import { loadState, saveState, clearState } from '../logic/storage';
import * as rules from '../logic/rules';
import { getTramoConfig } from '../logic/tramo-config';
import { PIECES } from '../data/pieces';
import { t } from './i18n';
import { tramo } from './tramo';
import { pieceName } from '../utils/pieceText';
import { registrarEtapaCompletada, sincronizarInsignias, otorgarInsigniaEtica } from '../logic/progression';
import { construirResultado, type ResultadoEntrenamiento } from '../logic/diagnostics';
import { interlocutorPara } from '../logic/etica';

// Progresión (Fase C1): entrenamientos con éxito e insignias ya otorgadas en
// esta sesión, para no repetir la concesión ni la celebración.
let entrenamientosConExito = 0;
const insigniasOtorgadas = new Set<string>();

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
// Resultado del último entrenamiento: qué cambió y qué le pasa al modelo
// (Fase C2). null = no hay nada que mostrar.
export const trainResult = writable<ResultadoEntrenamiento | null>(null);
// Momento ético previo a la victoria (Fase C3): en 12-14 pregunta Morti, en
// 10-11 la Dra. Vael. En 8-9 no se abre nunca.
export const showEticaModal = writable(false);
export const pieceFeedback = writable<{ piece: Piece | null; slot: SlotCategory | null; visible: boolean }>({ piece: null, slot: null, visible: false });

function createGameStore() {
    // Initialize from storage or default
    const state = writable<GameState>(typeof window !== 'undefined' ? loadState() : DEFAULT_STATE);

    // El tramo se resuelve de forma asíncrona (hay que leer el hijo/a activo).
    // Cuando llega, el catálogo de piezas disponibles cambia y hay que
    // recalcularlo para la etapa en curso.
    tramo.subscribe(tr => {
        state.update(s => ({ ...s, unlockedPieces: rules.getUnlockedPieces(s.currentStage, tr) }));
    });

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
                id: Math.random().toString(36).substring(2, 11),
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
                    logToDispatch = { msg: `${_t.game?.cantUse || "No se puede usar"} "${pieceName(piece, get(tramo), _t)}": ${reqs.reason}`, type: 'warn' };
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
                logToDispatch = { msg: `${_t.game?.installedLog || "Instalaste"} ${pieceName(piece, get(tramo), _t)}. ${_t.pieces?.[piece.id]?.tooltip || piece.tooltip}${effectStr}`, type: 'info' };

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
            let pName: string = slot;
            let shouldLog = false;

            state.update(s => {
                const pId = s.placements[slot];
                if (pId) {
                    const p = PIECES.find(x => x.id === pId);
                    if (p) {
                        pName = pieceName(p, get(tramo), _t) || slot;
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

            const tr = get(tramo);
            state.update(s => {
                const { can, reason } = rules.canTrain(s.placements, tr);
                canTrain = can;
                trainReason = reason || '';

                if (can) {
                    return { ...s, isTraining: true };
                }
                return s;
            });

            if (!canTrain) {
                logEvent(`${_t.game?.trainError || "Error al iniciar:"} ${trainReason}`, 'error');
                // Desde que se puede pulsar Entrenar siempre (Fase C2), el
                // rechazo tiene que verse en pantalla y no solo en el log.
                trainResult.set({
                    bloqueo: trainReason,
                    metricas: rules.calculateMetrics(get(state).placements),
                    delta: null,
                    diagnosticos: [],
                    veredicto: 'Todavía no se puede entrenar.',
                    mejoro: 'igual'
                });
                return;
            }

            logEvent(_t.game?.trainStart || 'Iniciando flujo de entrenamiento masivo...', 'info');

            setTimeout(() => {
                let evaluationNote = '';
                let successMessage = '';
                let warningMessage = '';
                let infoMessage = '';
                let newStageMessage = '';
                let etapaSuperada: StageId | null = null;
                let haGanado = false;
                let resultado: ResultadoEntrenamiento | null = null;
                const _tAsync = get(t);

                state.update(s => {
                    const metrics = rules.calculateMetrics(s.placements);
                    resultado = construirResultado(s, metrics, s.lastTrainedMetrics, tr);

                    if (s.placements.Examen === 'p_metric_basic' && s.placements.Entrenamiento) {
                        evaluationNote = ` ${_tAsync.game?.evalMeanErr || "Evaluados: Error Medio."}`;
                    }
                    if (s.placements.Examen === 'p_traintest_split') {
                        evaluationNote = ` ${_tAsync.game?.evalTest || "Evaluables en Test:"} ${metrics.accuracy}% ${_tAsync.game?.hits || "Acertados."}`;
                    }
                    successMessage = `${_tAsync.game?.trainDone || "Entrenamiento concluido."}${evaluationNote}`;

                    const maxStage = getTramoConfig(tr).maxStage;
                    const check = rules.checkStageCompletion(s.currentStage, s, metrics, tr);
                    if (check) {
                        etapaSuperada = s.currentStage;
                        entrenamientosConExito++;
                        if (s.currentStage < maxStage) {
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
                                unlockedPieces: rules.getUnlockedPieces(nextStage, tr),
                                stageIntroAck: false,
                                lastTrainedMetrics: metrics
                            };
                        } else {
                            // Won the game!
                            haGanado = true;
                            // Antes de celebrar, la pregunta incómoda sobre lo
                            // que se acaba de construir. 8-9 va directo a la fiesta.
                            if (interlocutorPara(tr)) showEticaModal.set(true);
                            else showVictoryModal.set(true);
                            successMessage = _tAsync.game?.victoryTitle || "¡Victoria!";
                            return {
                                ...s,
                                isTraining: false,
                                hasWonGame: true,
                                lastTrainedMetrics: metrics,
                                // Da por vista la intro de la última etapa: si no,
                                // se queda abierta debajo del modal de victoria y
                                // el niño ve dos diálogos apilados.
                                stageIntroAck: true
                            };
                        }
                    } else {
                        const objs = rules.getObjectives(s.currentStage, tr);
                        const missing = objs.filter(o => !o.isMet(s, metrics));
                        if (missing.length > 0) {
                            warningMessage = `${_tAsync.game?.trainAborted || "Entrenamiento abortado. Objetivo faltante:"} ${_tAsync.objectives?.[missing[0].id] || missing[0].description}`;
                        } else {
                            infoMessage = `${_tAsync.game?.metricsStable || 'Métricas estables.'} (Acc: ${metrics.accuracy} | Perf: ${metrics.performance})`;
                        }
                        return { ...s, isTraining: false, lastTrainedMetrics: metrics };
                    }
                });

                // Dispatch logs outside update
                if (successMessage) logEvent(successMessage, 'success');
                if (newStageMessage) logEvent(newStageMessage, 'success');
                if (warningMessage) logEvent(warningMessage, 'warn');
                if (infoMessage) logEvent(infoMessage, 'success');

                // El antes/después se muestra siempre menos al ganar, donde
                // el modal de victoria es el protagonista.
                if (resultado && !haGanado) trainResult.set(resultado);

                // Progresión (Fase C1): chispas por etapa e insignias. Al ganar
                // no se celebra la etapa, porque el modal de victoria ya lo hace.
                if (etapaSuperada !== null && !haGanado) {
                    registrarEtapaCompletada(tr, etapaSuperada);
                }
                if (etapaSuperada !== null) {
                    sincronizarInsignias(get(state), tr, entrenamientosConExito, insigniasOtorgadas);
                }
            }, 800);
        },

        advanceStage: (newStage: StageId) => {
            const _t = get(t);
            const tr = get(tramo);
            state.update(s => {
                return {
                    ...s,
                    currentStage: newStage,
                    unlockedPieces: rules.getUnlockedPieces(newStage, tr),
                    stageIntroAck: false
                };
            });
            logEvent(`${_t.game?.advancedStage || '¡Avanzaste a la Etapa'} ${newStage}!`, 'success');
        },

        reset: () => {
            const _t = get(t);
            clearState();
            // Las insignias ya ganadas NO se quitan (están en el perfil), pero
            // el contador de la sesión vuelve a cero al empezar de nuevo.
            entrenamientosConExito = 0;
            state.set({ ...DEFAULT_STATE, isTraining: false, unlockedPieces: rules.getUnlockedPieces(1, get(tramo)) });
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
                    // Al recargar no repetimos el modal de bienvenida ni interrumpimos con avisos.
                    state.update(st => ({ ...st, hasSeenWelcomeModal: true, stageIntroAck: true }));
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

/**
 * Cierra el momento ético y da paso a la victoria. Si el niño asumió la
 * responsabilidad en vez de esquivarla, se lleva además la insignia.
 */
export function cerrarEtica(responsable: boolean): void {
    showEticaModal.set(false);
    if (responsable) otorgarInsigniaEtica();
    showVictoryModal.set(true);
}

// Derived store to calculate metrics reactively avoiding side-effects everywhere
export const gameMetrics = derived(game, ($game) => {
    return rules.calculateMetrics($game.placements);
});

export const stageProgress = derived([game, gameMetrics, tramo], ([$game, $metrics, $tramo]) => {
    const currentObjectives = rules.getObjectives($game.currentStage, $tramo);
    return currentObjectives.map(obj => ({
        id: obj.id,
        description: obj.description,
        met: obj.isMet($game, $metrics)
    }));
});

/** Huecos del tablero según el tramo (8-9 juega con 3, no con 5). */
export const boardSlots = derived(tramo, $tramo => getTramoConfig($tramo).slots);

/** Última etapa del viaje en este tramo. */
export const maxStage = derived(tramo, $tramo => getTramoConfig($tramo).maxStage);
