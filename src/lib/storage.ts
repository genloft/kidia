import { persistentMap } from '@nanostores/persistent';
import { supabase } from './supabase';

export interface UserProgress {
    completedScenarios: string[];
    badges: string[];
    currentScenario: string | null;
    scenarioProgress: Record<string, string>; // scenarioId -> nodeId
    scores: Record<string, number>; // scenarioId -> 0-100
}

export const userProgress = persistentMap<UserProgress>('kidia-progress', {
    completedScenarios: [],
    badges: [],
    currentScenario: null,
    scenarioProgress: {},
    scores: {},
}, {
    encode: JSON.stringify,
    decode: JSON.parse,
});

export async function syncWithCloud() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const local = userProgress.get();

    // 1. Fetch cloud data
    const { data: cloudData } = await supabase
        .from('user_progress')
        .select('scenario_id, completed, badge_id')
        .eq('user_id', session.user.id);

    const completed = new Set(local.completedScenarios);
    const badges = new Set(local.badges);

    if (cloudData) {
        cloudData.forEach(row => {
            if (row.completed) completed.add(row.scenario_id);
            if (row.badge_id) badges.add(row.badge_id);
        });
    }

    // 2. Update local with merged data
    userProgress.setKey('completedScenarios', Array.from(completed));
    userProgress.setKey('badges', Array.from(badges));

    // 3. Push to cloud (Upsert all completed local items)
    const updates: { user_id: string, scenario_id: string, completed: boolean }[] = [];
    completed.forEach(id => {
        updates.push({
            user_id: session.user.id,
            scenario_id: id,
            completed: true
        });
    });

    if (updates.length > 0) {
        await supabase.from('user_progress').upsert(updates);
    }
}

export async function completeScenario(scenarioId: string) {
    const current = userProgress.get();
    if (!current.completedScenarios.includes(scenarioId)) {
        userProgress.setKey('completedScenarios', [...current.completedScenarios, scenarioId]);

        // Sync if logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await supabase.from('user_progress').upsert({
                user_id: session.user.id,
                scenario_id: scenarioId,
                completed: true
            });
        }
    }
}

export async function addBadge(badgeId: string) {
    const current = userProgress.get();
    if (!current.badges.includes(badgeId)) {
        userProgress.setKey('badges', [...current.badges, badgeId]);
    }
}

export function saveProgress(scenarioId: string, nodeId: string) {
    const current = userProgress.get();
    const newProgress = { ...current.scenarioProgress, [scenarioId]: nodeId };
    userProgress.setKey('scenarioProgress', newProgress);
}
