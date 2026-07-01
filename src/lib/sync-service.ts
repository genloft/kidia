import { supabase } from './supabase';
import { storage, type UserProgress } from './storage-simple';
import { activeChild } from './active-child';

/**
 * Sync Service - Handles synchronization between localStorage and Supabase.
 * El progreso se guarda por hijo (tabla `children`), no por cuenta:
 * cada operación necesita saber cuál es el hijo activo de la sesión.
 */

export const SyncService = {
    /**
     * Upload local progress to Supabase
     */
    async syncLocalToCloud(): Promise<{ success: boolean; error?: string }> {
        try {
            const childId = activeChild.get();
            if (!childId) {
                return { success: false, error: 'No hay un hijo/a activo en la sesión' };
            }

            const localProgress = storage.get();

            const { error } = await supabase
                .from('children')
                .update({
                    completed_scenarios: localProgress.completedScenarios,
                    badges: localProgress.badges,
                    scores: localProgress.scores,
                    scenario_progress: localProgress.scenarioProgress,
                    updated_at: new Date().toISOString()
                })
                .eq('id', childId);

            if (error) {
                console.error('[SyncService] Upload error:', error);
                return { success: false, error: error.message };
            }

            console.log('[SyncService] ✅ Local progress synced to cloud');
            return { success: true };
        } catch (e) {
            console.error('[SyncService] Sync error:', e);
            return { success: false, error: e.message };
        }
    },

    /**
     * Download cloud progress to localStorage
     */
    async syncCloudToLocal(): Promise<{ success: boolean; error?: string }> {
        try {
            const childId = activeChild.get();
            if (!childId) {
                return { success: false, error: 'No hay un hijo/a activo en la sesión' };
            }

            const { data, error } = await supabase
                .from('children')
                .select('completed_scenarios, badges, scores, scenario_progress')
                .eq('id', childId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    console.log('[SyncService] No cloud data yet, using local');
                    return { success: true };
                }
                console.error('[SyncService] Download error:', error);
                return { success: false, error: error.message };
            }

            if (data) {
                const cloudProgress: UserProgress = {
                    completedScenarios: data.completed_scenarios || [],
                    badges: data.badges || [],
                    scores: data.scores || {},
                    scenarioProgress: data.scenario_progress || {},
                    currentScenario: null
                };

                storage.set(cloudProgress);
                console.log('[SyncService] ✅ Cloud progress loaded to local');
            }

            return { success: true };
        } catch (e) {
            console.error('[SyncService] Sync error:', e);
            return { success: false, error: e.message };
        }
    },

    /**
     * Merge local and cloud progress (union of both, not last-write-wins)
     */
    async mergeProgress(): Promise<{ success: boolean; error?: string }> {
        try {
            const childId = activeChild.get();
            if (!childId) {
                return { success: false, error: 'No hay un hijo/a activo en la sesión' };
            }

            const localProgress = storage.get();

            const { data: cloudData } = await supabase
                .from('children')
                .select('completed_scenarios, badges, scores, scenario_progress')
                .eq('id', childId)
                .single();

            // If no cloud data, just upload local
            if (!cloudData) {
                return await this.syncLocalToCloud();
            }

            const cloudProgress: UserProgress = {
                completedScenarios: cloudData.completed_scenarios || [],
                badges: cloudData.badges || [],
                scores: cloudData.scores || {},
                scenarioProgress: cloudData.scenario_progress || {},
                currentScenario: null
            };

            // ALWAYS Merge progress instead of overwriting based on length
            const mergedProgress: UserProgress = {
                completedScenarios: Array.from(new Set([...localProgress.completedScenarios, ...cloudProgress.completedScenarios])),
                badges: Array.from(new Set([...localProgress.badges, ...cloudProgress.badges])),
                scores: { ...cloudProgress.scores, ...localProgress.scores },
                scenarioProgress: { ...cloudProgress.scenarioProgress, ...localProgress.scenarioProgress },
                currentScenario: localProgress.currentScenario || cloudProgress.currentScenario
            };

            // Update local storage with the merged result
            storage.set(mergedProgress);

            // Upload the merged result to cloud
            return await this.syncLocalToCloud();
        } catch (e) {
            console.error('[SyncService] Merge error:', e);
            return { success: false, error: e.message };
        }
    },

    /**
     * Auto-sync when the active child changes (e.g. after picking a profile on login)
     */
    async onLogin(): Promise<void> {
        if (!activeChild.get()) {
            console.log('[SyncService] No active child yet, skipping sync');
            return;
        }
        console.log('[SyncService] Active child set, merging progress...');
        await this.mergeProgress();
    }
};
