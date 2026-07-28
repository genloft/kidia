import { supabase } from './supabase';

export interface Child {
    id: string;
    parent_id: string;
    name: string;
    birth_date: string | null;
    avatar: string | null;
    created_at: string;
}

export const ChildrenService = {
    async listChildren(): Promise<Child[]> {
        const { data, error } = await supabase
            .from('children')
            .select('id, parent_id, name, birth_date, avatar, created_at')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[ChildrenService] list error:', error);
            return [];
        }
        return data || [];
    },

    async addChild(name: string, birthDate: string | null): Promise<{ data: Child | null; error?: string }> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: null, error: 'No hay sesión activa' };

        const { data, error } = await supabase
            .from('children')
            .insert({ parent_id: user.id, name, birth_date: birthDate })
            .select()
            .single();

        if (error) {
            console.error('[ChildrenService] add error:', error);
            return { data: null, error: error.message };
        }
        return { data };
    },

    async updateChild(id: string, fields: { name?: string; birth_date?: string | null; avatar?: string | null }): Promise<{ error?: string }> {
        const { error } = await supabase
            .from('children')
            .update({ ...fields, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error('[ChildrenService] update error:', error);
            return { error: error.message };
        }
        return {};
    },

    async deleteChild(id: string): Promise<{ error?: string }> {
        const { error } = await supabase.from('children').delete().eq('id', id);
        if (error) {
            console.error('[ChildrenService] delete error:', error);
            return { error: error.message };
        }
        return {};
    }
};
