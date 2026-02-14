import { userProgress, saveProgress, completeScenario as storageComplete, addBadge as storageAddBadge } from './storage';
import { PARENT_REPORT_RULES } from './parent-rules';

// Type definitions
export type KidiaState = ReturnType<typeof userProgress.get>;

export const ProgressService = {
    // 1. Get State
    getState: (): KidiaState => {
        return userProgress.get();
    },

    // 2. Complete Scenario & Scoring
    finishScenario: (scenarioId: string, score: number = 100) => {
        // Mark as complete in underlying storage (triggers cloud sync)
        storageComplete(scenarioId);

        // Save score
        const current = userProgress.get();
        const newScores = { ...current.scores, [scenarioId]: score };
        userProgress.setKey('scores', newScores);
    },

    awardBadge: (badgeId: string) => {
        storageAddBadge(badgeId);
    },

    // 3. Unlock Logic
    isUnlocked: (scenario: { required_badge_id?: string }, userBadges: string[]) => {
        if (!scenario.required_badge_id) return true;
        return userBadges.includes(scenario.required_badge_id);
    },

    // 4. Global Percentage
    getGlobalProgress: (totalScenariosCount: number) => {
        const completed = userProgress.get().completedScenarios.length;
        if (totalScenariosCount === 0) return 0;
        return Math.round((completed / totalScenariosCount) * 100);
    },

    // 5. Parent Report
    computeParentReport: () => {
        const state = userProgress.get();
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
