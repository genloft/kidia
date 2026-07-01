import { supabase } from './supabase';

// Los 3 planes reales de Kidia Campus (ver Kidia_Campus_BPlan_Final.docx, cap. 8.1).
// Es una suscripción FAMILIAR (una por cuenta de padre/madre), no por hijo ni por
// tramo de edad: da acceso completo a la plataforma para todos sus hijos.

export type PlanId = 'familiar' | 'familiar_plus' | 'premium';

export interface Plan {
    id: PlanId;
    name: string;
    priceCents: number;
    features: string[];
}

export const PLANS: Plan[] = [
    {
        id: 'familiar',
        name: 'Familiar',
        priceCents: 1900,
        features: ['Acceso completo a las misiones', 'Panel familiar', 'Certificados de progreso']
    },
    {
        id: 'familiar_plus',
        name: 'Familiar Plus',
        priceCents: 3900,
        features: ['Todo lo de Familiar', 'Retos exclusivos', 'Clases grupales']
    },
    {
        id: 'premium',
        name: 'Premium',
        priceCents: 6900,
        features: ['Todo lo de Familiar Plus', 'Mentorías', 'Eventos y comunidad exclusiva']
    }
];

export interface Subscription {
    plan: PlanId | null;
    plan_status: 'inactive' | 'active' | 'cancelled';
}

export const SubscriptionService = {
    async getSubscription(): Promise<Subscription | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('user_profiles')
            .select('plan, plan_status')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('[SubscriptionService] getSubscription error:', error);
            return null;
        }
        return data;
    },

    async hasActivePlan(): Promise<boolean> {
        const sub = await this.getSubscription();
        return sub?.plan_status === 'active';
    },

    /**
     * Sin pago real todavía: activa el plan directamente.
     * Cuando se conecte Stripe, esto pasa a crear el registro como
     * 'inactive' y activarlo solo desde el webhook de pago confirmado.
     */
    async activatePlan(planId: PlanId): Promise<{ error?: string }> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'No hay sesión activa' };

        const { error } = await supabase
            .from('user_profiles')
            .update({
                plan: planId,
                plan_status: 'active',
                plan_started_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (error) {
            console.error('[SubscriptionService] activatePlan error:', error);
            return { error: error.message };
        }
        return {};
    },

    async cancelPlan(): Promise<{ error?: string }> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'No hay sesión activa' };

        const { error } = await supabase
            .from('user_profiles')
            .update({ plan_status: 'cancelled' })
            .eq('id', user.id);

        if (error) {
            console.error('[SubscriptionService] cancelPlan error:', error);
            return { error: error.message };
        }
        return {};
    }
};
