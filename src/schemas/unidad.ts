// Formato "unidad-aventura": rediseño del tramo 8-9 (ver Kidia_Programa_Retos_8-9_v2.docx).
// Es un formato paralelo e independiente de ScenarioSchema (src/schemas/scenario.ts) —
// no un grafo de diálogo, sino una secuencia fija de pantallas por unidad, con bancos de
// contenido cerrados (sin generación de IA en vivo) para investigar/crear.

// Los cuatro primeros son las zonas del rediseño 8-9; los cuatro últimos son
// los nombres de nivel del método que usa el programa 10-11 (el docx de ese
// tramo no define zonas con nombre propio, así que el mapa agrupa por el
// nombre real del nivel: Entender → Usar bien → Crear → Construir).
export type ZonaNombre =
    | 'Zona Descubre' | 'Zona Taller' | 'Zona Creación' | 'Zona Gran Invento'
    | 'Entender' | 'Usar bien' | 'Crear' | 'Construir';

export interface Zona {
    nombre: ZonaNombre;
    colorPrimario: string;
    colorFondo: string;
}

export interface PalabraPoderosa {
    palabra: string;
    definicion: string;
    icono: string;
}

export interface Mision {
    textoVael: string;
    audioUrl: string | null;
}

// Morti (tramo 12-14): segundo personaje, una IA fría y lógica que hace de
// abogado del diablo para detonar la reflexión ética. Aparece solo en las
// unidades que lo declaran (sesgo, responsabilidad, dilema del proyecto).
// El docx marca su voz en morado dentro de "Lo que ve el alumno"; el motor
// la muestra como una intervención propia tras la de Vael en la pantalla
// de misión. Opcional: las unidades de 8-9/10-11 no lo traen.
export interface MortiIntervencion {
    texto: string;
}

// --- Investiga: un tipo por mecánica, cada uno con su banco de contenido cerrado ---

export interface ObjetoInvestigable {
    id: string;
    label: string;
    icono: string;
    usaIA: boolean; // regla real, usada para validar la predicción del niño
    pista: string; // texto pre-escrito ("pista mediada"), no generado en vivo
}

export interface HipotesisPruebaReglaInvestiga {
    tipo: 'hipotesis_prueba_regla';
    preguntaLinterna: string;
    banco: ObjetoInvestigable[];
    minimoObjetos: number;
    maximoObjetos: number;
}

export interface EjemploEntrenamiento {
    id: string;
    label: string;
    icono: string;
    categoria: string; // p. ej. "vuela" | "no_vuela"
}

export interface EntrenarClasificadorInvestiga {
    tipo: 'entrenar_clasificador';
    categorias: [string, string];
    bancoEntrenamiento: EjemploEntrenamiento[]; // ejemplos "de un solo tipo" para el primer entrenamiento
    ejemploTrampa: EjemploEntrenamiento; // el que revela el fallo (p. ej. el avión, o el pingüino)
    bancoReentrenamiento: EjemploEntrenamiento[]; // ejemplos variados para el segundo entrenamiento
}

export interface ChipOpcion {
    id: string;
    label: string;
    valor: string; // p. ej. color hex, o key de pose/fondo
}

export interface CategoriaChips {
    label: string; // "Animal", "Color", "Acción"...
    opciones: ChipOpcion[];
}

// Constructor de imagen por chips (1.3: animal+color+acción; 3.1: criatura por
// color+tamaño+rareza+acción). Genérico en categorías para reutilizarse entre
// unidades con distinto vocabulario de chips.
export interface ConstruirPromptImagenInvestiga {
    tipo: 'construir_prompt_imagen';
    categorias: CategoriaChips[];
    permiteDetalleLibre: boolean; // pasa por moderationGate si es true
    comparaCambiandoUna: boolean; // 1.3: tras generar, pide cambiar SOLO una categoría y comparar
}

export interface FraseInvestigable {
    id: string;
    texto: string;
    esVerdadera: boolean;
    pistaSiFalsa?: string;
}

export interface DetectarInvencionInvestiga {
    tipo: 'detectar_invencion';
    banco: FraseInvestigable[]; // incluye exactamente 1 frase verdadera mezclada
}

