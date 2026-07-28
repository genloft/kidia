import { supabase } from './supabase';

/**
 * Chispas ⚡ y Niveles de Inventor/a (doc 04 §3.1) sobre el ledger
 * child_events (migración supabase/migrations/006_child_events.sql).
 *
 * Principios (doc 04 §1): celebrar el proceso, sin comparar entre niños.
 * Las chispas se ganan una sola vez por hecho — el índice único del ledger
 * hace la idempotencia en el servidor, no aquí (rejugar una misión choca
 * con el índice y se ignora): imposible farmear repitiendo.
 *
 * Si la tabla aún no existe (migración sin pegar), TODO degrada a "sin
 * chispas": logEvent no-op, total 0, y la UI que pinta chispas se oculta.
 * Mismo patrón de degradación que familia-gate.ts con el PIN.
 */

export type EventoTipo =
    | 'mision_completada'
    | 'palabras_coleccionadas'
    | 'mision_familia'
    | 'creacion_publicada'
    | 'insignia_ganada'
    | 'actividad_diaria';

// Cuánto vale cada hecho. La misión en familia es lo más premiado a
// propósito (doc 04 §3.1: es lo que más queremos incentivar). Las palabras
// van por unidad (1 chispa por palabra, en un solo evento) para que el
// ledger no crezca una fila por palabra.
export const CHISPAS: Record<EventoTipo, number> = {
    mision_completada: 10,
    palabras_coleccionadas: 1, // por palabra: multiplicar en el call site
    mision_familia: 20,
    creacion_publicada: 5,
    insignia_ganada: 15,
    actividad_diaria: 0, // la racha es su propia recompensa (doc 04 §3.3)
};

// Umbrales calibrados a la economía real del tramo 8-9: una unidad completa
// con familia y publicación da ~35-40; las 16 unidades + insignias ≈ 500.
export const NIVELES_INVENTOR: { desde: number; nombre: string; icono: string }[] = [
    { desde: 0, nombre: 'Aprendiz', icono: '🌱' },
    { desde: 40, nombre: 'Explorador/a', icono: '🔭' },
    { desde: 120, nombre: 'Inventor/a', icono: '💡' },
    { desde: 250, nombre: 'Maestro/a de Laboratorio', icono: '🧪' },
    { desde: 400, nombre: 'Leyenda del Laboratorio', icono: '🌟' },
];

export function nivelInventor(chispas: number): { nombre: string; icono: string; siguiente: { nombre: string; faltan: number } | null } {
    let actual = NIVELES_INVENTOR[0];
    let siguiente: (typeof NIVELES_INVENTOR)[number] | null = null;
    for (const nivel of NIVELES_INVENTOR) {
        if (chispas >= nivel.desde) actual = nivel;
        else { siguiente = nivel; break; }
    }
    return {
        nombre: actual.nombre,
        icono: actual.icono,
        siguiente: siguiente ? { nombre: siguiente.nombre, faltan: siguiente.desde - chispas } : null,
    };
}

// La tabla puede no existir todavía (42P01/PGRST205). Se recuerda en memoria
// para no repetir la petición fallida en cada pantalla de la misma sesión.
let ledgerDisponible: boolean | null = null;
let avisado = false;

function esTablaAusente(error: { code?: string; message: string }): boolean {
    return error.code === '42P01' || error.message.includes('child_events');
}

function avisarLedgerAusente(message: string) {
    ledgerDisponible = false;
    if (avisado) return; // varias llamadas en paralelo fallan a la vez: un solo aviso
    avisado = true;
    console.warn('[ChispasService] Ledger no disponible (falta migración 006):', message);
}

/**
 * Cálculo puro de la racha (doc 04 §3.3), separado de la query para poder
 * probarlo con fechas sintéticas. Cuenta días CON actividad hacia atrás
 * desde el más reciente, permitiendo huecos de hasta 3 días entre uno y el
 * siguiente ("racha protegida"); si la última actividad fue hace más de 3
 * días respecto a `hoy`, la racha está rota (0).
 */
