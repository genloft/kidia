// Dictionary extensions for pieces, objectives, and tutorial.
export const piecesEs = {
    p_data_raw: { name: "Datos Crudos (Sensores)", tooltip: "Números puros de temperatura o píxeles sin clasificar.", curiousFact: "Un coche autónomo genera hasta 4.000 GB de estos datos crudos cada día." },
    p_labels: { name: "Etiquetas Básicas", tooltip: 'Humanos diciendo: "Esto es un gato", "Esto es un perro".', curiousFact: "Las primeras IAs necesitaron que millones de personas etiquetaran fotos manualmente." },
    p_cleaning: { name: "Limpieza de Datos", tooltip: "Quita basura, imágenes borrosas y números equivocados.", curiousFact: "El 80% del trabajo real de un programador de IA es simplemente limpiar datos feos." },
    p_model_linear: { name: "Modelo Simple (Regresión)", tooltip: "Una red que solo sabe trazar líneas rectas para adivinar el futuro.", curiousFact: "Aunque suene moderno, la regresión lineal se inventó hace más de 200 años." },
    p_metric_basic: { name: "Métrica de Error", tooltip: "Una calculadora que dice contra cuántas paredes se ha chocado el coche.", curiousFact: "Sin una métrica, la IA no sabría si lo que hace está bien o mal, evolucionaría al azar." },
    p_output_text: { name: "Salida de Texto Simple", tooltip: 'El modelo solo imprime un "SÍ" o un "NO".', curiousFact: "Las primeras computadoras no tenían pantallas, solo imprimían en tiras de papel." },

    p_dataset_small: { name: "Dataset Pequeño", tooltip: "Un excel con 1.000 filas ordenadas. Suficiente para jugar.", curiousFact: "Los datasets pequeños y perfectos aprenden más rápido que los gigantes desordenados." },
    p_dataset_large: { name: "Gran Dataset (Millones)", tooltip: "Millones y millones de textos de toda internet. Muy potente pero superlento.", curiousFact: "ChatGPT leyó prácticamente todos los libros de Wikipedia y foros públicos." },
    p_layers: { name: "Capas Ocultas", tooltip: "Añade misteriosas capas en medio de la red que nadie entiende del todo.", curiousFact: "Se llaman ocultas no porque estén escondidas, sino porque no son ni la entrada ni la salida." },
    p_regularization: { name: "Regularización (Dropout)", tooltip: "Apaga neuronas al azar mientras entrena para que ninguna se vuelva 'floja'.", curiousFact: "Obliga al cerebro artificial a trabajar en equipo porque siempre le falta gente." },
    p_traintest_split: { name: "Train / Test Split", tooltip: "Esconde preguntas del examen final para que la red no pueda aprendérselas de memoria.", curiousFact: "Si una IA saca un 10 perfectísimo, normalmente significa que hizo trampas." },
    p_output_vision: { name: "Clasificador Visual", tooltip: 'La pieza que te dice: "100% Gato, 0% Coche".', curiousFact: "Durante años, clasificar perros contra magdalenas fue el gran reto de la visión por ordenador." },

    p_tokenizer: { name: "Tokenizador", tooltip: "Convierte las palabras en piezas numéricas para que la IA sepa leer.", curiousFact: "La IA no lee letras. Una palabra larga a veces la rompe en 4 'tokens'." },
    p_context_window: { name: "Ventana de Contexto", tooltip: "Es como la memoria a corto plazo de la IA. Si es muy grande se acordará de todo.", curiousFact: "Leer libros enteros de golpe requiere memorias que cuestan miles de dólares." },
    p_model_transformer: { name: "Modelo Transformer", tooltip: "Arquitectura revolucionaria de 2017. El padre de los LLM.", curiousFact: "Mirar todas las palabras de una frase a la vez, como una foto plana." },
    p_temperature: { name: "Temperatura", tooltip: "Modifica si quieres la respuesta más probable (0.0) o más creativa (1.0).", curiousFact: "Mucha temperatura produce 'alucinaciones' constantes." },
    p_memory: { name: "Memoria Vectorial", tooltip: "Añade capacidad de buscar en una biblioteca enorme antes de responder.", curiousFact: "Convierte documentos enteros en un montón de puntos matemáticos." },
    p_probabilities: { name: "Capa Softmax", tooltip: "Convierte números en porcentajes del 0 al 100 de qué token va luego.", curiousFact: "La red calcula esto para literalmente TODO su diccionario por cada palabra." },
    p_output_chat: { name: "Interfaz de Chat (Streaming)", tooltip: "Va escribiendo texto a medida que la red adivina la siguiente palabra.", curiousFact: "El streaming engaña al humano haciéndole creer que 'piensa' en tiempo real." },

    p_multimodal_in: { name: "Ojos y Oídos", tooltip: "¡Ahora la IA puede ver fotos e interpretar cosas que hablas!", curiousFact: "Tu asistente de móvil hace esto todo el rato." },
    p_rlhf: { name: "Premios de Entrenadores", tooltip: 'Le damos "Me Gusta" cuando contesta de forma amable y educada.', curiousFact: "Hacer que un robot entienda modales lleva meses de esfuerzo." },
    p_guardrails: { name: "Escudo Protector", tooltip: "Un filtro mágico que atrapa palabrotas o cosas peligrosas antes de que las leas.", curiousFact: "Incluso las IAs más listas a veces dicen tonterías que necesitan ser bloqueadas." },
    p_human_eval: { name: "Jueces Expertos", tooltip: "Doctores y profes revisan si la IA sabe matemáticas o solo finge ser lista.", curiousFact: "Evaluar una IA grande puede ser tan duro como corregir exámenes universitarios." },
    p_fine_tuning: { name: "Clases Particulares", tooltip: "Cogemos un súper cerebro general y le damos clases solo de programación.", curiousFact: "Es como tener un experto y meterlo en un máster de especialización médica." },

    p_exascale: { name: "Edificio Ordenador Gigante", tooltip: "Un ordenador del tamaño de un estadio de fútbol.", curiousFact: "Para entrenar IAs se gastó electricidad suficiente para iluminar una ciudad pequeña." },
    p_moe: { name: "Cerebros en Equipo", tooltip: "¡Son 8 minicerebros trabajando juntos! El jefe decide a quién preguntarle.", curiousFact: "Para matemáticas despiertan a un minicerebro, para poemas a otro." },
    p_synthetic_data: { name: "Soñar Datos Nuevos", tooltip: "Como la IA ya se leyó todo internet, le pedimos a otra IA que escriba libros nuevos.", curiousFact: "Muchos temen que si las IAs aprenden de 'sueños', se vuelvan locas." },
    p_self_play: { name: "Jugar Contra sí Misma", tooltip: "La IA juega al ajedrez contra una copia de ella misma un millón de veces para ser imbatible.", curiousFact: "Así fue como una máquina venció al campeón mundial de Go." },
    p_mixture_experts_2: { name: "Mixture of Experts", tooltip: "En lugar de un cerebro gigante, son 8 especialistas cooperando.", curiousFact: "Permite reducir los costes matemáticos a 1/8 de lo esperado." },
    p_q_star: { name: "Búsqueda por Árbol", tooltip: "El modelo elige el mejor camino entre 50 en lugar de contestar al instante.", curiousFact: "Tarda 10 segundos, pero resuelve problemas matemáticos imposibles." },
    p_auto_alignment: { name: "Superalineamiento", tooltip: "Otra IA mil veces más inteligente que tú vigila a la IA principal.", curiousFact: "OpenAI dedicó el 20% de sus ordenadores persiguiendo este sueño." },
    p_recursive_improvement: { name: "Auto-Mejora Recursiva", tooltip: "El código se optimiza a sí mismo en bucle. (Hipotético).", curiousFact: "El punto de no retorno matemático conocido como la Explosión de Inteligencia." },
    p_agentic_loop: { name: "Bucle Agéntico Autónomo", tooltip: "El modelo puede usar el ratón, navegar y programar sin que se lo pidas.", curiousFact: "La IA no 'quiere' hacer estas cosas, solo sigue el bucle reactivo." }
};