// 2.1 (prompt flojo -> detalles uno a uno) y 3.3 (imagen por capas): misma
// mecánica de "añade un elemento, genera, compara" repetida sobre un banco.
export interface DetalleOpcion {
    id: string;
    label: string;
    categoria: string; // p. ej. "color" | "lugar" | "personaje" | "fondo"
}

export interface AfinarPromptDetallesInvestiga {
    tipo: 'afinar_prompt_detalles';
    promptBase: string;
    banco: DetalleOpcion[];
    preguntaClave: string;
}

// 2.2: elegir una fuente curada y comprobar una afirmación de la IA.
export interface FuenteOpcion {
    id: string;
    label: string;
    contenido: string;
}

export interface VerificarConFuenteInvestiga {
    tipo: 'verificar_con_fuente';
    afirmacionIA: string;
    fuentes: FuenteOpcion[];
    esCorrecta: boolean;
}

// 2.2 del tramo 10-11: la IA da DOS respuestas contradictorias a la misma
// pregunta; el niño registra su intuición, comprueba en una fuente segura y
// emite un veredicto. La señal pedagógica del docx es comparar la elección
// intuitiva inicial con la final basada en evidencia.
export interface DosRespuestasVerificaInvestiga {
    tipo: 'dos_respuestas_verifica';
    pregunta: string;
    respuestaA: string;
    respuestaB: string;
    /** 'A' | 'B': cuál es la correcta según las fuentes. */
    correcta: 'A' | 'B';
    fuentes: FuenteOpcion[];
}

// 2.2 del tramo 12-14: verificación cruzada. El alumno contrasta una
// afirmación con VARIAS fuentes (cada una fiable o no, y a favor o en contra),
// marca coincidencias/contradicciones y emite un veredicto con su grado de
// confianza — la señal es decidir por convergencia de fuentes fiables, no por
// una sola. Distinto de verificar_con_fuente (una fuente) y de
// dos_respuestas_verifica (dos respuestas de la IA).
export interface FuenteCruzada {
    id: string;
    label: string;
    contenido: string;
    fiable: boolean;
    apoyaAfirmacion: boolean;
}

export interface VerificacionCruzadaInvestiga {
    tipo: 'verificacion_cruzada';
    afirmacionIA: string;
    fuentes: FuenteCruzada[];
    /** ¿La afirmación es cierta según el consenso de las fuentes fiables? */
    afirmacionEsCierta: boolean;
}

// 2.3: comparar dos versiones contra un encargo y combinarlas.
export interface VersionOpcion {
    id: string;
    label: string;
    descripcion: string;
    cumpleEncargo: boolean;
}

export interface CompararVersionesInvestiga {
    tipo: 'comparar_versiones';
    encargo: string;
    versiones: [VersionOpcion, VersionOpcion];
}

// 2.4: escenarios de decisión con consecuencia (datos personales).
export interface DecisionEscenario {
    id: string;
    situacion: string;
    opciones: { id: string; label: string; segura: boolean; consecuencia: string }[];
}

export interface DecisionConsecuenciaInvestiga {
    tipo: 'decision_consecuencia';
    escenarios: DecisionEscenario[];
}

// 3.2: estructura de historia (principio/problema/final) con giro libre.
export interface OpcionHistoria {
    id: string;
    label: string;
}

export interface ConstruirHistoriaInvestiga {
    tipo: 'construir_historia';
    principios: OpcionHistoria[];
    problemas: OpcionHistoria[];
    finales: OpcionHistoria[];
    permiteGiroLibre: boolean;
}

// 3.4: mejora iterativa de una creación previa (dependeDe).
export interface CambioOpcion {
    id: string;
    label: string;
}

export interface IterarVersionInvestiga {
    tipo: 'iterar_version';
    cambiosPosibles: CambioOpcion[];
    /** 10-11 (3.4 «De la v1 a la v3»): 2 iteraciones documentadas. Default 1 (8-9). */
    iteraciones?: 1 | 2;
    /** 10-11: cada cambio se anota con su porqué (gated input). Default false. */
    pideMotivo?: boolean;
}

// 4.1: elegir/ordenar adivinanzas de un banco para montar un mini-juego.
export interface Adivinanza {
    id: string;
    pregunta: string;
    pista: string;
    respuesta: string;
    dificultad: 'facil' | 'media' | 'dificil';
}