export function calcularRacha(diasConActividad: string[], hoy: string): number {
    const dias = diasConActividad
        .filter(ref => /^\d{4}-\d{2}-\d{2}$/.test(ref))
        .sort()
        .reverse(); // más reciente primero

    if (dias.length === 0) return 0;

    const MS_DIA = 24 * 60 * 60 * 1000;
    const aDias = (fecha: string) => Math.round(new Date(`${fecha}T00:00:00`).getTime() / MS_DIA);

    if (aDias(hoy) - aDias(dias[0]) > 3) return 0;

    let racha = 1;
    for (let i = 1; i < dias.length; i++) {
        if (aDias(dias[i - 1]) - aDias(dias[i]) > 3) break;
        racha++;
    }
    return racha;
}

export const ChispasService = {
    /**
     * Registra un hecho y devuelve las chispas otorgadas (0 si ya se había
     * registrado antes — idempotencia vía índice único — o si el ledger no
     * está disponible).
     */
    async logEvent(childId: string, tipo: EventoTipo, refId: string, chispas: number): Promise<{ otorgadas: number }> {
        if (ledgerDisponible === false) return { otorgadas: 0 };

        const { data, error } = await supabase
            .from('child_events')
            .upsert(
                { child_id: childId, tipo, ref_id: refId, chispas },
                { onConflict: 'child_id,tipo,ref_id', ignoreDuplicates: true }
            )
            .select();

        if (error) {
            if (esTablaAusente(error)) {
                avisarLedgerAusente(error.message);
            } else {
                console.error('[ChispasService] logEvent error:', error);
            }
            return { otorgadas: 0 };
        }

        ledgerDisponible = true;
        // Con ignoreDuplicates, .select() devuelve SOLO las filas insertadas
        // ahora: array vacío = el hecho ya estaba registrado (replay) y no
        // se otorga nada — así el "+N chispas" del cierre nunca miente.
        return { otorgadas: (data && data.length > 0) ? chispas : 0 };
    },

    /** Total de chispas del hijo/a (suma del ledger; 0 si no está disponible). */
    async getTotalChispas(childId: string): Promise<number> {
        if (ledgerDisponible === false) return 0;

        const { data, error } = await supabase
            .from('child_events')
            .select('chispas')
            .eq('child_id', childId);

        if (error) {
            if (esTablaAusente(error)) {
                avisarLedgerAusente(error.message);
            } else {
                console.error('[ChispasService] getTotalChispas error:', error);
            }
            return 0;
        }

        ledgerDisponible = true;
        return (data || []).reduce((sum, row) => sum + (row.chispas || 0), 0);
    },

    /** ¿Está el ledger operativo? (null = aún no se ha intentado en esta sesión) */
    disponible(): boolean | null {
        return ledgerDisponible;
    },

    // ---- Racha amable de laboratorio (doc 04 §3.3) ----
    // "Días con al menos una actividad — cualquier cosa cuenta": el evento
    // 'actividad_diaria' se registra al entrar a cualquier página del Modo
    // Aventura (una fila por día gracias al índice único con ref_id=fecha).
    // Protegida: no se rompe hasta 3 días sin entrar. Nunca en negativo —
    // quien consume getRacha muestra la racha o no muestra nada.

    fechaLocalHoy(): string {
        const d = new Date();
        // Fecha LOCAL del dispositivo del niño (no UTC): su "día" real.
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },

    async registrarActividadHoy(childId: string): Promise<void> {
        await this.logEvent(childId, 'actividad_diaria', this.fechaLocalHoy(), CHISPAS.actividad_diaria);
    },

    /**
     * Días de racha actual (0 si el ledger no está disponible o la racha
     * se rompió: más de 3 días desde la última actividad). Cuenta días CON
     * actividad hacia atrás, permitiendo huecos de hasta 3 días entre uno
     * y el siguiente ("racha protegida").
     */
    async getRacha(childId: string): Promise<number> {
        if (ledgerDisponible === false) return 0;

        const { data, error } = await supabase
            .from('child_events')
            .select('ref_id')
            .eq('child_id', childId)
            .eq('tipo', 'actividad_diaria');

        if (error) {
            if (esTablaAusente(error)) avisarLedgerAusente(error.message);
            else console.error('[ChispasService] getRacha error:', error);
            return 0;
        }

        ledgerDisponible = true;
        return calcularRacha((data || []).map(row => row.ref_id), this.fechaLocalHoy());
    },
};