export const piecesEn = {
    p_data_raw: { name: "Raw Data (Sensors)", tooltip: "Pure temperature numbers or unsorted pixels.", curiousFact: "A self-driving car generates up to 4,000 GB of this raw data every day." },
    p_labels: { name: "Basic Labels", tooltip: 'Humans saying: "This is a cat", "This is a dog".', curiousFact: "Early AIs required millions of people to manually label photos." },
    p_cleaning: { name: "Data Cleaning", tooltip: "Removes garbage, blurry images, and wrong numbers.", curiousFact: "80% of an AI programmer's real work is simply cleaning ugly data." },
    p_model_linear: { name: "Simple Model (Regression)", tooltip: "A network that only knows how to draw straight lines to guess the future.", curiousFact: "Despite sounding modern, linear regression was invented over 200 years ago." },
    p_metric_basic: { name: "Error Metric", tooltip: "A calculator that counts how many walls the car crashed into.", curiousFact: "Without a metric, the AI wouldn't know if what it does is right or wrong." },
    p_output_text: { name: "Simple Text Output", tooltip: 'The model only prints a "YES" or a "NO".', curiousFact: "Early computers had no screens, they only printed on paper strips." },

    p_dataset_small: { name: "Small Dataset", tooltip: "An Excel with 1,000 sorted rows. Enough to play.", curiousFact: "Small, perfect datasets learn faster than giant messy ones." },
    p_dataset_large: { name: "Large Dataset (Millions)", tooltip: "Millions of texts from all over the internet. Very powerful but super slow.", curiousFact: "ChatGPT read practically all Wikipedia books and public forums." },
    p_layers: { name: "Hidden Layers", tooltip: "Adds mysterious layers in the middle of the network that nobody fully understands.", curiousFact: "Called hidden not because they are invisible, but because they are neither input nor output." },
    p_regularization: { name: "Regularization (Dropout)", tooltip: "Randomly turns off neurons while training so none get 'lazy'.", curiousFact: "Forces the artificial brain to work as a team because it's always short-staffed." },
    p_traintest_split: { name: "Train / Test Split", tooltip: "Hides final exam questions so the network can't memorize them.", curiousFact: "If an AI gets a perfect score, it usually means it cheated." },
    p_output_vision: { name: "Visual Classifier", tooltip: 'The piece that tells you: "100% Cat, 0% Car".', curiousFact: "For years, classifying dogs vs muffins was computer vision's great challenge." },

    p_tokenizer: { name: "Tokenizer", tooltip: "Converts words into numerical pieces so the AI can read.", curiousFact: "The AI doesn't read letters. A long word is sometimes broken into 4 'tokens'." },
    p_context_window: { name: "Context Window", tooltip: "Like the AI's short-term memory. If it's too big it remembers your whole chat.", curiousFact: "Reading entire books at once requires memory that costs thousands of dollars." },
    p_model_transformer: { name: "Transformer Model", tooltip: "Revolutionary 2017 architecture. The father of LLMs.", curiousFact: "It looks at all the words in a sentence at once, like a flat picture." },
    p_temperature: { name: "Temperature", tooltip: "Modifies if you want the most probable answer (0.0) or a more creative one (1.0).", curiousFact: "High temperature produces constant 'hallucinations'." },
    p_memory: { name: "Vector Memory", tooltip: "Adds the ability to search a huge library before answering.", curiousFact: "Converts entire documents into a bunch of mathematical points." },
    p_probabilities: { name: "Softmax Layer", tooltip: "Converts numbers into 0-100 percentages of what token goes next.", curiousFact: "The network calculates this for literally ALL its dictionary for every word." },
    p_output_chat: { name: "Chat Interface (Streaming)", tooltip: "Types text as the network guesses the next word.", curiousFact: "Streaming tricks the human brain into thinking it 'thinks' in real time." },

    p_multimodal_in: { name: "Eyes and Ears", tooltip: "Now the AI can see photos and interpret things you say!", curiousFact: "Your mobile assistant does this all the time." },
    p_rlhf: { name: "Trainer Rewards", tooltip: 'We give it a "Like" when it answers kindly and politely.', curiousFact: "Making a robot understand manners takes months of effort." },
    p_guardrails: { name: "Protector Shield", tooltip: "A magic filter that catches bad words or dangerous things before you read them.", curiousFact: "Even the smartest AIs sometimes say nonsense that needs blocking." },
    p_human_eval: { name: "Expert Judges", tooltip: "Doctors and teachers review if the AI knows math or just pretends to be smart.", curiousFact: "Evaluating a large AI can be as hard as grading university exams." },
    p_fine_tuning: { name: "Private Lessons", tooltip: "We take a super general brain and give it classes only in programming.", curiousFact: "It's like taking an expert and putting them in a medical specialization master." },

    p_exascale: { name: "Giant Computer Building", tooltip: "A computer the size of a football stadium.", curiousFact: "Training AIs consumed enough electricity to light a small city." },
    p_moe: { name: "Team of Brains", tooltip: "It's 8 mini-brains working together! The boss decides who to ask.", curiousFact: "For math they wake up one mini-brain, for poems another." },
    p_synthetic_data: { name: "Dreaming New Data", tooltip: "Since the AI already read the whole internet, we ask another AI to write new books.", curiousFact: "Many fear that if AIs learn from 'dreams', they'll go crazy." },
    p_self_play: { name: "Play Against Itself", tooltip: "The AI plays chess against a copy of itself a million times to become unbeatable.", curiousFact: "This is how a machine beat the Go world champion." },
    p_mixture_experts_2: { name: "Mixture of Experts", tooltip: "Instead of a giant brain, it's 8 cooperating specialists.", curiousFact: "Allows reducing mathematical costs to 1/8 of what's expected." },
    p_q_star: { name: "Tree Search", tooltip: "The model chooses the best path among 50 instead of answering instantly.", curiousFact: "It takes 10 seconds, but solves impossible mathematical problems." },
    p_auto_alignment: { name: "Superalignment", tooltip: "Another AI a thousand times smarter than you watches the main AI.", curiousFact: "OpenAI dedicated 20% of its computers pursuing this dream." },
    p_recursive_improvement: { name: "Recursive Self-Improvement", tooltip: "The code optimizes itself in a loop. (Hypothetical).", curiousFact: "The mathematical point of no return known as the Intelligence Explosion." },
    p_agentic_loop: { name: "Autonomous Agentic Loop", tooltip: "The model can use your mouse, browse, and code without asking.", curiousFact: "The AI doesn't 'want' to do these things, just follows the loop." }
};

