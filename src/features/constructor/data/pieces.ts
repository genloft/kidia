import type { Piece } from '../types';

export const PIECES: Piece[] = [
    // --- ETAPA 1: Fundamentos Básicos ---
    {
        id: 'p_data_raw',
        name: 'Datos Crudos (Sensores)',
        stage: 1,
        category: 'Datos',
        recommendedSlot: 'Datos',
        effects: { accuracy: 5, complexity: 2 },
        tooltip: 'Números puros de temperatura o píxeles sin clasificar.',
        curiousFact: 'Un coche autónomo genera hasta 4.000 GB de estos datos crudos cada día.'
    },
    {
        id: 'p_labels',
        name: 'Etiquetas Básicas',
        stage: 1,
        category: 'Entrenamiento',
        recommendedSlot: 'Entrenamiento',
        prerequisites: ['p_data_raw'],
        effects: { accuracy: 15, complexity: 5 },
        tooltip: 'Humanos diciendo: "Esto es un gato", "Esto es un perro".',
        curiousFact: 'Las primeras IAs necesitaron que millones de personas etiquetaran fotos manualmente por internet.'
    },
    {
        id: 'p_cleaning',
        name: 'Limpieza de Datos',
        stage: 1,
        category: 'Datos',
        recommendedSlot: 'Datos',
        prerequisites: ['p_data_raw'],
        effects: { accuracy: 20, performance: 10, complexity: 8 },
        tooltip: 'Quita basura, imágenes borrosas y números equivocados.',
        curiousFact: 'El 80% del trabajo real de un programador de IA es simplemente limpiar datos feos.'
    },
    {
        id: 'p_model_linear',
        name: 'Modelo Simple (Regresión)',
        stage: 1,
        category: 'Cerebro',
        recommendedSlot: 'Cerebro',
        effects: { accuracy: 10, performance: 20, complexity: 5 },
        tooltip: 'Una red que solo sabe trazar líneas rectas para adivinar el futuro.',
        curiousFact: 'Aunque suene moderno, la regresión lineal se inventó hace más de 200 años.'
    },
    {
        id: 'p_metric_basic',
        name: 'Métrica de Error',
        stage: 1,
        category: 'Examen',
        recommendedSlot: 'Examen',
        effects: { accuracy: 5, complexity: 2 },
        tooltip: 'Una calculadora que dice contra cuántas paredes se ha chocado el coche.',
        curiousFact: 'Sin una métrica, la IA no sabría si lo que hace está bien o mal, evolucionaría al azar.'
    },
    {
        id: 'p_output_text',
        name: 'Salida de Texto Simple',
        stage: 1,
        category: 'Salida',
        recommendedSlot: 'Salida',
        effects: { performance: 5 },
        tooltip: 'El modelo solo imprime un "SÍ" o un "NO".',
        curiousFact: 'Las primeras computadoras no tenían pantallas, solo imprimían en tiras de papel.'
    },

    // --- ETAPA 2: El Cerebro Crece ---
    {
        id: 'p_dataset_small',
        name: 'Dataset Pequeño',
        stage: 2,
        category: 'Datos',
        recommendedSlot: 'Datos',
        effects: { accuracy: 10, performance: 20, complexity: 5 },
        tooltip: 'Un excel con 1.000 filas ordenadas. Suficiente para jugar.',
        curiousFact: 'Los datasets pequeños y perfectos aprenden más rápido que los gigantes muy desordenados.'
    },
    {
        id: 'p_dataset_large',
        name: 'Gran Dataset (Millones)',
        stage: 2,
        category: 'Datos',
        recommendedSlot: 'Datos',
        effects: { accuracy: 30, performance: -20, complexity: 15 },
        tooltip: 'Millones y millones de textos de toda internet. Muy potente pero superlento.',
        curiousFact: 'ChatGPT leyó prácticamente todos los libros de Wikipedia y foros públicos de internet.'
    },
    {
        id: 'p_layers',
        name: 'Capas Ocultas',
        stage: 2,
        category: 'Cerebro',
        recommendedSlot: 'Cerebro',
        effects: { accuracy: 25, performance: -10, complexity: 20 },
        tooltip: 'Añade misteriosas capas en medio de la red que nadie entiende del todo.',
        curiousFact: 'Se llaman ocultas no porque estén escondidas, sino porque no son ni la entrada ni la salida.'
    },
    {
        id: 'p_regularization',
        name: 'Regularización (Dropout)',
        stage: 2,
        category: 'Entrenamiento',
        recommendedSlot: 'Entrenamiento',
        effects: { accuracy: 15, complexity: 10 },
        tooltip: 'Apaga neuronas al azar mientras entrena para que ninguna se vuelva "floja".',
        curiousFact: 'Obliga al cerebro artificial a trabajar en equipo porque siempre le falta gente.'
    },
    {
        id: 'p_traintest_split',
        name: 'Train / Test Split',
        stage: 2,
        category: 'Examen',
        recommendedSlot: 'Examen',
        effects: { accuracy: 20, complexity: 10 },
        tooltip: 'Esconde preguntas del examen final para que la red no pueda aprendérselas de memoria.',
        curiousFact: 'Si una IA saca un 10 perfectísimo, normalmente significa que hizo trampas memorizando datos.'
    },
    {
        id: 'p_output_vision',
        name: 'Clasificador Visual',
        stage: 2,
        category: 'Salida',
        recommendedSlot: 'Salida',
        effects: { performance: -10, complexity: 15 },
        tooltip: 'La pieza que te dice: "100% Gato, 0% Coche".',
        curiousFact: 'Durante años, clasificar perros contra magdalenas fue el gran reto de la visión por ordenador.'
    },

    // --- ETAPA 3: La Era Generativa (Magia Negra Inteligente) ---
    {
        id: 'p_tokenizer',
        name: 'Tokenizador',
        stage: 3,
        category: 'Datos',
        recommendedSlot: 'Datos',
        effects: { accuracy: 10, performance: 5, complexity: 10 },
        tooltip: 'Convierte las palabras en piezas de LEGO numéricas para que la IA sepa leer.',
        curiousFact: 'La IA no lee letras. Una palabra larga a veces la rompe en 4 "tokens" que no tienen significado solos.'
    },
    {
        id: 'p_context_window',
        name: 'Ventana de Contexto',
        stage: 3,
        category: 'Datos',
        recommendedSlot: 'Datos',
        prerequisites: ['p_tokenizer'],
        effects: { accuracy: 20, performance: -25, complexity: 20 },
        tooltip: 'Es como la memoria a corto plazo de la IA. Si es muy grande se acordará de todo tu chat.',
        curiousFact: 'Leer libros enteros de golpe requiere memorias que cuestan miles y miles de dólares.'
    },
    {
        id: 'p_model_transformer',
        name: 'Modelo Transformer',
        stage: 3,
        category: 'Cerebro',
        recommendedSlot: 'Cerebro',
        prerequisites: ['p_tokenizer'],
        effects: { accuracy: 40, performance: -30, complexity: 35 },
        tooltip: 'Arquitectura revolucionaria de 2017: "Attention is All You Need". El padre de los LLM.',
        curiousFact: 'El truco es que no leen en orden; miran todas las palabras de una frase a la vez, como una foto plana.'
    },
    {
        id: 'p_temperature',
        name: 'Temperatura',
        stage: 3,
        category: 'Entrenamiento',
        recommendedSlot: 'Entrenamiento',
        effects: { accuracy: -5, performance: 0, complexity: 5 },
        tooltip: 'Modifica si quieres la respuesta más probable (0.0) o más creativa y loca (1.0).',
        curiousFact: 'Mucha temperatura produce "alucinaciones" constantes.'
    },
    {
        id: 'p_memory',
        name: 'Memoria Vectorial',
        stage: 3,
        category: 'Datos',
        recommendedSlot: 'Datos',
        prerequisites: ['p_tokenizer'],
        effects: { accuracy: 15, performance: -10, complexity: 15 },
        tooltip: 'Añade capacidad de buscar en una biblioteca enorme antes de responder.',
        curiousFact: 'Convierte documentos enteros en un montón de puntos matemáticos.'
    },
    {
        id: 'p_probabilities',
        name: 'Capa Softmax (Probabilidades)',
        stage: 3,
        category: 'Cerebro',
        recommendedSlot: 'Cerebro',
        prerequisites: ['p_model_transformer'],
        effects: { accuracy: 5, complexity: 5 },
        tooltip: 'Convierte números raros en porcentajes del 0 al 100 de qué token va luego.',
        curiousFact: 'La red calcula esto para literalmente TODO su diccionario por cada palabra de salida.'
    },
    {
        id: 'p_output_chat',
        name: 'Interfaz de Chat (Streaming)',
        stage: 3,
        category: 'Salida',
        recommendedSlot: 'Salida',
        prerequisites: ['p_model_transformer', 'p_tokenizer'],
        effects: { performance: -5, complexity: 10 },
        tooltip: 'Va escribiendo texto a medida que la red adivina la siguiente palabra.',
        curiousFact: 'El streaming engaña al cerebro humano haciéndole creer que "piensa" en tiempo real.'
    },

    // --- ETAPA 4: Feedback (Alineamiento) ---
    {
        id: 'p_multimodal_in',
        name: 'Ojos y Oídos',
        stage: 4,
        category: 'Datos',
        recommendedSlot: 'Datos',
        effects: { accuracy: 20, performance: -15, complexity: 25 },
        tooltip: '¡Ahora la IA puede ver fotos e interpretar cosas que hablas!',
        curiousFact: 'Tu asistente de móvil hace esto todo el rato.'
    },
    {
        id: 'p_rlhf',
        name: 'Premios de Entrenadores',
        stage: 4,
        category: 'Entrenamiento',
        recommendedSlot: 'Entrenamiento',
        prerequisites: ['p_model_transformer'],
        effects: { accuracy: 30, performance: -20, complexity: 5 },
        tooltip: 'Le damos "Me Gusta" cuando contesta de forma amable y educada.',
        curiousFact: 'Hacer que un robot entienda modales lleva meses de esfuerzo de profesores humanos.'
    },
    {
        id: 'p_guardrails',
        name: 'Escudo Protector',
        stage: 4,
        category: 'Salida',
        recommendedSlot: 'Salida',
        effects: { accuracy: 20, performance: -10, complexity: 3 },
        tooltip: 'Un filtro mágico que atrapa palabrotas o cosas peligrosas antes de que las leas.',
        curiousFact: 'Incluso las IAs más listas a veces dicen tonterías que necesitan ser bloqueadas con este escudo.'
    },
    {
        id: 'p_human_eval',
        name: 'Jueces Expertos',
        stage: 4,
        category: 'Examen',
        recommendedSlot: 'Examen',
        effects: { accuracy: 15, performance: -25, complexity: 4 },
        tooltip: 'Doctores y profes revisan si la IA sabe matemáticas o solo finge ser lista.',
        curiousFact: 'Evaluar una Inteligencia Artificial grande puede ser tan duro como corregir exámenes universitarios.'
    },
    {
        id: 'p_fine_tuning',
        name: 'Clases Particulares',
        stage: 4,
        category: 'Entrenamiento',
        recommendedSlot: 'Entrenamiento',
        prerequisites: ['p_model_transformer'],
        effects: { accuracy: 25, performance: -15, complexity: 4 },
        tooltip: 'Cogemos un súper cerebro general y le damos clases solo de programación o solo de medicina.',
        curiousFact: 'Es como tener un estudiante de 10 genial en todo y luego meterlo en clases de especialización médica.'
    },

    // --- ETAPA 5: Singularidad (Optimización Extrema) ---
    {
        id: 'p_exascale',
        name: 'Edificio Ordenador Gigante',
        stage: 5,
        category: 'Datos',
        recommendedSlot: 'Datos',
        effects: { accuracy: 10, performance: 40, complexity: 6 },
        tooltip: 'Un ordenador del tamaño de un estadio de fútbol.',
        curiousFact: 'Para entrenar a IAs muy famosas se gastó electricidad suficiente para iluminar una ciudad pequeña por un mes.'
    },
    {
        id: 'p_moe',
        name: 'Cerebros en Equipo',
        stage: 5,
        category: 'Cerebro',
        recommendedSlot: 'Cerebro',
        prerequisites: ['p_model_transformer'],
        effects: { accuracy: 35, performance: -15, complexity: 7 },
        tooltip: 'No es un cerebro, ¡son 8 minicerebros trabajando juntos! El jefe decide a quién preguntarle según la pregunta.',
        curiousFact: 'Así funcionan los modelos rápidos y potentes; para matemáticas despiertan a un minicerebro, para poemas a otro.'
    },
    {
        id: 'p_synthetic_data',
        name: 'Soñar Datos Nuevos',
        stage: 5,
        category: 'Datos',
        recommendedSlot: 'Datos',
        effects: { accuracy: 25, performance: -10, complexity: 5 },
        tooltip: 'Como la IA ya se leyó todo internet, le pedimos a otra IA que escriba libros nuevos para seguir estudiando.',
        curiousFact: 'Muchos temen que si las IAs aprenden eternamente de "sueños" de otras IAs, se vuelvan locas.'
    },
    {
        id: 'p_self_play',
        name: 'Jugar Contra sí Misma',
        stage: 5,
        category: 'Entrenamiento',
        recommendedSlot: 'Entrenamiento',
        effects: { accuracy: 40, performance: -30, complexity: 8 },
        tooltip: 'La IA juega al ajedrez contra una copia de ella misma un millón de veces para ser imbatible.',
        curiousFact: 'Así fue como una máquina venció al campeón mundial de Go, jugando partidas fantasma durante días.'
    },
    {
        id: 'p_mixture_experts_2',
        name: 'Mixture of Experts (MoE)',
        stage: 5,
        category: 'Cerebro',
        recommendedSlot: 'Cerebro',
        effects: { accuracy: 45, performance: 30, complexity: 50 },
        tooltip: 'En lugar de un cerebro gigante, son 8 cerebritos especialistas cooperando.',
        curiousFact: 'Permite reducir los costes matemáticos a 1/8 de lo esperado manteniendo el nivel.'
    },
    {
        id: 'p_q_star',
        name: 'Búsqueda por Árbol (Test-Time Compute)',
        stage: 5,
        category: 'Cerebro',
        recommendedSlot: 'Cerebro',
        effects: { accuracy: 50, performance: -50, complexity: 60 },
        tooltip: 'El modelo no contesta rápido, sino que genera 50 caminos mentales en silencio y elige el mejor.',
        curiousFact: 'Tarda 10 segundos adicionales, pero resuelve problemas matemáticos imposibles en un solo paso.'
    },
    {
        id: 'p_auto_alignment',
        name: 'Superalineamiento (Auto-Corrección)',
        stage: 5,
        category: 'Examen',
        recommendedSlot: 'Examen',
        prerequisites: ['p_human_feedback'],
        effects: { accuracy: 35, complexity: 40 },
        tooltip: 'Otra IA mil veces más inteligente que tú vigila a la IA principal asegurando que siga tus órdenes.',
        curiousFact: 'Ilya Sutskever dedicó el 20% de los ordenadores de OpenAI persiguiendo este sueño.'
    },
    {
        id: 'p_recursive_improvement',
        name: 'Auto-Mejora Recursiva',
        stage: 5,
        category: 'Entrenamiento',
        recommendedSlot: 'Entrenamiento',
        prerequisites: ['p_compute_cluster'],
        effects: { accuracy: 100, complexity: 100 },
        tooltip: 'El código se optimiza a sí mismo en bucle sin intervención humana. (Hipotético).',
        curiousFact: 'El punto de no retorno matemático conocido como la Explosión de Inteligencia.'
    },
    {
        id: 'p_agentic_loop',
        name: 'Bucle Agéntico Autónomo',
        stage: 5,
        category: 'Salida',
        recommendedSlot: 'Salida',
        prerequisites: ['p_q_star'],
        effects: { accuracy: 25, performance: -40, complexity: 50 },
        tooltip: 'El modelo puede usar el ratón de tu PC, navegar por internet y programar sin que se lo pidas.',
        curiousFact: 'La IA no "quiere" hacer estas cosas, solo sigue el bucle reactivo configurado en código.'
    }
];
