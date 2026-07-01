import { supabase } from './supabase';
import type { Difficulty } from './paths-service';

export interface Enrollment {
    id: string;
    child_id: string;
    path_id: string;
    status: 'active' | 'cancelled' | 'pending_payment';
    payment_status: 'unpaid' | 'paid';
    enrolled_at: string;
}

export const EnrollmentService = {
    async listEnrollments(childId: string): Promise<Enrollment[]> {
        const { data, error } = await supabase
            .from('enrollments')
            .select('id, child_id, path_id, status, payment_status, enrolled_at')
            .eq('child_id', childId);

        if (error) {
            console.error('[EnrollmentService] list error:', error);
            return [];
        }
        return data || [];
    },

    async enroll(childId: string, pathId: string): Promise<{ error?: string }> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'No hay sesión activa' };

        // Sin pago real todavía: el acceso se concede de inmediato.
        // Cuando se conecte Stripe, crear con status: 'pending_payment' y
        // pasar a 'active' solo desde el webhook de pago confirmado.
        const { error } = await supabase
            .from('enrollments')
            .insert({
                child_id: childId,
                path_id: pathId,
                parent_id: user.id,
                status: 'active',
                payment_status: 'unpaid'
            });

        if (error) {
            console.error('[EnrollmentService] enroll error:', error);
            return { error: error.code === '23505' ? 'Este hijo/a ya está inscrito en este camino.' : error.message };
        }
        return {};
    },

    /**
     * Comprueba si un hijo tiene acceso a un `difficulty` de escenario
     * (es decir, está inscrito con status 'active' en el camino que lo cubre).
     */
    async isDifficultyUnlocked(childId: string, difficulty: Difficulty): Promise<boolean> {
        const unlocked = await this.getUnlockedDifficulties(childId);
        return unlocked.has(difficulty);
    },

    /**
     * Todos los `difficulty` a los que un hijo tiene acceso ahora mismo,
     * en una sola consulta (para no repetir una query por escenario en el Mapa).
     */
    async getUnlockedDifficulties(childId: string): Promise<Set<Difficulty>> {
        const { data, error } = await supabase
            .from('enrollments')
            .select('status, learning_paths!inner(difficulty)')
            .eq('child_id', childId)
            .eq('status', 'active');

        if (error) {
            console.error('[EnrollmentService] getUnlockedDifficulties error:', error);
            return new Set();
        }

        return new Set((data || []).map((row: any) => row.learning_paths.difficulty as Difficulty));
    }
};