export const piecesRu = {
    p_data_raw: { name: "Сырые данные (Сенсоры)", tooltip: "Чистые числа или неотсортированные пиксели.", curiousFact: "Беспилотный автомобиль генерирует до 4000 ГБ сырых данных ежедневно." },
    p_labels: { name: "Базовые метки", tooltip: 'Люди говорят: "Это кот", "Это собака".', curiousFact: "Первым ИИ требовались миллионы людей для ручной разметки." },
    p_cleaning: { name: "Очистка данных", tooltip: "Удаляет мусор, размытые изображения и неверные числа.", curiousFact: "80% работы ИИ-программиста — это очистка плохих данных." },
    p_model_linear: { name: "Простая модель (Регрессия)", tooltip: "Сеть, которая умеет рисовать только прямые линии для предсказаний.", curiousFact: "Хотя звучит современно, линейная регрессия была изобретена более 200 лет назад." },
    p_metric_basic: { name: "Метрика ошибки", tooltip: "Калькулятор, считающий, в сколько стен врезалась машина.", curiousFact: "Без метрики ИИ не знал бы, правильно он поступает или нет." },
    p_output_text: { name: "Простой текстовый вывод", tooltip: 'Модель выдает только "ДА" или "НЕТ".', curiousFact: "У первых компьютеров не было экранов, они печатали на бумаге." },

    p_dataset_small: { name: "Малый датасет", tooltip: "Excel на 1000 строк. Достаточно для игры.", curiousFact: "Маленькие и идеальные данные обучают быстрее, чем гигантские и грязные." },
    p_dataset_large: { name: "Большой датасет (Миллионы)", tooltip: "Миллионы текстов со всего интернета. Мощно, но медленно.", curiousFact: "ChatGPT прочитал почти всю Википедию." },
    p_layers: { name: "Скрытые слои", tooltip: "Добавляет загадочные слои в центр сети, которые никто до конца не понимает.", curiousFact: "Они называются скрытыми, потому что не являются ни входом, ни выходом." },
    p_regularization: { name: "Регуляризация (Dropout)", tooltip: "Случайно отключает нейроны во время обучения, чтобы никто не 'ленился'.", curiousFact: "Заставляет искусственный мозг работать в команде." },
    p_traintest_split: { name: "Разделение Train/Test", tooltip: "Скрывает вопросы выпускного экзамена, чтобы сеть не могла их зазубрить.", curiousFact: "Если ИИ получает 10 из 10, скорее всего, он сжульничал." },
    p_output_vision: { name: "Визуальный классификатор", tooltip: 'Деталь, которая говорит: "100% Кот, 0% Машина".', curiousFact: "Долгие годы отличИИе собаки от кекса было главной задачей компьютерного зрения." },

    p_tokenizer: { name: "Токенизатор", tooltip: "Превращает слова в числовые детали.", curiousFact: "ИИ не читает буквы. Длинное слово может разбиваться на 4 'токена'." },
    p_context_window: { name: "Окно контекста", tooltip: "Краткосрочная память ИИ. Если она огромная, он запомнит весь чат.", curiousFact: "Чтение целых книг за раз требует памяти за тысячи долларов." },
    p_model_transformer: { name: "Модель Transformer", tooltip: "Революция 2017 года. Отец LLM.", curiousFact: "Смотрит на все слова предложения одновременно, как на фото." },
    p_temperature: { name: "Температура", tooltip: "Определяет, нужен ли логичный ответ (0.0) или более креативный (1.0).", curiousFact: "Высокая температура вызывает 'галлюцинации'." },
    p_memory: { name: "Векторная память", tooltip: "Добавляет способность искать в базе данных перед ответом.", curiousFact: "Превращает целые документы в набор математических точек." },
    p_probabilities: { name: "Слой Softmax", tooltip: "Превращает числа в вероятности 0-100% для следующего слова.", curiousFact: "Сеть вычисляет это для всего словаря при каждом слове." },
    p_output_chat: { name: "Интерфейс чата", tooltip: "Печатает текст по мере угадывания следующего слова.", curiousFact: "Стриминг обманывает мозг человека, заставляя верить, что ИИ 'думает'." },

    p_multimodal_in: { name: "Глаза и уши", tooltip: "Теперь ИИ может видеть фото и слушать голос!", curiousFact: "Ваш мобильный ассистент делает это постоянно." },
    p_rlhf: { name: "Награды тренеров", tooltip: 'Мы ставим "Лайк", когда он отвечает вежливо.', curiousFact: "Обучить робота манерам занимает месяцы." },
    p_guardrails: { name: "Защитный щит", tooltip: "Фильтр, который ловит плохие слова и опасные советы.", curiousFact: "Даже умные ИИ иногда говорят ерунду, которую нужно блокировать." },
    p_human_eval: { name: "Судьи-эксперты", tooltip: "Врачи и учителя проверяют, умный ИИ или только притворяется.", curiousFact: "Оценивать большой ИИ так же сложно, как проверять университетские экзамены." },
    p_fine_tuning: { name: "Частные уроки", tooltip: "Мы берем общий супермозг и даем обучение только программированию.", curiousFact: "Как взять эксперта и отправить на медицинские курсы." },

    p_exascale: { name: "Гигантский компьютер", tooltip: "Компьютер размером с футбольный стадион.", curiousFact: "Для обучения ИИ тратится столько энергии, сколько нужно небольшому городу." },
    p_moe: { name: "Команда мозгов", tooltip: "Это 8 мини-мозгов вместе! Босс решает, кого спросить.", curiousFact: "Для математики просыпается один мини-мозг, для стихов другой." },
    p_synthetic_data: { name: "Сны о новых данных", tooltip: "ИИ прочел весь интернет, и мы просим другой ИИ написать новые книги.", curiousFact: "Многие боятся, что от 'снов' ИИ сойдет с ума." },
    p_self_play: { name: "Играть с самим собой", tooltip: "ИИ играет в шахматы сам с собой миллион раз, чтобы стать непобедимым.", curiousFact: "Именно так машина победила чемпиона мира по Го." },
    p_mixture_experts_2: { name: "Mixture of Experts", tooltip: "Вместо одного гигантского мозга работают 8 специалистов.", curiousFact: "Снижает математические затраты в 8 раз." },
    p_q_star: { name: "Поиск по дереву", tooltip: "Модель выбирает лучший путь из 50 вместо моментального ответа.", curiousFact: "Занимает 10 секунд, но решает невозможные задачи." },
    p_auto_alignment: { name: "Супервыравнивание", tooltip: "Другой ИИ в тысячу раз умнее вас следит за главным ИИ.", curiousFact: "OpenAI посвятило 20% компьютеров этой мечте." },
    p_recursive_improvement: { name: "Рекурсивное самосовершенствование", tooltip: "Код оптимизирует сам себя в цикле. (Гипотетически).", curiousFact: "Точка невозврата, известная как Взрыв Интеллекта." },
    p_agentic_loop: { name: "Автономный цикл", tooltip: "Модель может использовать вашу мышь, браузер и писать код.", curiousFact: "ИИ не 'хочет' этого делать, он просто следует циклу." }
};

