import { supabase } from './supabase';

const isBrowser = typeof window !== 'undefined';
const KEY = 'kidia-progress';

export interface UserProgress {
    completedScenarios: string[];
    badges: string[];
    currentScenario: string | null;
    scenarioProgress: Record<string, string>; // scenarioId -> nodeId
    scores: Record<string, number>; // scenarioId -> 0-100
}

const defaultState: UserProgress = {
    completedScenarios: [],
    badges: [],
    currentScenario: null,
    scenarioProgress: {},
    scores: {},
};

// Simple Facade for LocalStorage
// No nanostores, just direct access to avoid hydration mismatches
export const storage = {
    get(): UserProgress {
        if (!isBrowser) return defaultState;
        try {
            const raw = localStorage.getItem(KEY);
            return raw ? JSON.parse(raw) : defaultState;
        } catch (e) {
            console.error('Storage Read Error', e);
            return defaultState;
        }
    },

    set(state: UserProgress) {
        if (!isBrowser) return;
        try {
            localStorage.setItem(KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Storage Write Error', e);
        }
    },

    update(updater: (state: UserProgress) => UserProgress) {
        const current = this.get();
        const next = updater(current);
        this.set(next);
        return next;
    },

    // Helpers
    hasBadge(id: string): boolean {
        return this.get().badges.includes(id);
    },

    isScenarioCompleted(id: string): boolean {
        return this.get().completedScenarios.includes(id);
    }
};

// Async Sync Logic
export async function syncWithCloud() {
    if (!isBrowser) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const local = storage.get();

    // 1. Fetch
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

    // 2. Merge & Save Local
    const merged: UserProgress = {
        ...local,
        completedScenarios: Array.from(completed),
        badges: Array.from(badges)
    };
    storage.set(merged);

    // 3. Push Upserts (Simplified)
    // In a real app, we would only push changes. 
    // For now, we rely on duplicate checks or upsert policies.
}
