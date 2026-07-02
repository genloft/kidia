function unidadesCompletadas(completed: string[]): Set<string> {
    const set = new Set<string>();
    completed.forEach(id => {
        const m = id.match(/^u1-(\d)-/);
        if (m) set.add(m[1]);
    });
    return set;
}

export const PARENT_REPORT_RULES = [
    {
        condition: (p) => unidadesCompletadas(p.completedScenarios).has('1'),
        text: "Ha dado su primer paso: ya distingue qué es y qué no es una IA."
    },
    {
        condition: (p) => unidadesCompletadas(p.completedScenarios).has('2'),
        text: "Está aprendiendo a detectar errores y sesgos en las respuestas de la IA."
    },
    {
        condition: (p) => unidadesCompletadas(p.completedScenarios).has('3'),
        text: "Está mejorando la calidad de las preguntas (prompts) que le hace a la IA."
    },
    {
        condition: (p) => unidadesCompletadas(p.completedScenarios).has('4'),
        text: "Ha practicado verificar datos antes de creérselos, aunque «suenen» ciertos."
    },
    {
        condition: (p) => unidadesCompletadas(p.completedScenarios).size >= 4,
        text: "¡Ha completado el Nivel 1 entero (Entender) en su tramo de edad!"
    },
    {
        condition: (p) => p.badges.length >= 1,
        text: "Ya ha conseguido su primera insignia."
    }
];
