// Diagnóstico del modelo tras entrenar (docs/mejora/07-constructor-plan.md, Fase C2).
//
// El bucle era plano: colocar → Entrenar → "avanzas" o "falta un objetivo".
// Nunca se explicaba POR QUÉ un modelo es peor, que es justo lo que enseña
// cómo se mejora una IA. Aquí se leen las piezas colocadas y las métricas
// para nombrar los fallos clásicos —memorizar, pocos datos, inventarse
// cosas, ir lentísima— con la palabra del tramo y una pista para arreglarlo.

import type { TramoId } from '../../../lib/tramos';
import type { GameState, Metrics } from '../types';
import { getTramoConfig } from './tramo-config';

export type DiagnosticoId = 'memoriza' | 'pocos_datos' | 'se_lo_inventa' | 'va_lenta';

export interface Diagnostico {
    id: DiagnosticoId;
    icono: string;
    titulo: string;
    explicacion: string;
    pista: string;
}

export interface DeltaMetricas {
    accuracy: number;
    performance: number;
    complexity: number;
}

export interface ResultadoEntrenamiento {
    /** Si el modelo ni siquiera puede entrenarse, aquí va el motivo. */
    bloqueo?: string;
    metricas: Metrics;
    delta: DeltaMetricas | null; // null en el primer entrenamiento
    diagnosticos: Diagnostico[];
    veredicto: string;
    mejoro: 'mejor' | 'peor' | 'igual' | 'primero';
}

/** Texto técnico solo para 12-14; los pequeños oyen la versión concreta. */
function segunTramo(tramo: TramoId, infantil: string, tecnico: string): string {
    return tramo === '12-14' ? tecnico : infantil;
}

const colocadas = (state: GameState): string[] =>
    Object.values(state.placements).filter(Boolean) as string[];

export function diagnosticar(
    state: GameState,
    metrics: Metrics,
    tramo: TramoId
): Diagnostico[] {
    const puestas = colocadas(state);
    const tiene = (id: string) => puestas.includes(id);
    const slots = getTramoConfig(tramo).slots;
    const out: Diagnostico[] = [];

    // 1. Memoriza en vez de aprender (overfitting). Solo tiene sentido donde
    //    existe el hueco de Examen: sin examen no hay forma de detectarlo.
    const puedeExaminar = slots.includes('Examen');
    const seExamina = tiene('p_traintest_split') || tiene('p_regularization');
    if (puedeExaminar && metrics.complexity >= 50 && !seExamina) {
        out.push({
            id: 'memoriza',
            icono: '🦜',
            titulo: segunTramo(tramo, 'Se lo está aprendiendo de memoria', 'Overfitting'),
            explicacion: segunTramo(
                tramo,
                'Tu IA acierta con lo que ya ha visto, pero se perderá con algo nuevo. Como quien memoriza el examen sin entender el tema.',
                'El modelo memoriza el conjunto de entrenamiento en vez de generalizar: su acierto real será mucho peor que el que marca.'
            ),
            pista: segunTramo(
                tramo,
                'Escóndele unas preguntas para el examen final (Train/Test Split) o usa Regularización.',
                'Añade Train/Test Split para medir sobre datos no vistos, o Regularización (Dropout).'
            )
        });
    }

    // 2. Ha visto pocos ejemplos (raíz del sesgo).
    const datos = state.placements['Datos'];
    const pocosDatos = !datos || datos === 'p_data_raw' || datos === 'p_dataset_small';
    if (pocosDatos && metrics.accuracy < 60) {
        out.push({
            id: 'pocos_datos',
            icono: '🔍',
            titulo: segunTramo(tramo, 'Ha visto pocos ejemplos', 'Datos insuficientes (y sesgo)'),
            explicacion: segunTramo(
                tramo,
                'Con pocos ejemplos, tu IA solo acierta con cosas muy parecidas a las que ya vio. Con lo demás, se equivoca.',
                'Un conjunto pequeño generaliza mal y hereda los sesgos de esos pocos casos: el modelo funcionará peor con lo que no se le parezca.'
            ),
            pista: segunTramo(
                tramo,
                'Dale muchísimos más ejemplos, o límpialos para que no haya basura.',
                'Amplía el dataset o mejora su calidad con limpieza de datos.'
            )
        });
    }

    // 3. Se lo inventa con seguridad (alucinación sin barreras).
    if (tiene('p_temperature') && !tiene('p_guardrails')) {
        out.push({
            id: 'se_lo_inventa',
            icono: '🎭',
            titulo: segunTramo(tramo, 'Se lo inventa muy convencida', 'Riesgo de alucinación'),
            explicacion: segunTramo(
                tramo,
                'Le has subido la creatividad y no lleva escudo: puede decir cosas falsas como si estuviera segurísima.',
                'Temperatura alta sin guardarraíles: el modelo produce afirmaciones inventadas con alta confianza aparente.'
            ),
            pista: segunTramo(
                tramo,
                'Ponle el Escudo Protector en la Salida.',
                'Añade Guardrails en la salida, o baja la temperatura.'
            )
        });
    }

    // 4. Potente pero lentísima: el trade-off que el juego ya modela.
    if (metrics.performance < 35) {
        out.push({
            id: 'va_lenta',
            icono: '🐌',
            titulo: segunTramo(tramo, 'Va muy lenta', 'Latencia alta'),
            explicacion: segunTramo(
                tramo,
                'Tu IA es potente, pero tarda un montón en contestar. Lo bueno cuesta tiempo… pero demasiado cansa.',
                'Las piezas más capaces penalizan el rendimiento: el modelo es fuerte pero su coste de inferencia es alto.'
            ),
            pista: segunTramo(
                tramo,
                'Prueba a cambiar alguna pieza pesada por otra más ligera.',
                'Equilibra: sustituye alguna pieza costosa o añade potencia de cómputo.'
            )
        });
    }

    // Como mucho dos avisos: una lista larga de fallos desanima y no se lee.
    return out.slice(0, 2);
}

export function construirResultado(
    state: GameState,
    metricas: Metrics,
    anteriores: Metrics | null | undefined,
    tramo: TramoId
): ResultadoEntrenamiento {
    const delta: DeltaMetricas | null = anteriores
        ? {
            accuracy: metricas.accuracy - anteriores.accuracy,
            performance: metricas.performance - anteriores.performance,
            complexity: metricas.complexity - anteriores.complexity
        }
        : null;

    let mejoro: ResultadoEntrenamiento['mejoro'] = 'primero';
    if (delta) {
        if (delta.accuracy > 0) mejoro = 'mejor';
        else if (delta.accuracy < 0) mejoro = 'peor';
        else mejoro = 'igual';
    }

    const veredicto =
        mejoro === 'primero'
            ? `Primer entrenamiento: tu IA acierta ${metricas.accuracy} de cada 100 veces.`
            : mejoro === 'mejor'
                ? `¡Mejor que antes! Ha subido ${delta!.accuracy} puntos de precisión.`
                : mejoro === 'peor'
                    ? `Ha empeorado ${Math.abs(delta!.accuracy)} puntos de precisión. ¿Qué cambiaste?`
                    : 'Igual que antes: ningún cambio ha movido la precisión.';

    return { metricas, delta, diagnosticos: diagnosticar(state, metricas, tramo), veredicto, mejoro };
}
