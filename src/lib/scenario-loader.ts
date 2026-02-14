import type { ScenarioSchema } from '../schemas/scenario';

// This map will hold all loaded scenarios
// Key: "es/intro-ia"
let scenarioCache: Record<string, ScenarioSchema> | null = null;

export async function loadScenarios(lang: 'es' | 'en' = 'es'): Promise<ScenarioSchema[]> {
    if (!scenarioCache) {
        scenarioCache = {};
        // Glob import all JSONs in content
        // Note: In Vite/Astro, import.meta.glob returns a map of functions that return promises
        const modules = import.meta.glob('/src/content/**/*.json');

        for (const path in modules) {
            const mod = await modules[path]() as any;
            // path looks like: /src/content/es/intro-ia.json
            // we want a simpler key or just store them
            // Let's assume default export is the JSON object (since it's .json)
            const data = mod.default || mod;

            // Extract lang from path if possible, or trust content
            // /src/content/es/file.json -> lang = es
            const manualBadKey = path.replace('/src/content/', '').replace('.json', '');
            scenarioCache[manualBadKey] = data as ScenarioSchema;
        }
    }

    // Filter by lang
    return Object.values(scenarioCache).filter(s => s.language === lang);
}

export async function getScenarioById(id: string, lang: 'es' | 'en' = 'es'): Promise<ScenarioSchema | undefined> {
    const scenarios = await loadScenarios(lang);
    return scenarios.find(s => s.id === id);
}
