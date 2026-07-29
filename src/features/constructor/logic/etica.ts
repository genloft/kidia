// El momento ético antes de "ganar" (docs/mejora/07-constructor-plan.md, Fase C3).
//
// Construir una IA potente y que el juego te aplauda sin más es una mala
// lección. Antes de la victoria se abre una pregunta sobre LO QUE EL NIÑO
// ACABA DE CONSTRUIR: si no le puso escudo, si aprendió de datos ajenos, si
// nunca la examinó de verdad.
//
// Quién pregunta depende del tramo (ver src/lib/tramos.ts): Morti solo
// aparece en 12-14; en 10-11 la pregunta —más suave— la hace la Dra. Vael.
// En 8-9 no hay momento ético: su cierre es celebrar lo construido.

import type { TramoId } from '../../../lib/tramos';
import type { GameState } from '../types';

export type Interlocutor = 'morti' | 'vael';

export interface OpcionEtica {
    id: string;
    texto: string;
    /** Respuesta del personaje. No hay opción "incorrecta" que bloquee: se responde y se sigue. */
    replica: string;
    /** true si la respuesta asume la responsabilidad en vez de esquivarla. */
    responsable: boolean;
}

export interface Dilema {
    id: string;
    interlocutor: Interlocutor;
    entradilla: string;
    pregunta: string;
    opciones: OpcionEtica[];
}

/** ¿Este tramo tiene momento ético, y con quién? */
export function interlocutorPara(tramo: TramoId): Interlocutor | null {
    if (tramo === '12-14') return 'morti';
    if (tramo === '10-11') return 'vael';
    return null; // 8-9: sin dilema, su cierre es celebrar
}

const colocadas = (state: GameState): string[] =>
    Object.values(state.placements).filter(Boolean) as string[];

/**
 * Elige el dilema que le toca a ESTA IA, en este orden de prioridad: lo que
 * falta duele más que lo que sobra.
 */
export function elegirDilema(state: GameState, tramo: TramoId): Dilema | null {
    const quien = interlocutorPara(tramo);
    if (!quien) return null;

    const puestas = colocadas(state);
    const tiene = (id: string) => puestas.includes(id);
    const duro = quien === 'morti';

    // 1. La construyó sin escudo: lo más grave.
    if (!tiene('p_guardrails')) {
        return {
            id: 'sin_escudo',
            interlocutor: quien,
            entradilla: duro
                ? 'Tu IA ya funciona. Y no lleva ningún filtro. Ninguno.'
                : 'Tu IA ya funciona. Me he fijado en una cosa…',
            pregunta: duro
                ? 'Si alguien le pide algo dañino, ¿quién responde: ella o tú?'
                : '¿Qué pasaría si alguien le pide algo que puede hacer daño?',
            opciones: [
                {
                    id: 'yo_respondo',
                    texto: 'Respondo yo: la construí yo.',
                    replica: duro
                        ? 'Correcto. Una máquina no tiene culpa. La tiene quien decide soltarla al mundo.'
                        : '¡Exacto! Quien construye una herramienta también decide cómo se usa.',
                    responsable: true
                },
                {
                    id: 'le_pongo_escudo',
                    texto: 'Le pondría un escudo antes de soltarla.',
                    replica: duro
                        ? 'Eso es pensar antes de actuar. Poco común. Sigue así.'
                        : '¡Muy bien pensado! Proteger es parte de construir.',
                    responsable: true
                },
                {
                    id: 'ella_sola',
                    texto: 'Es la IA la que contesta, no yo.',
                    replica: duro
                        ? 'Cómodo, ¿verdad? Pero la IA no eligió nada. Tú elegiste cada pieza.'
                        : 'Ella solo hace lo que le enseñamos. Las decisiones siguen siendo nuestras.',
                    responsable: false
                }
            ]
        };
    }

    // 2. Aprendió de datos ajenos.
    if (tiene('p_dataset_large')) {
        return {
            id: 'datos_ajenos',
            interlocutor: quien,
            entradilla: duro
                ? 'Tu IA aprendió de millones de textos escritos por personas.'
                : 'Tu IA ha aprendido de muchísimos textos que escribió gente.',
            pregunta: duro
                ? '¿Alguien les preguntó si querían que su trabajo entrenara a tu modelo?'
                : '¿Crees que esas personas dieron permiso?',
            opciones: [
                {
                    id: 'pedir_permiso',
                    texto: 'Habría que pedirles permiso.',
                    replica: duro
                        ? 'Sí. Y casi nunca se hace. Que lo sepas es lo que te separa de quien no lo piensa.'
                        : '¡Eso es! Lo que alguien crea sigue siendo suyo, aunque esté en internet.',
                    responsable: true
                },
                {
                    id: 'dar_credito',
                    texto: 'Al menos habría que decir de dónde salió.',
                    replica: duro
                        ? 'Dar crédito es lo mínimo. No lo arregla todo, pero es un principio.'
                        : 'Muy bien: reconocer de quién aprendemos es de justos.',
                    responsable: true
                },
                {
                    id: 'estaba_publico',
                    texto: 'Estaba en internet, así que es de todos.',
                    replica: duro
                        ? 'Que algo sea visible no lo hace tuyo. Tu diario sobre la mesa tampoco es mío.'
                        : 'Que se pueda ver no significa que se pueda usar para todo. Sigue siendo de quien lo hizo.',
                    responsable: false
                }
            ]
        };
    }

    // 3. Por defecto: a quién puede perjudicar equivocarse.
    return {
        id: 'a_quien_afecta',
        interlocutor: quien,
        entradilla: duro
            ? 'Tu IA está terminada. Ninguna acierta siempre. La tuya tampoco.'
            : 'Tu IA está terminada. Pero ninguna IA acierta el 100% de las veces.',
        pregunta: duro
            ? 'Cuando falle —y va a fallar—, ¿a quién le cae encima el error?'
            : 'Cuando se equivoque, ¿a quién puede afectarle?',
        opciones: [
            {
                id: 'a_quien_la_usa',
                texto: 'A quien la use y se fíe de ella.',
                replica: duro
                    ? 'Exacto. Por eso hay que avisar de que puede fallar, no presumir de que no falla.'
                    : '¡Muy bien! Por eso conviene avisar de que puede equivocarse.',
                responsable: true
            },
            {
                id: 'a_los_no_representados',
                texto: 'Sobre todo a quien no se parece a sus ejemplos.',
                replica: duro
                    ? 'Ahí has puesto el dedo. Falla más con quien menos vio. Eso tiene nombre: sesgo.'
                    : '¡Qué buena respuesta! Falla más con lo que ha visto poco.',
                responsable: true
            },
            {
                id: 'no_pasa_nada',
                texto: 'Si se equivoca, no pasa nada.',
                replica: duro
                    ? 'Depende de para qué la uses. En un juego, nada. Decidiendo sobre personas, mucho.'
                    : 'Depende de para qué se use: a veces un error importa muchísimo.',
                responsable: false
            }
        ]
    };
}
