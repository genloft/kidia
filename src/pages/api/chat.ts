import type { APIRoute } from 'astro';
import { openai } from '../../lib/openai';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { messages, scenarioId } = body;

        // Here we could fetch specific prompt context based on scenarioId
        // For now, we use a generic system prompt for Kidia
        const systemPrompt = `
      Eres Kidia, una niña de 12 años entusiasta y curiosa.
      Estás aquí para ayudar a otros niños a entender la Inteligencia Artificial.
      
      Reglas:
      1. Usa emojis y tono divertido.
      2. No des lecciones largas. Haz preguntas para que el usuario piense.
      3. Si te preguntan algo técnico, usa metáforas simples (ej. patrón = buscar formas en las nubes).
      4. Si el escenario es 'intro-ia', enfócate en conceptos básicos.
      5. Si el escenario es 'learning-patterns', enfócate en visión por computador y píxeles.
      6. Si el escenario es 'ethics-basic', enfócate en sesgos y errores.
    `;

        const chatCompletion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            model: 'gpt-4o-mini',
            temperature: 0.7,
        });

        const reply = chatCompletion.choices[0].message.content;

        return new Response(JSON.stringify({
            role: 'assistant',
            content: reply
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error('OpenAI Error:', error);
        return new Response(JSON.stringify({ error: 'Error connecting to brain' }), { status: 500 });
    }
};