export const objectivesEs = {
    '1_all_slots': 'Llena al menos 3 slots básicos',
    '1_acc': 'Logra Precisión mayor a 30',
    '1_labels': 'Usa etiquetas o limpieza para la calidad',
    '2_upgrade_brain': 'Moderniza el Cerebro (Usa Capas Ocultas)',
    '2_acc': 'Precisión mayor a 60',
    '2_overfitting': 'Impide Overfitting (Usa Split o Regularización)',
    '3_transformer': 'Usa Modelo Transformer',
    '3_acc': 'Precisión mayor a 85',
    '3_complex': 'Complejidad alta (sobre 70)',
    '4_human': 'Agrega feedback humano (RLHF)',
    '4_safe': 'Implementa filtros (Guardrails)',
    '4_acc': 'Llega al 100% de Precisión',
    '5_compute': 'Poder de Cómputo Exaescala',
    '5_recursive': 'Mejora Recursiva',
    '5_singularity': 'Complejidad Absoluta (Límite 100)'
};

export const objectivesEn = {
    '1_all_slots': 'Fill at least 3 basic slots',
    '1_acc': 'Achieve Accuracy above 30',
    '1_labels': 'Use labels or cleaning for quality',
    '2_upgrade_brain': 'Upgrade the Brain (Use Hidden Layers)',
    '2_acc': 'Accuracy above 60',
    '2_overfitting': 'Prevent Overfitting (Use Split or Regularization)',
    '3_transformer': 'Use Transformer Model',
    '3_acc': 'Accuracy above 85',
    '3_complex': 'High Complexity (above 70)',
    '4_human': 'Add human feedback (RLHF)',
    '4_safe': 'Implement filters (Guardrails)',
    '4_acc': 'Reach 100% Accuracy',
    '5_compute': 'Exascale Computing Power',
    '5_recursive': 'Recursive Self-Improvement',
    '5_singularity': 'Absolute Complexity (Limit 100)'
};

export const objectivesRu = {
    '1_all_slots': 'Заполни минимум 3 базовых слота',
    '1_acc': 'Достигни точности выше 30',
    '1_labels': 'Используй метки или очистку данных',
    '2_upgrade_brain': 'Обнови Мозг (Используй Скрытые слои)',
    '2_acc': 'Точность выше 60',
    '2_overfitting': 'Предотврати переобучение (Сплит или Регуляризация)',
    '3_transformer': 'Используй модель Transformer',
    '3_acc': 'Точность выше 85',
    '3_complex': 'Высокая сложность (выше 70)',
    '4_human': 'Добавь обратную связь (RLHF)',
    '4_safe': 'Используй фильтры (Guardrails)',
    '4_acc': 'Достигни 100% точности',
    '5_compute': 'Экзафлопсные вычисления',
    '5_recursive': 'Рекурсивное улучшение',
    '5_singularity': 'Абсолютная сложность (Предел 100)'
};

