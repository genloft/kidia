export interface Message {
    id: string;
    sender: 'friend' | 'user';
    text: string;
    options?: { label: string; nextId: string }[];
    nextId?: string; // Auto-advance to this message
    action?: 'quiz' | 'end';
}

export interface Scenario {
    id: string;
    title: string;
    description: string;
    initialMessageId: string;
    messages: Record<string, Message>;
    quiz?: Quiz;
    badge: {
        id: string;
        name: string;
        icon: string; // Emoji for now
    };
    requiredBadgeId?: string; // Logic for unlocking
    unlocksScenarioId?: string; // Just for visual reference if needed
    position?: { x: number; y: number }; // For visual map?
    isPremium?: boolean;
}

export interface Quiz {
    id: string;
    questions: {
        id: string;
        text: string;
        options: string[];
        correctIndex: number;
        explanation: string;
    }[];
}

export const scenarios: Scenario[] = [
    {
        id: 'intro-ia',
        title: '1. El Despertar',
        description: 'Descubre qué es la IA y cómo aprende patrones.',
        initialMessageId: 'start',
        messages: {
            'start': {
                id: 'start',
                sender: 'friend',
                text: '¡Hola! Soy Kidia. 👋 ¿Alguna vez te has preguntado cómo sabe Netflix qué series te gustan?',
                options: [
                    { label: '¡Sí! Es magia.', nextId: 'magic' },
                    { label: 'Supongo que analiza lo que veo.', nextId: 'analysis' }
                ]
            },
            'magic': {
                id: 'magic',
                sender: 'friend',
                text: '¡Parece magia, pero son matemáticas! 🎩✨ Se llama Inteligencia Artificial.',
                nextId: 'explanation'
            },
            'analysis': {
                id: 'analysis',
                sender: 'friend',
                text: '¡Exacto! 🧠 Es muy lista observando patrones. Eso es básicamente la Inteligencia Artificial.',
                nextId: 'explanation'
            },
            'explanation': {
                id: 'explanation',
                sender: 'friend',
                text: 'La IA no "piensa" como nosotros. 🤖 Aprende viendo millones de ejemplos. Como cuando aprendiste a diferenciar perros de gatos.',
                options: [
                    { label: '¿Entonces la IA aprende sola?', nextId: 'learning' },
                    { label: '¡Qué miedo!', nextId: 'fear' }
                ]
            },
            'fear': {
                id: 'fear',
                sender: 'friend',
                text: '¡No te asustes! 🛡️ Es solo una herramienta, como un martillo o una calculadora. Depende de cómo la usemos.',
                nextId: 'learning'
            },
            'learning': {
                id: 'learning',
                sender: 'friend',
                text: 'Más o menos. Necesita que le demos muchos datos (fotos, textos...). Cuantos más datos, mejor aprende. Se llama "Entrenamiento".',
                action: 'quiz',
                nextId: 'quiz-start'
            },
            'quiz-start': {
                id: 'quiz-start',
                sender: 'friend',
                text: '¡Vamos a ver si lo has pillado! Test rápido. 🚀',
                action: 'quiz'
            }
        },
        quiz: {
            id: 'quiz-1',
            questions: [
                {
                    id: 'q1',
                    text: '¿Cómo aprende la IA?',
                    options: ['Leyendo libros sola en la biblioteca', 'Viendo muchos ejemplos y buscando patrones', 'Comiendo chips de silicio'],
                    correctIndex: 1,
                    explanation: '¡Eso es! Necesita ver muchos ejemplos para encontrar patrones.'
                }
            ]
        },
        badge: {
            id: 'badge-explorer',
            name: 'Explorador de Datos',
            icon: '🧭'
        },
        unlocksScenarioId: 'learning-patterns'
    },
    {
        id: 'learning-patterns',
        title: '2. Detectives de Patrones',
        description: 'Entramos en el Modo Profundo. ¿Cómo distingue la IA un chihuahua de un muffin?',
        requiredBadgeId: 'badge-explorer',
        initialMessageId: 'start',
        messages: {
            'start': {
                id: 'start',
                sender: 'friend',
                text: '¡Bienvenido de nuevo, Explorador! 🕵️‍♀️ Ahora vamos a ver cómo "ve" la IA.',
                nextId: 'pixels'
            },
            'pixels': {
                id: 'pixels',
                sender: 'friend',
                text: 'Para la IA, una foto es solo un montón de números. Píxeles. 🔢',
                options: [
                    { label: '¿Números?', nextId: 'numbers' },
                    { label: '¡Qué aburrido!', nextId: 'boring' }
                ]
            },
            'boring': {
                id: 'boring',
                sender: 'friend',
                text: '¡Para nada! Es como Matrix. 😎',
                nextId: 'numbers'
            },
            'numbers': {
                id: 'numbers',
                sender: 'friend',
                text: 'Cada color es un número. Ella busca formas: líneas, curvas... y luego las junta para "ver" una oreja o una nariz.',
                action: 'quiz'
            }
        },
        quiz: {
            id: 'quiz-2',
            questions: [
                {
                    id: 'q2',
                    text: '¿Qué ve realmente la IA cuando mira una foto?',
                    options: ['Una imagen bonita como nosotros', 'Un montón de números (píxeles)', 'El alma de la persona'],
                    correctIndex: 1,
                    explanation: '¡Correcto! Traduce los colores a números.'
                }
            ]
        },
        badge: {
            id: 'badge-patron',
            name: 'Maestro de Patrones',
            icon: '🔍'
        },
        unlocksScenarioId: 'ethics-basic'
    },
    {
        id: 'ethics-basic',
        title: '3. El Dilema del Robot',
        description: 'Gazapos y Ética. ¿Puede equivocarse la IA?',
        requiredBadgeId: 'badge-patron',
        initialMessageId: 'start',
        messages: {
            'start': {
                id: 'start',
                sender: 'friend',
                text: 'Tengo una pregunta seria. 🤔 Si la IA aprende de internet... y en internet hay mentiras...',
                options: [
                    { label: 'Aprenderá mentiras.', nextId: 'bias' },
                    { label: 'Ella sabe lo que es verdad.', nextId: 'truth' }
                ]
            },
            'truth': {
                id: 'truth',
                sender: 'friend',
                text: '¡Ojalá! Pero no. La IA no sabe qué es verdad o mentira. Solo sabe qué es "probable".',
                nextId: 'bias'
            },
            'bias': {
                id: 'bias',
                sender: 'friend',
                text: '¡Exacto! A veces aprende cosas feas o injustas. Se llaman "Sesgos". Por eso los humanos tenemos que vigilarla. 👀',
                action: 'quiz'
            }
        },
        quiz: {
            id: 'quiz-3',
            questions: [
                {
                    id: 'q3',
                    text: 'Si entrenamos a una IA solo con fotos de gatos negros...',
                    options: ['Sabrá que existen gatos blancos', 'Pensará que TODOS los gatos son negros', 'Se enfadará'],
                    correctIndex: 1,
                    explanation: '¡Claro! Solo sabe lo que le enseñamos. Eso es un sesgo.'
                }
            ]
        },
        badge: {
            id: 'badge-guardian',
            name: 'Guardián Ético',
            icon: '🛡️'
        },
        unlocksScenarioId: 'creative-ai'
    },
    {
        id: 'creative-ai',
        title: '4. IA Creativa (Premium)',
        description: 'Genera historias y dibujos con Kidia. Modo avanzado.',
        requiredBadgeId: 'badge-guardian',
        isPremium: true,
        initialMessageId: 'start',
        messages: {
            'start': {
                id: 'start',
                sender: 'friend',
                text: '¡Hola VIP! 🌟 En esta misión vamos a usar mi cerebro creativo a tope.',
                nextId: 'prompt'
            },
            'prompt': {
                id: 'prompt',
                sender: 'friend',
                text: 'Pídeme que invente un cuento sobre lo que quieras.',
                // Here we would enable the AI Chat input by default
            }
        },
        badge: {
            id: 'badge-creator',
            name: 'Creador de Mundos',
            icon: '✨'
        }
    }
];
