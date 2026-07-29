// Configuración del Constructor por tramo de edad (ver docs/mejora/07-constructor-plan.md §2.1).
//
// El Constructor nació con un único viaje de 5 etapas escrito con vocabulario
// de 12-14 ("Regularización (Dropout)", "Softmax", "Transformer"). Aquí se
// define, para cada tramo, cuántos huecos tiene el tablero, cuántas etapas
// dura el viaje y qué hay que lograr en cada una.

import type { TramoId } from '../../../lib/tramos';
import type { GameState, Metrics, SlotCategory, StageId, StageObjective } from '../types';

export interface TramoConfig {
    /** Huecos del tablero. 8-9 no tiene Examen ni Entrenamiento: son los más abstractos. */
    slots: SlotCategory[];
    /** Última etapa del viaje: al superarla, el niño gana. */
    maxStage: StageId;
}

const TODOS_LOS_SLOTS: SlotCategory[] = ['Datos', 'Cerebro', 'Entrenamiento', 'Examen', 'Salida'];

export const TRAMO_CONFIG: Record<TramoId, TramoConfig> = {
    '8-9': { slots: ['Datos', 'Cerebro', 'Salida'], maxStage: 3 },
    '10-11': { slots: TODOS_LOS_SLOTS, maxStage: 4 },
    '12-14': { slots: TODOS_LOS_SLOTS, maxStage: 5 }
};

/** Tramo por defecto cuando aún no se ha resuelto el hijo/a activo. */
export const TRAMO_POR_DEFECTO: TramoId = '12-14';

// --- Helpers de lectura de estado, para que los objetivos se lean bien ---
const colocadas = (st: GameState): string[] =>
    Object.values(st.placements).filter(Boolean) as string[];
const tiene = (st: GameState, id: string): boolean => colocadas(st).includes(id);
const alguna = (st: GameState, ...ids: string[]): boolean => ids.some(id => tiene(st, id));

// --- Objetivos por tramo y etapa ---
// 12-14 conserva los objetivos originales; 8-9 y 10-11 tienen los suyos, con
// umbrales alcanzables usando solo las piezas disponibles en su tramo.
const OBJETIVOS_8_9: Record<number, StageObjective[]> = {
    1: [
        { id: '8-9_1_slots', description: 'Pon datos, un cerebro y una salida', isMet: st => colocadas(st).length >= 3 },
        { id: '8-9_1_acc', description: 'Consigue más de 20 de precisión', isMet: (_, m) => m.accuracy > 20 }
    ],
    2: [
        { id: '8-9_2_datos', description: 'Dale muchos más ejemplos', isMet: st => alguna(st, 'p_dataset_large', 'p_dataset_small') },
        { id: '8-9_2_acc', description: 'Consigue más de 50 de precisión', isMet: (_, m) => m.accuracy > 50 }
    ],
    3: [
        { id: '8-9_3_escudo', description: 'Ponle un escudo protector', isMet: st => tiene(st, 'p_guardrails') },
        { id: '8-9_3_acc', description: 'Consigue más de 70 de precisión', isMet: (_, m) => m.accuracy > 70 }
    ]
};

const OBJETIVOS_10_11: Record<number, StageObjective[]> = {
    1: [
        { id: '10-11_1_slots', description: 'Llena al menos 3 huecos', isMet: st => colocadas(st).length >= 3 },
        { id: '10-11_1_acc', description: 'Precisión por encima de 30', isMet: (_, m) => m.accuracy > 30 },
        { id: '10-11_1_calidad', description: 'Cuida la calidad (etiquetas o limpieza)', isMet: st => alguna(st, 'p_labels', 'p_cleaning') }
    ],
    2: [
        { id: '10-11_2_cerebro', description: 'Mejora el cerebro con más capas', isMet: st => tiene(st, 'p_layers') },
        { id: '10-11_2_acc', description: 'Precisión por encima de 60', isMet: (_, m) => m.accuracy > 60 },
        { id: '10-11_2_trampas', description: 'Evita que se lo aprenda de memoria', isMet: st => alguna(st, 'p_traintest_split', 'p_regularization') }
    ],
    3: [
        { id: '10-11_3_moderno', description: 'Usa un cerebro moderno (Transformer)', isMet: st => tiene(st, 'p_model_transformer') },
        { id: '10-11_3_acc', description: 'Precisión por encima de 80', isMet: (_, m) => m.accuracy > 80 }
    ],
    4: [
        { id: '10-11_4_premios', description: 'Enséñale con premios de entrenadores', isMet: st => tiene(st, 'p_rlhf') },
        { id: '10-11_4_escudo', description: 'Protégela con un escudo', isMet: st => tiene(st, 'p_guardrails') },
        { id: '10-11_4_acc', description: 'Precisión de 90 o más', isMet: (_, m) => m.accuracy >= 90 }
    ]
};