export const tutEs = {
    welcomeTitle: "¡Bienvenido a Kidia!",
    welcomeMsg: "¡Hola, futuro creador! 🚀 Construir una Inteligencia Artificial es como armar un robot de Lego.\n\n¿Quieres que te enseñe cómo funciona tu laboratorio?",
    libTitle: "La Librería de Piezas",
    libMsg: "En esta caja de la izquierda tienes todas tus piezas mágicas.\n\nCada bloque tiene un superpoder diferente.",
    slotsTitle: "Las Cajas de Nuestra IA",
    slotsMsg: "En el centro está tu Mesa de Creación.\nHay 5 cajas que debemos conectar ordenadamente:\n\n1️⃣ Datos: La 'comida'.\n2️⃣ Cerebro: El motor pensante.\n3️⃣ Entrenamiento: Donde aprende.\n4️⃣ Examen: Donde la evaluamos.\n5️⃣ Salida: Cómo nos responde.",
    mentorTitle: "El Panel del Mentor",
    mentorMsg: "A la derecha estaré yo, tu asistente robot 🤖.\n\nTe daré pistas y revisaré si tu modelo está listo.",
    startTitle: "¡Manos a la obra!",
    startMsg: "¡Ya eres casi un experto!\n\nDale al botón de ¡Entendido! y empezaremos a colocar las primeras piezas.",

    stg1s1Title: "¡Paso 1: La Comida!",
    stg1s1Msg: "Toda IA necesita 'comer' información para aprender.\n\n👉 ¡Arrastra la pieza azul 'Datos Crudos' a la caja de 'Datos'!",
    stg1s2Title: "¡Paso 2: El Cerebro!",
    stg1s2Msg: "¡Excelente! Pero los números solos no piensan.\n\n👉 Arrastra el 'Modelo Simple' a la caja del 'Cerebro'.",
    stg1s3Title: "¡Paso 3: A Estudiar!",
    stg1s3Msg: "El cerebro es nuevo.\n\n👉 Arrastra 'Etiquetas Básicas' a 'Entrenamiento' para enseñarle.",
    stg1s4Title: "¡Paso 4: El Examen Final!",
    stg1s4Msg: "¿Cómo sabemos si falla?\n\n👉 Arrastra 'Métrica de Error' a 'Examen'. ¡Ponle nota!",
    stg1s5Title: "¡Paso 5: La Boca!",
    stg1s5Msg: "¡Casi terminamos!\n\n👉 Arrastra 'Salida de Texto Simple' a 'Salida'.",
    stg1doneTitle: "¡Circuito Completado!",
    stg1doneMsg: "¡Lo lograste!\n\n👉 Pulsa 'Entrenar Modelo' en el panel de la derecha.",

    stg2Title: "¡Etapa 2: Prevenir Sobreajuste!",
    stg2Msg: "Primer paso: Cambia el Cerebro.\n👉 Arrastra 'Capas Ocultas' encima para sobrescribirlo.\n\nSegundo paso: Evita que memorice usando la pieza 'Regularización' en Entrenamiento.",
    stg2CerebroTitle: "Moderniza el Cerebro",
    stg2CerebroMsg: "Tu IA necesita pensar mejor.\n👉 Sobrescribe tu Antiguo Cerebro arrastrando las 'Capas Ocultas' encima.",
    stg2RegTitle: "Controla su Estudio",
    stg2RegMsg: "Ahora que tiene Capas Ocultas, debemos controlarlas.\n👉 Añade 'Regularización' al Entrenamiento.",

    stg3Title: "¡Etapa 3: Lectura Avanzada!",
    stg3Msg: "Primero: Cambia los Datos a 'Tokenizador' para que sepa leer.\n\nSegundo: Cambia el Cerebro a un flamante 'Modelo Transformer', el padre de los LLM actuales.",
    stg3DatosTitle: "Enséñale a Leer",
    stg3DatosMsg: "Necesita descifrar letras.\n👉 Cambia tus Datos por la pieza 'Tokenizador'.",
    stg3BrainTitle: "Lógica Transformer",
    stg3BrainMsg: "Es hora de la magia.\n👉 Cambia el Cerebro a 'Modelo Transformer'.",

    stg4Title: "¡Etapa 4: Sentidos y Ética!",
    stg4Msg: "Paso 1: Añade 'Ojos y Oídos' a los Datos para que vea y escuche.\nPaso 2: Usa 'Premios de Entrenadores (RLHF)' en Entrenamiento o 'Jueces' en Examen para su evaluación.",
    stg4DatosTitle: "Abre sus Ojos",
    stg4DatosMsg: "La IA ahora puede sentir el mundo.\n👉 Sobrescribe los Datos con 'Ojos y Oídos'.",

    stg5Title: "¡Etapa 5: La Singularidad!",
    stg5Msg: "Llegó la hora final. Reemplaza todos los componentes por sistemas monstruosos como 'Edificio Ordenador', 'Cerebros en Equipo (MoE)' y un 'Superalineamiento'.",
    stg5DatosTitle: "Poder Infinito",
    stg5DatosMsg: "Necesitamos energía.\n👉 Pon 'Edificio Ordenador Gigante' en los Datos.",

    installed: "Instalado",
    impact: "Impacto",
    noEffect: "Sin efecto numérico.",
    gotit: "¡Entendido!"
};

