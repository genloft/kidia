export const PARENT_REPORT_RULES = [
    {
        condition: (p) => p.completedScenarios.includes('intro-ia'),
        text: "Ha mostrado interés en los conceptos básicos de la tecnología. Entiende que la IA aprende de ejemplos (patrones)."
    },
    {
        condition: (p) => p.scores['intro-ia'] >= 80,
        text: "¡Tiene una intuición excelente! Ha respondido correctamente a las preguntas sobre aprendizaje automático."
    },
    {
        condition: (p) => p.badges.includes('badge-guardian'),
        text: "Se preocupa por el uso ético de la tecnología. Es un rasgo muy maduro."
    },
    {
        condition: (p) => p.completedScenarios.length >= 3,
        text: "Es constante en su aprendizaje. Ha completado múltiples módulos."
    }
];
