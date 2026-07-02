export type Tramo = '8-9' | '10-11' | '12-14';
export type Competencia = 'pensamiento_critico' | 'calidad_preguntas' | 'autonomia_creativa' | 'verificacion';

export interface ScenarioSchema {
    id: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    language: 'es' | 'en';

    // Método Kidia: metadatos del reto real (ver Kidia_Metodologia_Aprendizaje.docx)
    tramo?: Tramo;
    nivel?: 1 | 2 | 3 | 4;
    unidad?: string; // "1.1" — agrupa las variantes de tramo del mismo reto
    competencia_foco?: Competencia;
    accesibilidad?: string[];
    nota_familia?: string;
    duracion_min?: [number, number];
    objetivo?: string; // Qué se aprende en este reto, en lenguaje claro (ficha docx: "Objetivo")
    producto?: string; // Nombre del entregable que produce el niño (ficha docx: "Producto y duración")

    // Logic & Progression
    required_badge_id?: string;
    unlocks_scenario_id?: string;

    // Reward
    badge: {
        id: string;
        name: string;
        icon: string;
        description: string;
    };

    // Content
    initial_node_id: string;
    nodes: Record<string, DialogueNode>;

    // New features
    deep_mode?: {
        enabled: boolean;
        content_markdown: string; // Markdown text for "Learn More"
    };

    quiz?: {
        questions: QuizQuestion[];
    };
}

export interface DialogueNode {
    id: string;
    sender: 'kidia' | 'morti' | 'user' | 'system';
    text: string; // Supports markdown/html?

    // Flow
    next_node_id?: string; // Auto advance
    options?: Choice[];

    // Interactive
    action?: 'smile' | 'think' | 'dance' | 'show_image' | 'trigger_quiz' | 'activity';
    action_data?: any; // e.g. image URL, or an Activity when action === 'activity'
}

// Tipos de actividad reutilizables para el paso "Crea" de cada reto real.
export type Activity = ClasificarActivity | CompararActivity | EscribirActivity | EleccionActivity;

export interface ClasificarActivity {
    type: 'clasificar';
    instruction: string;
    categories: [string, string];
    items: { id: string; label: string; icon?: string; correctCategory: 0 | 1 }[];
}

export interface CompararActivity {
    type: 'comparar';
    instruction: string;
    options: { id: string; label: string; content: string }[];
    askWhy?: boolean;
}

export interface EscribirActivity {
    type: 'escribir';
    instruction: string;
    placeholder: string;
    minLength?: number;
}

export interface EleccionActivity {
    type: 'eleccion';
    instruction: string;
    options: { id: string; label: string; correct?: boolean }[];
}

export interface Choice {
    label: string;
    next_node_id: string;
    style?: 'default' | 'primary' | 'danger';
}

export interface QuizQuestion {
    id: string;
    text: string;
    options: string[];
    correct_index: number;
    explanation: string;
}