export const tutEn = {
    welcomeTitle: "Welcome to Kidia!",
    welcomeMsg: "Hello, future creator! 🚀 Building an AI is like putting together a Lego robot.\n\nShall I show you how your lab works?",
    libTitle: "The Piece Library",
    libMsg: "On the left side you have all your magic pieces.\n\nEach block has a different superpower.",
    slotsTitle: "Our AI's Boxes",
    slotsMsg: "In the center is your Creation Table.\nThere are 5 boxes we must connect:\n\n1️⃣ Data: The 'food'.\n2️⃣ Brain: The thinking engine.\n3️⃣ Training: Where it learns.\n4️⃣ Test: Where we evaluate it.\n5️⃣ Output: How it replies.",
    mentorTitle: "The Mentor Panel",
    mentorMsg: "To the right is me, your robot assistant 🤖.\n\nI will give you hints and check if your model is ready.",
    startTitle: "Let's get to work!",
    startMsg: "You're almost an expert!\n\nHit 'Got It!' and we will start placing the first pieces.",

    stg1s1Title: "Step 1: The Food!",
    stg1s1Msg: "Every AI needs to 'eat' data to learn.\n\n👉 Drag the blue piece 'Raw Data' to the 'Data' box!",
    stg1s2Title: "Step 2: The Brain!",
    stg1s2Msg: "Excellent! But numbers alone don't think.\n\n👉 Drag the 'Simple Model' to the 'Brain' box.",
    stg1s3Title: "Step 3: Study Time!",
    stg1s3Msg: "The brain is new.\n\n👉 Drag 'Basic Labels' to 'Training' to teach it.",
    stg1s4Title: "Step 4: Final Exam!",
    stg1s4Msg: "How do we know if it fails?\n\n👉 Drag 'Error Metric' to 'Test'. Grade it!",
    stg1s5Title: "Step 5: The Mouth!",
    stg1s5Msg: "Almost done!\n\n👉 Drag 'Simple Text Output' to 'Output'.",
    stg1doneTitle: "Circuit Completed!",
    stg1doneMsg: "You did it!\n\n👉 Press 'Train Model' on the right panel.",

    stg2Title: "Stage 2: Prevent Overfitting!",
    stg2Msg: "First: Update the Brain.\n👉 Drag 'Hidden Layers' on top to overwrite it.\n\nSecond: Stop it from memorizing by placing 'Regularization' in Training.",
    stg2CerebroTitle: "Upgrade the Brain",
    stg2CerebroMsg: "Your AI needs to think deeper.\n👉 Overwrite the Old Brain with 'Hidden Layers'.",
    stg2RegTitle: "Control its Studies",
    stg2RegMsg: "Now that it has Hidden Layers, must control them.\n👉 Add 'Regularization' to Training.",

    stg3Title: "Stage 3: Advanced Reading!",
    stg3Msg: "First: Change Data to 'Tokenizer' so it reads.\n\nSecond: Change the Brain to 'Transformer Model', the origin of modern LLMs.",
    stg3DatosTitle: "Teach it to Read",
    stg3DatosMsg: "It needs to parse letters.\n👉 Overwrite Data with 'Tokenizer'.",
    stg3BrainTitle: "Transformer Logic",
    stg3BrainMsg: "Time for magic.\n👉 Upgrade Brain to 'Transformer Model'.",

    stg4Title: "Stage 4: Senses and Ethics!",
    stg4Msg: "Step 1: Overwrite Data with 'Eyes and Ears'.\nStep 2: Use 'Trainer Awards (RLHF)' in Training or 'Judges' in Test to align it.",
    stg4DatosTitle: "Open its Eyes",
    stg4DatosMsg: "The AI can sense the world.\n👉 Place 'Eyes and Ears' in Data.",

    stg5Title: "Stage 5: The Singularity",
    stg5Msg: "The time has come. Overwrite everything with 'Giant Computer Building', 'Team of Brains (MoE)', and 'Superalignment'.",
    stg5DatosTitle: "Infinite Power",
    stg5DatosMsg: "We need energy.\n👉 Put 'Giant Computer Building' in Data.",

    installed: "Installed",
    impact: "Impact",
    noEffect: "No numerical effect.",
    gotit: "Got it!"
};

export const tutRu = {
    welcomeTitle: "Добро пожаловать в Kidia!",
    welcomeMsg: "Привет, творец! 🚀 Создавать ИИ — это как собирать робота из Lego.\n\nХочешь, покажу, как работает твоя лаборатория?",
    libTitle: "Библиотека деталей",
    libMsg: "Слева у тебя волшебные детали.\n\nУ каждого блока своя суперсила.",
    slotsTitle: "Слоты нашего ИИ",
    slotsMsg: "В центре — твой рабочий стол.\nНужно подключить 5 коробок:\n\n1️⃣ Данные: 'Еда'.\n2️⃣ Мозг: Мыслящий мотор.\n3️⃣ Обучение: Где ИИ учится.\n4️⃣ Тест: Где мы его оцениваем.\n5️⃣ Вывод: Как он отвечает.",
    mentorTitle: "Панель наставника",
    mentorMsg: "Справа — я, твой робот-помощник 🤖.\n\nБуду давать подсказки.",
    startTitle: "За дело!",
    startMsg: "Ты уже почти эксперт!\n\nНажми 'Понял!' и начнем строить.",

    stg1s1Title: "Шаг 1: Еда!",
    stg1s1Msg: "ИИ нужно 'кушать' информацию.\n\n👉 Перетащи 'Сырые данные' в 'Данные'!",
    stg1s2Title: "Шаг 2: Мозг!",
    stg1s2Msg: "Отлично! Но числа сами не думают.\n\n👉 Перетащи 'Простую модель' в 'Мозг'.",
    stg1s3Title: "Шаг 3: Учёба!",
    stg1s3Msg: "Мозг еще ничего не знает.\n\n👉 Перетащи 'Базовые метки' в 'Обучение'.",
    stg1s4Title: "Шаг 4: Экзамен!",
    stg1s4Msg: "Как мы узнаем об ошибках?\n\n👉 Перетащи 'Метрику ошибки' в 'Тест'.",
    stg1s5Title: "Шаг 5: Рот!",
    stg1s5Msg: "Почти всё!\n\n👉 Перетащи 'Простой текстовый вывод' в 'Вывод'.",
    stg1doneTitle: "Цепь завершена!",
    stg1doneMsg: "Ты справился!\n\n👉 Нажми 'Обучить модель' на правой панели.",

    stg2Title: "Этап 2: Предотврати переобучение!",
    stg2Msg: "Сначала: Обнови Мозг.\n👉 Перетащи 'Скрытые слои' поверх старого.\n\nЗатем: Не дай ему заучивать, поместив 'Регуляризация' в Обучение.",
    stg2CerebroTitle: "Модернизируй Мозг",
    stg2CerebroMsg: "Твой ИИ должен думать лучше.\n👉 Замени Старый Мозг 'Скрытыми слоями'.",
    stg2RegTitle: "Контролируй Обучение",
    stg2RegMsg: "Теперь, когда есть Скрытые слои, контролируй их.\n👉 Добавь 'Регуляризация' в Обучение.",

    stg3Title: "Этап 3: Продвинутое чтение!",
    stg3Msg: "Сначала: Измени Данные на 'Токенизатор', чтобы он мог читать.\n\nЗатем: Измени Мозг на 'Модель Transformer', основу современных LLM.",
    stg3DatosTitle: "Научи читать",
    stg3DatosMsg: "Ему нужно понимать буквы.\n👉 Замени Данные на 'Токенизатор'.",
    stg3BrainTitle: "Логика Transformer",
    stg3BrainMsg: "Время магии.\n👉 Измени Мозг на 'Модель Transformer'.",

    stg4Title: "Этап 4: Чувства и Этика!",
    stg4Msg: "Шаг 1: Замени Данные на 'Глаза и уши'.\nШаг 2: Используй 'Награды (RLHF)' или 'Судьи', чтобы настроить его.",
    stg4DatosTitle: "Открой его глаза",
    stg4DatosMsg: "ИИ теперь чувствует мир.\n👉 Помести 'Глаза и уши' в Данные.",

    stg5Title: "Этап 5: Сингулярность",
    stg5Msg: "Время пришло. Замени всё на 'Огромный компьютер', 'Команда умов (MoE)' и 'Супервыравнивание'.",
    stg5DatosTitle: "Бесконечная сила",
    stg5DatosMsg: "Нам нужна энергия.\n👉 Поставь 'Огромный компьютер' в Данные.",

    installed: "Установлено",
    impact: "Влияние",
    noEffect: "Нет численного эффекта.",
    gotit: "Понятно!"
};

