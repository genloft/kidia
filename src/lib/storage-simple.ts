

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
            if (!raw) return defaultState;

            const parsed = JSON.parse(raw);
            return {
                ...defaultState,
                ...parsed,
                // Ensure arrays are actual arrays to prevent .includes() crashes
                badges: Array.isArray(parsed.badges) ? parsed.badges : [],
                completedScenarios: Array.isArray(parsed.completedScenarios) ? parsed.completedScenarios : [],
                scores: parsed.scores || {}
            };
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
    try {
        const { SyncService } = await import('./sync-service');
        await SyncService.syncLocalToCloud();
    } catch (e) {
        console.warn('[Storage] Cloud sync skipped:', e);
    }
}
