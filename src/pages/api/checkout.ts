import type { APIRoute } from 'astro';
import { stripe } from '../../lib/stripe';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request, redirect }) => {
    try {
        const { priceId, successUrl, cancelUrl } = await request.json();

        // Get user session to link payment
        // For now we assume client sends nothing secure, but in real flow we check auth here
        // But Supabase auth cookie might not be easily parsable without helper
        // So we will rely on client passing email or metadata, or just use metadata for later reconciliation

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: 'Kidia Premium: Misión Avanzada',
                            description: 'Desbloquea escenarios con IA real y desafíos éticos avanzados.',
                        },
                        unit_amount: 499, // 4.99 EUR
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        return new Response(JSON.stringify({ url: session.url }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Stripe Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
