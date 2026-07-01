import type { ScenarioSchema, Tramo } from '../schemas/scenario';

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
    const filtered = Object.values(scenarioCache).filter(s => s.language === lang);

    // Sort by Number in Title (e.g. "1. Intro" -> 1)
    return filtered.sort((a, b) => {
        const numA = parseInt(a.title.split('.')[0]) || 999;
        const numB = parseInt(b.title.split('.')[0]) || 999;
        return numA - numB;
    });
}

export async function getScenarioById(id: string, lang: 'es' | 'en' = 'es'): Promise<ScenarioSchema | undefined> {
    const scenarios = await loadScenarios(lang);
    return scenarios.find(s => s.id === id);
}

// Orden de los tramos, para elegir el más cercano si falta la variante exacta
// de una unidad (p. ej. si algún día una unidad solo existe en un tramo).
const TRAMO_ORDER: Tramo[] = ['8-9', '10-11', '12-14'];

/**
 * Cada reto real tiene una variante por tramo de edad (mismo `unidad`,
 * distinto `tramo`). Esta función agrupa por `unidad` y devuelve, para
 * cada una, la variante del tramo pedido (con fallback al tramo más
 * cercano si esa unidad no tuviera versión para ese tramo exacto).
 */
export async function loadScenariosForTramo(tramo: Tramo, lang: 'es' | 'en' = 'es'): Promise<ScenarioSchema[]> {
    const scenarios = await loadScenarios(lang);

    const byUnidad = new Map<string, ScenarioSchema[]>();
    for (const s of scenarios) {
        if (!s.unidad) continue; // escenarios sin tramo (legacy) no entran en este flujo
        const list = byUnidad.get(s.unidad) || [];
        list.push(s);
        byUnidad.set(s.unidad, list);
    }

    const targetIdx = TRAMO_ORDER.indexOf(tramo);

    const result: ScenarioSchema[] = [];
    for (const [, variants] of byUnidad) {
        const exact = variants.find(v => v.tramo === tramo);
        if (exact) {
            result.push(exact);
            continue;
        }
        // Fallback: el tramo disponible más cercano al pedido
        const closest = [...variants].sort((a, b) => {
            const da = Math.abs(TRAMO_ORDER.indexOf(a.tramo!) - targetIdx);
            const db = Math.abs(TRAMO_ORDER.indexOf(b.tramo!) - targetIdx);
            return da - db;
        })[0];
        if (closest) result.push(closest);
    }

    return result.sort((a, b) => (parseFloat(a.unidad || '0') - parseFloat(b.unidad || '0')));
}