export const OBJETIVOS_POR_TRAMO: Record<TramoId, Record<number, StageObjective[]> | null> = {
    '8-9': OBJETIVOS_8_9,
    '10-11': OBJETIVOS_10_11,
    '12-14': null // usa STAGE_OBJECTIVES original
};

// --- Textos del viaje por tramo ---
// Los originales están escritos para 12-14 ("Lectura Avanzada", "La
// Singularidad ha despertado"). Un niño de 8 años que acaba de montar su
// primera IA no ha desatado ninguna singularidad: necesita un cierre que
// describa lo que de verdad ha hecho.
export interface TextosTramo {
    etapas: Record<number, { titulo: string; mensaje: string }>;
    victoriaTitulo: string;
    victoriaCuerpo: string;
}

export const TEXTOS_POR_TRAMO: Partial<Record<TramoId, TextosTramo>> = {
    '8-9': {
        etapas: {
            2: {
                titulo: '¡Etapa 2: más ejemplos, mejor cerebro!',
                mensaje: 'Tu IA ya funciona. Ahora dale muchos más ejemplos y un cerebro con más capas para que acierte más veces.'
            },
            3: {
                titulo: '¡Etapa 3: ojos, oídos y escudo!',
                mensaje: 'Tu IA ya puede ver fotos y escuchar. Ponle un escudo protector para que nunca diga cosas feas o peligrosas.'
            }
        },
        victoriaTitulo: '¡Has construido tu primera IA!',
        victoriaCuerpo: 'Le diste datos, un cerebro y una forma de responder. Y, lo más importante, la protegiste con un escudo.\n\n¡Eso es construir con cabeza!'
    },
    '10-11': {
        etapas: {
            2: {
                titulo: '¡Etapa 2: que no haga trampas!',
                mensaje: 'Tu IA ya aprende, pero puede aprenderse las respuestas de memoria. Dale más capas y evita que haga trampas en el examen.'
            },
            3: {
                titulo: '¡Etapa 3: el cerebro moderno!',
                mensaje: 'Vas a usar un Transformer, el tipo de cerebro que usan las IAs que conoces. Prepárale bien los datos antes.'
            },
            4: {
                titulo: '¡Etapa 4: enséñale a portarse bien!',
                mensaje: 'Una IA lista no basta: tiene que ser útil y segura. Dale premios cuando responde bien y protégela con un escudo.'
            }
        },
        victoriaTitulo: '¡Has construido una IA completa!',
        victoriaCuerpo: 'Datos, cerebro, entrenamiento, examen y salida: montaste la cadena entera y además la hiciste segura.\n\n¡Enhorabuena, constructor!'
    }
    // 12-14 usa los textos originales de i18n (llega hasta la Singularidad).
};

export function getTextosTramo(tramo: TramoId): TextosTramo | undefined {
    return TEXTOS_POR_TRAMO[tramo];
}

export function getTramoConfig(tramo: TramoId): TramoConfig {
    return TRAMO_CONFIG[tramo] ?? TRAMO_CONFIG[TRAMO_POR_DEFECTO];
}

/** Etapa en la que una pieza entra en juego para un tramo dado. */
export function stageForTramo(
    piece: { stage: StageId; stageByTramo?: Partial<Record<TramoId, StageId>> },
    tramo: TramoId
): StageId {
    return piece.stageByTramo?.[tramo] ?? piece.stage;
}

/** ¿Esta pieza existe en el catálogo de este tramo? */
export function pieceInTramo(
    piece: { tramos?: TramoId[]; recommendedSlot: SlotCategory },
    tramo: TramoId
): boolean {
    const enTramo = piece.tramos ? piece.tramos.includes(tramo) : tramo === '12-14';
    if (!enTramo) return false;
    // Una pieza cuyo hueco no existe en este tramo no debe ofrecerse.
    return getTramoConfig(tramo).slots.includes(piece.recommendedSlot);
}

export type { Metrics };
