import { supabase } from './supabase';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface LearningPath {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    age_min: number;
    age_max: number;
    difficulty: Difficulty;
    price_cents: number | null;
    display_order: number;
    active: boolean;
}

export const PathsService = {
    async listActivePaths(): Promise<LearningPath[]> {
        const { data, error } = await supabase
            .from('learning_paths')
            .select('*')
            .eq('active', true)
            .order('display_order', { ascending: true });

        if (error) {
            console.error('[PathsService] list error:', error);
            return [];
        }
        return data || [];
    }
};
