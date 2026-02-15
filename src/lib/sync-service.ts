import { supabase } from './supabase';
import { storage, type UserProgress } from './storage-simple';

/**
 * Sync Service - Handles synchronization between localStorage and Supabase
 */

export const SyncService = {
    /**
     * Upload local progress to Supabase
     */
    async syncLocalToCloud(): Promise<{ success: boolean; error?: string }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return { success: false, error: 'No user logged in' };
            }

            const localProgress = storage.get();

            // Upsert user profile with progress data
            const { error } = await supabase
                .from('user_profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    completed_scenarios: localProgress.completedScenarios,
                    badges: localProgress.badges,
                    scores: localProgress.scores,
                    scenario_progress: localProgress.scenarioProgress,
                    updated_at: new Date().toISOString()
                });

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
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return { success: false, error: 'No user logged in' };
            }

            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                // User profile doesn't exist yet - this is fine for new users
                if (error.code === 'PGRST116') {
                    console.log('[SyncService] No cloud data yet, using local');
                    return { success: true };
                }
                console.error('[SyncService] Download error:', error);
                return { success: false, error: error.message };
            }

            if (data) {
                // Merge cloud data into localStorage
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
     * Merge local and cloud progress (use the one with more completed scenarios)
     */
    async mergeProgress(): Promise<{ success: boolean; error?: string }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return { success: false, error: 'No user logged in' };
            }

            const localProgress = storage.get();

            const { data: cloudData } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
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

            // Compare progress (use the one with more completed scenarios)
            const localCount = localProgress.completedScenarios.length;
            const cloudCount = cloudProgress.completedScenarios.length;

            if (localCount > cloudCount) {
                console.log('[SyncService] Local progress is ahead, uploading...');
                return await this.syncLocalToCloud();
            } else if (cloudCount > localCount) {
                console.log('[SyncService] Cloud progress is ahead, downloading...');
                return await this.syncCloudToLocal();
            } else {
                // Same progress, merge badges and scores
                const mergedProgress: UserProgress = {
                    completedScenarios: Array.from(new Set([...localProgress.completedScenarios, ...cloudProgress.completedScenarios])),
                    badges: Array.from(new Set([...localProgress.badges, ...cloudProgress.badges])),
                    scores: { ...cloudProgress.scores, ...localProgress.scores },
                    scenarioProgress: { ...cloudProgress.scenarioProgress, ...localProgress.scenarioProgress },
                    currentScenario: localProgress.currentScenario
                };

                storage.set(mergedProgress);
                return await this.syncLocalToCloud();
            }
        } catch (e) {
            console.error('[SyncService] Merge error:', e);
            return { success: false, error: e.message };
        }
    },

    /**
     * Auto-sync on login
     */
    async onLogin(): Promise<void> {
        console.log('[SyncService] User logged in, merging progress...');
        await this.mergeProgress();
    }
};