export interface ConstruirJuegoInvestiga {
    tipo: 'construir_juego';
    temas: ChipOpcion[];
    bancoAdivinanzas: Adivinanza[];
}

// 4.2: montar el libro integrador (lee del Cuaderno vía dependeDe).
export interface MontarLibroInvestiga {
    tipo: 'montar_libro';
    estructuraSugerida: string[];
}

// 4.3: elegir a quién ayudar y con qué.
export interface IdeaParaAyudarInvestiga {
    tipo: 'idea_para_ayudar';
    destinatarios: ChipOpcion[];
    necesidadesPorDestinatario: Record<string, ChipOpcion[]>;
}

// 4.4: presentación final, repasando el Cuaderno (dependeDe).
export interface PresentarCreacionInvestiga {
    tipo: 'presentar_creacion';
    preguntasGuia: string[];
}

export type Investiga =
    | HipotesisPruebaReglaInvestiga
    | EntrenarClasificadorInvestiga
    | ConstruirPromptImagenInvestiga
    | DetectarInvencionInvestiga
    | AfinarPromptDetallesInvestiga
    | VerificarConFuenteInvestiga
    | DosRespuestasVerificaInvestiga
    | VerificacionCruzadaInvestiga
    | CompararVersionesInvestiga
    | DecisionConsecuenciaInvestiga
    | ConstruirHistoriaInvestiga
    | IterarVersionInvestiga
    | ConstruirJuegoInvestiga
    | MontarLibroInvestiga
    | IdeaParaAyudarInvestiga
    | PresentarCreacionInvestiga;

export interface Crea {
    tipo: string; // p. ej. "detector_ia" | "mini_cerebro" | "hechizo_imagen" | "expediente_error"
    instrucciones: string;
    guardaEnCuaderno: true;
}

export interface Detective {
    casoTruco?: string;
    preguntas: string[];
}

export interface FamiliaMision {
    nombre: string;
    duracionMinutos: number;
    modo: 'offline' | 'app';
    instrucciones: string;
    capturaEnApp: {
        tipo: 'checklist_con_iconos' | 'texto_corto' | 'numero';
        campo: string;
    };
}

export interface Comparte {
    publicaEnGaleria: boolean;
    insigniaPosible: { id: string; name: string; icon: string; description: string } | null;
    palabrasAlMuro: boolean;
}

export interface Accesibilidad {
    audioEnTodo: boolean;
    entradaPorVoz: boolean;
    sinLimiteTiempo: boolean;
}

export interface Seguridad {
    bancoObjetosCerrado: boolean;
    vozFiltrada: boolean;
    sinDatosPersonales: boolean;
}

export interface WebTexto {
    tituloPantalla: string;
    introVael: string;
    pasos: string[];
    cierreVael: string;
}

export interface UnidadAventuraSchema {
    id: string; // "1.1"
    nivel: 1 | 2 | 3 | 4;
    zona: Zona;
    unidadCurricular: string;
    titulo: string;
    objetivoBloom: string;
    competenciaFoco: string;
    ai4k12: string;
    duracionMinutos: number;
    producto: string;
    palabras: PalabraPoderosa[];
    mision: Mision;
    morti?: MortiIntervencion; // solo 12-14 en unidades de ética/sesgo/verificación
    investiga: Investiga;
    crea: Crea;
    detective: Detective;
    familia: FamiliaMision;
    comparte: Comparte;
    guionVael: string;
    andamiaje: 'alto' | 'medio' | 'bajo';
    accesibilidad: Accesibilidad;
    seguridad: Seguridad;
    senales: string[];
    web: WebTexto;
    dependeDe?: string[]; // ids de unidades cuyo artefacto debe existir antes en el Cuaderno
}

export interface MiniTarea {
    id: string;
    nombre: string;
    descripcion: string;
    competencia: string;
}

export interface MisionEspecialSchema {
    id: string; // "zona-descubre-especial"
    zona: ZonaNombre;
    nivel: 1 | 2 | 3 | 4;
    titulo: string;
    duracionMinutos: [number, number];
    introVael: string;
    miniTareas: MiniTarea[];
    cierreVael: string;
}