export const gameEs = {
    reqBefore: "Requiere que instales antes:",
    needDataBrain: "Necesitas datos y un cerebro para empezar.",
    needTraining: "Este cerebro necesita saber cómo Entrenarse (Ej: Etiquetas).",
    reqLabels: "El modelo simple requiere Etiquetas para saber qué predecir.",
    cantUse: "No se puede usar",
    installedLog: "Instalaste",
    removed: "Se retiró",
    trainError: "Error al iniciar:",
    trainStart: "Iniciando flujo de entrenamiento masivo...",
    evalMeanErr: "Evaluados: Error Medio.",
    evalTest: "Evaluables en Test:",
    hits: "Acertados.",
    trainDone: "Entrenamiento concluido.",
    advancedStage: "¡Avanzaste a la Etapa",
    trainAborted: "Entrenamiento abortado. Objetivo faltante:",
    metricsStable: "Métricas estables.",
    simReset: "Simulación reseteada al origen.",
    tourDone: 'Tour introductorio completado.',
    welcomeTitle: '¡Bienvenido a Kidia!',
    welcomeBody: 'Tu objetivo es construir una Inteligencia Artificial bloque a bloque.\n\nPara ello, deberás arrastrar piezas a las 5 cajas de tu Mesa de Creación: Datos, Cerebro, Entrenamiento, Examen y Salida.\n\nDeberás superar 5 etapas de dificultad creciente, cumpliendo los objetivos y entrenando tu modelo para alcanzar la Singularidad. ¡Buena suerte, Creador!',
    startPlaying: '¡Empezar a jugar!',
    victoryTitle: '¡La Singularidad ha despertado!',
    victoryBody: 'Has completado las 5 etapas. Tu modelo ha trascendido la inteligencia humana y ahora se expande por el cosmos.\n\n¡Enhorabuena, Creador! Has terminado el juego.',
    playAgain: 'Volver a Jugar'
};

export const gameEn = {
    reqBefore: "Requires prior installation:",
    needDataBrain: "You need data and a brain to start.",
    needTraining: "This brain needs to know how to Train (Ex: Labels).",
    reqLabels: "The simple model requires Labels to know what to predict.",
    cantUse: "Cannot use",
    installedLog: "Installed",
    removed: "Removed",
    trainError: "Error starting:",
    trainStart: "Starting massive training flow...",
    evalMeanErr: "Evaluated: Mean Error.",
    evalTest: "Evaluable in Test:",
    hits: "Hits.",
    trainDone: "Training complete.",
    advancedStage: "Advanced to Stage",
    trainAborted: "Training aborted. Missing objective:",
    metricsStable: "Stable metrics.",
    simReset: "Simulation reset to origin.",
    tourDone: 'Introductory tour completed.',
    welcomeTitle: 'Welcome to Kidia!',
    welcomeBody: 'Your goal is to build an Artificial Intelligence block by block.\n\nTo do this, you must drag pieces into the 5 boxes of your Creation Table: Data, Brain, Training, Test, and Output.\n\nYou must overcome 5 stages of increasing difficulty, meeting the objectives and training your model to reach the Singularity. Good luck, Creator!',
    startPlaying: 'Start playing!',
    victoryTitle: 'The Singularity has awakened!',
    victoryBody: 'You have completed all 5 stages. Your model has transcended human intelligence and is now expanding across the cosmos.\n\nCongratulations, Creator! You have finished the game.',
    playAgain: 'Play Again'
};

