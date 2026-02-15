import { storage, syncWithCloud } from './storage-simple';
import { PARENT_REPORT_RULES } from './parent-rules';

// Type definitions
export type KidiaState = ReturnType<typeof storage.get>;

export const ProgressService = {
    // 1. Get State
    getState: (): KidiaState => {
        return storage.get();
    },

    // 2. Complete Scenario & Scoring
    finishScenario: async (scenarioId: string, score: number = 100) => {
        storage.update(state => ({
            ...state,
            completedScenarios: Array.from(new Set([...state.completedScenarios, scenarioId])),
            scores: { ...state.scores, [scenarioId]: score }
        }));

        // Trigger Cloud Sync
        syncWithCloud();

        // Check if we should show registration reminder
        try {
            const { ReminderService } = await import('./reminder-service');
            ReminderService.onScenarioCompleted();

            const shouldShow = await ReminderService.shouldShowReminder();
            if (shouldShow) {
                // Delay to avoid interrupting the quiz completion flow
                setTimeout(() => {
                    ReminderService.showReminderModal();
                }, 1500);
            }
        } catch (e) {
            console.warn('[ProgressService] Reminder service unavailable:', e);
        }
    },

    awardBadge: (badgeId: string) => {
        storage.update(state => ({
            ...state,
            badges: Array.from(new Set([...state.badges, badgeId]))
        }));
    },

    // 3. Unlock Logic
    isUnlocked: (scenario: { required_badge_id?: string }, userBadges: string[]) => {
        if (!scenario.required_badge_id) return true;
        return userBadges.includes(scenario.required_badge_id);
    },

    // 4. Global Percentage
    getGlobalProgress: (totalScenariosCount: number) => {
        const completed = storage.get().completedScenarios.length;
        if (totalScenariosCount === 0) return 0;
        const percentage = Math.round((completed / totalScenariosCount) * 100);
        return Math.min(percentage, 100); // Cap at 100%
    },

    // 5. Parent Report
    computeParentReport: () => {
        const state = storage.get();
        const comments: string[] = [];

        PARENT_REPORT_RULES.forEach(rule => {
            if (rule.condition(state)) {
                comments.push(rule.text);
            }
        });

        if (comments.length === 0) {
            return "Aún está comenzando su aventura. Pronto verás aquí sus progresos.";
        }

        return comments.join(' ');
    }
};
