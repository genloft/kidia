import { writable, derived } from "svelte/store";
import { loadDicts } from "./i18nDicts";

export type Language = "es" | "en" | "ru";

const translations: Record<Language, Record<string, any>> = {
    es: {
        stage: "Etapa",
        accuracy: "Precisión",
        speed: "Velocidad",
        difficulty: "Dificultad",
        trainModel: "⚡ Entrenar Modelo",
        reset: "Reset",
        pipelineEmpty: "Vacío. Arrastra o haz click con pieza seleccionada.",
        allPieces: "Todas",
        mentorInfo: "Información sobre la Singularidad",
        singularity: "SINGULARIDAD",
        unmetObjective: "Falta algo",
        readyToTrain: "🌟 ¡Todo configurado! Dale a 'Entrenar Modelo' para ver si funciona.",
        logReset: "Simulación reseteada al origen.",
        mentorTitle: "Kidia Mentor",
        recentEvents: "Últimos Eventos",
        objectivesTitle: "Objetivos Etapa",
        // Slots
        slotDatos: "Datos",
        slotCerebro: "Cerebro",
        slotEntrenamiento: "Entrenamiento",
        slotExamen: "Examen",
        slotSalida: "Salida",
        // TopBar
        language: "Idioma",
        login: "Iniciar Sesión (Próximamente)",
        // Modals
        cancel: "Cancelar",
        yesReset: "Sí, Reiniciar",
        resetTitle: "¿Reiniciar Simulación?",
        resetBody1: "Se borrará todo el progreso, revertirás a la Etapa 1 y se limpiarán los componentes instalados.",
        resetWarning: "Esta acción no se puede deshacer.",
        closeWindow: "Cerrar ventana",
        singularityTitle: "¿La Singularidad Tecnológica?",
        singq1: "¿Qué es?",
        singa1: "Es un punto hipotético en el futuro donde la Inteligencia Artificial superaría a la humana, siendo capaz de optimizar su propio código y mejorarse a sí misma de forma recursiva en un evento conocido como 'Explosión de Inteligencia'.",
        singq2: "¿Por qué algunos creen que es posible?",
        singa2: "Los avances exponenciales en capacidad de cómputo y el nacimiento de las arquitecturas Transformer han permitido que las redes neuronales resuelvan problemas complejos simplemente analizando patrones, sin necesidad de ser programadas paso a paso para cada regla.",
        singq3: "¿Por qué NO es un hecho hoy en día?",
        singr1Title: "Frontera de Datos:",
        singr1Body: "Los modelos como los GPT actuales están agotando todo el texto original humano disponible en internet para entrenarse.",
        singr2Title: "Límite Energético:",
        singr2Body: "Escalar IAs masivas requiere granjas de servidores que consumen suficiente electricidad como para alimentar ciudades pequeñas.",
        singr3Title: "Alineamiento y Control:",
        singr3Body: "Las IAs siguen fallando, inventando datos ('alucinaciones') y requieren filtros estrictos (Guardrails) o validación humana intensiva (RLHF) para no desviarse de las instrucciones originales.",
        singAxiom: "\"Potencia no implica consciencia\""
    },
    en: {
        stage: "Stage",
        accuracy: "Accuracy",
        speed: "Speed",
        difficulty: "Difficulty",
        trainModel: "⚡ Train Model",
        reset: "Reset",
        pipelineEmpty: "Empty. Drag or click with a selected piece.",
        allPieces: "All",
        mentorInfo: "Information about Singularity",
        singularity: "SINGULARITY",
        unmetObjective: "Something is missing",
        readyToTrain: "🌟 All set! Hit 'Train Model' to see if it works.",
        logReset: "Simulation reset to origin.",
        mentorTitle: "Kidia Mentor",
        recentEvents: "Recent Events",
        objectivesTitle: "Stage Objectives",
        // Slots
        slotDatos: "Data",
        slotCerebro: "Brain",
        slotEntrenamiento: "Training",
        slotExamen: "Test",
        slotSalida: "Output",
        // TopBar
        language: "Language",
        login: "Login (Coming Soon)",
        // Modals
        cancel: "Cancel",
        yesReset: "Yes, Reset",
        resetTitle: "Reset Simulation?",
        resetBody1: "All progress will be erased, you will revert to Stage 1, and installed components will be cleared.",
        resetWarning: "This action cannot be undone.",
        closeWindow: "Close window",
        singularityTitle: "The Technological Singularity?",
        singq1: "What is it?",
        singa1: "A hypothetical future point where Artificial Intelligence surpasses human intelligence, capable of optimizing its own code and recursively improving itself in an 'Intelligence Explosion'.",
        singq2: "Why do some believe it is possible?",
        singa2: "Exponential advances in computing power and Transformer architectures have allowed neural networks to solve complex problems simply by analyzing patterns, without step-by-step programming.",
        singq3: "Why is it NOT a reality today?",
        singr1Title: "Data Frontier:",
        singr1Body: "Current models like GPTs are exhausting all available original human text on the internet for training.",
        singr2Title: "Energy Limit:",
        singr2Body: "Scaling massive AIs requires server farms that consume enough electricity to power small cities.",
        singr3Title: "Alignment and Control:",
        singr3Body: "AIs still fail, invent facts ('hallucinations'), and require strict filters (Guardrails) or intensive human validation (RLHF) to stay on track.",
        singAxiom: "\"Power does not imply consciousness\""
    },
    ru: {
        stage: "Этап",
        accuracy: "Точность",
        speed: "Скорость",
        difficulty: "Сложность",
        trainModel: "⚡ Обучить модель",
        reset: "Сброс",
        pipelineEmpty: "Пусто. Перетащите или нажмите с выбранной деталью.",
        allPieces: "Все",
        mentorInfo: "Информация о Сингулярности",
        singularity: "СИНГУЛЯРНОСТЬ",
        unmetObjective: "Чего-то не хватает",
        readyToTrain: "🌟 Всё готово! Нажмите 'Обучить модель', чтобы проверить.",
        logReset: "Симуляция сброшена.",
        mentorTitle: "Наставник Kidia",
        recentEvents: "Последние события",
        objectivesTitle: "Цели этапа",
        // Slots
        slotDatos: "Данные",
        slotCerebro: "Мозг",
        slotEntrenamiento: "Обучение",
        slotExamen: "Тест",
        slotSalida: "Вывод",
        // TopBar
        language: "Язык",
        login: "Войти (Скоро)",
        // Modals
        cancel: "Отмена",
        yesReset: "Да, Сбросить",
        resetTitle: "Сбросить симуляцию?",
        resetBody1: "Весь прогресс будет удален, вы вернетесь к Этапу 1, а установленные компоненты будут очищены.",
        resetWarning: "Это действие нельзя отменить.",
        closeWindow: "Закрыть окно",
        singularityTitle: "Технологическая сингулярность?",
        singq1: "Что это?",
        singa1: "Гипотетический момент в будущем, когда ИИ превзойдет человеческий, сможет оптимизировать свой код и рекурсивно улучшать себя в результате 'Взрыва интеллекта'.",
        singq2: "Почему некоторые верят в это?",
        singa2: "Экспоненциальный рост вычислительных мощностей и архитектуры Transformer позволили нейросетям решать сложные задачи анализом паттернов без прямого программирования.",
        singq3: "Почему это НЕ реальность сегодня?",
        singr1Title: "Граница данных:",
        singr1Body: "Современные модели (GPT) исчерпывают весь доступный человеческий текст в интернете для обучения.",
        singr2Title: "Энергетический предел:",
        singr2Body: "Масштабирование ИИ требует серверов, потребляющих электричества как небольшие города.",
        singr3Title: "Выравнивание и контроль:",
        singr3Body: "ИИ все еще ошибаются, выдумывают факты ('галлюцинации') и требуют строгих фильтров или проверки людьми.",
        singAxiom: "\"Мощь не означает сознание\""
    }
};

loadDicts(translations, "es");
loadDicts(translations, "en");
loadDicts(translations, "ru");

export const currentLanguage = writable<Language>("es");

export const t = derived(
    currentLanguage,
    ($lang) => translations[$lang]
);
