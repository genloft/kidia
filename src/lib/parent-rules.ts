import type { FamilyMissionEntry } from './unidad-service';

function unidadesCompletadas(completed: string[]): Set<string> {
    const set = new Set<string>();
    completed.forEach(id => {
        const m = id.match(/^u1-(\d)-/);
        if (m) set.add(m[1]);
    });
    return set;
}

// Reglas nuevas: leen las señales del módulo unidad-aventura (tramo 8-9),
// que viven en children.family_missions_completed / children.vocabulary
// (ver supabase/migrations/003_unidad_aventura.sql), no en el progreso
// local de storage-simple.ts — por eso se pasan como campos extra
// opcionales en vez de venir del state de siempre.
export interface ParentReportExtra {
    familyMissionsCompleted?: FamilyMissionEntry[];
    vocabularyCount?: number;
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
    },
    {
        condition: (p: any) => (p.familyMissionsCompleted?.length || 0) >= 1,
        text: (p: any) => `Ha completado la Misión en familia "${p.familyMissionsCompleted[0].mision_id}" contigo. Puedes verla en su Cuaderno de Inventor/a.`
    },
    {
        condition: (p: any) => (p.familyMissionsCompleted?.length || 0) >= 4,
        text: "Ha hecho las 4 misiones en familia de la Zona Descubre — ¡gracias por co-jugar con él/ella!"
    },
    {
        condition: (p: any) => (p.vocabularyCount || 0) >= 5,
        text: (p: any) => `Ya ha coleccionado ${p.vocabularyCount} palabras en su Muro de Palabras.`
    }
];
