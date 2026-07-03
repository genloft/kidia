/**
 * Capa de moderación de entrada/salida libre (voz/texto) del módulo
 * unidad-aventura (tramo 8-9). Ver Kidia_Programa_Retos_8-9_v2.docx,
 * sección 3, regla no-negociable #2.
 *
 * FASE ACTUAL: filtro determinista local, sin llamada a un modelo de IA.
 * En el Nivel 1 no hay generación real — todo el contenido de "investiga"
 * y "crea" sale de bancos cerrados definidos en el JSON de cada unidad
 * (ver src/schemas/unidad.ts). Este gate protege los campos de texto/voz
 * libres que sí escribe el niño (el "motivo" en 1.1, la "regla descubierta"
 * en 1.2, el detalle libre del prompt en 1.3).
 *
 * Sustituir por una llamada real (p.ej. OpenAI moderation endpoint vía
 * ruta de servidor) cuando se resuelva el hosting SSR: hoy las rutas
 * /api/*.ts no funcionan como servidor real en producción en Hostinger
 * (mismo problema ya conocido que afecta a /api/chat y /api/checkout).
 */

export interface GateResult {
    allowed: boolean;
    sanitizedInput?: string;
    sanitizedOutput?: string;
    reason?: 'vacio' | 'demasiado_largo' | 'lenguaje_inadecuado' | 'dato_personal';
}

const MAX_LENGTH = 140;

// Lista corta y deliberadamente conservadora, pensada para 8-9 años.
const PALABRAS_PROHIBIDAS = [
    'idiota', 'tonto', 'estupido', 'estúpido', 'imbecil', 'imbécil',
    'puta', 'puto', 'mierda', 'joder', 'cabron', 'cabrón',
];

// Patrones que sugieren un dato personal identificativo (regla #3:
// nunca se piden ni aceptan nombre completo, dirección, colegio, teléfono).
const PATRONES_DATO_PERSONAL: RegExp[] = [
    /\b\d{9}\b/, // teléfono español (9 dígitos seguidos)
    /\bcalle\s+\w+/i,
    /\bmi\s+(colegio|instituto|cole)\s+es\b/i,
    /\bvivo\s+en\b/i,
    /\bme\s+llamo\s+\w+\s+\w+/i, // "me llamo Nombre Apellido"
    /\b[\w.-]+@[\w.-]+\.\w+/i, // email
];

function containsBadWord(text: string): boolean {
    const lower = text.toLowerCase();
    return PALABRAS_PROHIBIDAS.some(p => lower.includes(p));
}

function containsPersonalData(text: string): boolean {
    return PATRONES_DATO_PERSONAL.some(p => p.test(text));
}

/**
 * Filtra la entrada libre del niño (texto o voz ya transcrita) antes de
 * usarla para nada: guardarla, mostrarla o pasarla a un paso posterior.
 * SIEMPRE se llama antes de guardar cualquier campo de texto/voz libre.
 */
export function moderationGate(input: string): GateResult {
    const trimmed = (input || '').trim();

    if (!trimmed) {
        return { allowed: false, reason: 'vacio' };
    }
    if (trimmed.length > MAX_LENGTH) {
        return { allowed: false, reason: 'demasiado_largo', sanitizedInput: trimmed.slice(0, MAX_LENGTH) };
    }
    if (containsBadWord(trimmed)) {
        return { allowed: false, reason: 'lenguaje_inadecuado' };
    }
    if (containsPersonalData(trimmed)) {
        return { allowed: false, reason: 'dato_personal' };
    }

    return { allowed: true, sanitizedInput: trimmed };
}

/**
 * Filtra cualquier salida que el laboratorio le muestre al niño. En esta
 * fase esa salida siempre viene de bancos de contenido cerrados y curados
 * en el JSON de la unidad; este gate es la misma red de seguridad para
 * cuando esa salida deje de ser 100% estática.
 */
export function outputGate(response: string): GateResult {
    const trimmed = (response || '').trim();

    if (!trimmed) {
        return { allowed: false, reason: 'vacio' };
    }
    if (containsBadWord(trimmed)) {
        return { allowed: false, reason: 'lenguaje_inadecuado' };
    }

    return { allowed: true, sanitizedOutput: trimmed };
}

/** Mensaje cálido de Vael cuando el gate bloquea algo (regla #4 del system prompt de Vael). */
export function mensajeRedireccionVael(reason?: GateResult['reason']): string {
    switch (reason) {
        case 'dato_personal':
            return 'Eso es un secreto que guardamos, ¡mejor cuéntame de tu invento!';
        case 'demasiado_largo':
            return '¡Uy, eso es mucho hechizo! Cuéntamelo con menos palabras.';
        case 'lenguaje_inadecuado':
            return 'Mejor busquemos otras palabras para contarlo, ¿lo intentamos otra vez?';
        default:
            return 'Mmm, prueba a contármelo de otra forma.';
    }
}