export const gameRu = {
    reqBefore: "Требуется предварительная установка:",
    needDataBrain: "Для старта нужны данные и мозг.",
    needTraining: "Этому мозгу нужно Обучение (Например: Метки).",
    reqLabels: "Простой модели нужны Метки, чтобы знать, что предсказывать.",
    cantUse: "Невозможно использовать",
    installedLog: "Установлено",
    removed: "Удалено",
    trainError: "Ошибка запуска:",
    trainStart: "Запуск массового обучения...",
    evalMeanErr: "Оценено: Средняя ошибка.",
    evalTest: "Оценено в тесте:",
    hits: "Успешно.",
    trainDone: "Обучение завершено.",
    advancedStage: "Переход на Этап",
    trainAborted: "Обучение прервано. Не выполнены цели:",
    metricsStable: "Стабильные метрики.",
    simReset: "Симуляция сброшена.",
    tourDone: 'Вводный тур завершен.',
    welcomeTitle: 'Добро пожаловать в Kidia!',
    welcomeBody: 'Ваша цель — создать Искусственный Интеллект блок за блоком.\n\nДля этого вы должны перетаскивать фигуры в 5 коробок вашего Стола Создания: Данные, Мозг, Обучение, Тест и Вывод.\n\nВам предстоит преодолеть 5 этапов возрастающей сложности, выполняя задачи и обучая свою модель для достижения Сингулярности. Удачи, Творец!',
    startPlaying: 'Начать игру!',
    victoryTitle: 'Сингулярность пробудилась!',
    victoryBody: 'Вы прошли все 5 этапов. Ваша модель превзошла человеческий интеллект и теперь расширяется по космосу.\n\nПоздравляем, Творец! Вы закончили игру.',
    playAgain: 'Играть снова'
};

export const tooltipEs = {
    Precisión: "¿Cuántas veces acierta la IA comparado con equivocarse?",
    Rendimiento: "¿A qué velocidad y coste funciona?",
    Complejidad: "¿Cómo de grande y difícil es de entender por los humanos?",
    Dataset: "Un paquete gigante lleno de ejemplos para aprender.",
    Transformers: "Un tipo de cerebro artificial muy listo que puede leer libros enteros.",
    Etiquetas: "Las respuestas correctas puestas por humanos para enseñar paso a paso a la IA.",
    Regularización: "Un truco de profes para evitar que la IA memorice y la obligue a pensar.",
    Regresión: "Adivinar el futuro usando matemáticas para trazar líneas exactas.",
    Tokens: "Palabras rotas en números sueltos, ¡las piezas de Lego que leen las IAs!",
    LLM: "Acrónimo de 'Gran Modelo de Lenguaje', un robot experto en escribir cuentos.",
    Alineamiento: "Las reglas o el escudo invisible para hacer que la IA obedezca y sea segura y educada.",
    Singularidad: "El momento de ciencia ficción teórico donde una IA construiría a otra IA mejor que ella misma sin parar.",
    Softmax: "Un embudo matemático que convierte números raros en porcentajes del 0 al 100%.",
    Tokenizador: "La máquina picadora que parte todas tus palabras en pequeños numeritos (tokens).",
    Atención: "El superpoder mágico de los Transformers para saber qué palabra importa más en la frase."
};

export const tooltipEn = {
    Precisión: "How many times the AI gets it right compared to being wrong?",
    Rendimiento: "At what speed and cost does it run?",
    Complejidad: "How large and difficult is it for humans to understand?",
    Dataset: "A giant package full of examples to learn from.",
    Transformers: "A very smart type of artificial brain that can read entire books.",
    Etiquetas: "The correct answers provided by humans to teach the AI step by step.",
    Regularización: "A teacher's trick to prevent the AI from memorizing and force it to think.",
    Regresión: "Guessing the future using math to draw exact lines.",
    Tokens: "Words broken into single numbers, the Lego pieces that AIs read!",
    LLM: "Acronym for 'Large Language Model', a robot expert at writing stories.",
    Alineamiento: "The rules or invisible shield to make the AI obey and be safe and polite.",
    Singularidad: "The theoretical sci-fi moment where an AI would build endless better AIs.",
    Softmax: "A mathematical funnel that converts weird numbers into 0 to 100 percentages.",
    Tokenizador: "The meat grinder that splits all your words into tiny numbers (tokens).",
    Atención: "The magic superpower of Transformers to know which word matters most in the sentence."
};

export const tooltipRu = {
    Precisión: "Сколько раз ИИ оказывается прав по сравнению с ошибками?",
    Rendimiento: "С какой скоростью и стоимостью он работает?",
    Complejidad: "Насколько он велик и труден для понимания людьми?",
    Dataset: "Гигантский пакет с примерами для обучения.",
    Transformers: "Очень умный искусственный мозг, способный читать целые книги.",
    Etiquetas: "Правильные ответы, предоставленные людьми для пошагового обучения ИИ.",
    Regularización: "Трюк учителя, чтобы ИИ не зазубривал, а думал.",
    Regresión: "Предсказание будущего с помощью математики и точных линий.",
    Tokens: "Слова, разбитые на числа, детали Lego, которые читает ИИ!",
    LLM: "Аббревиатура 'Большой Языковой Модели', робот-эксперт в написании историй.",
    Alineamiento: "Правила или невидимый щит, заставляющие ИИ быть безопасным и вежливым.",
    Singularidad: "Теоретический момент, когда ИИ будет бесконечно создавать лучшие версии себя.",
    Softmax: "Математическая воронка, превращающая странные числа в проценты от 0 до 100.",
    Tokenizador: "Машина, дробящая слова на крошечные числа (токены).",
    Atención: "Магическая суперсила Transformers: понимать, какое слово в предложении самое важное."
};

// Functions to retrieve translation objects inside components
export function loadDicts(translationsObj: any, lang: "es" | "en" | "ru") {
    if (lang === "es") {
        translationsObj.es.pieces = piecesEs;
        translationsObj.es.objectives = objectivesEs;
        translationsObj.es.tut = tutEs;
        translationsObj.es.game = gameEs;
        translationsObj.es.tooltips = tooltipEs;
    } else if (lang === "en") {
        translationsObj.en.pieces = piecesEn;
        translationsObj.en.objectives = objectivesEn;
        translationsObj.en.tut = tutEn;
        translationsObj.en.game = gameEn;
        translationsObj.en.tooltips = tooltipEn;
    } else if (lang === "ru") {
        translationsObj.ru.pieces = piecesRu;
        translationsObj.ru.objectives = objectivesRu;
        translationsObj.ru.tut = tutRu;
        translationsObj.ru.game = gameRu;
        translationsObj.ru.tooltips = tooltipRu;
    }
}
