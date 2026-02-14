import OpenAI from 'openai';

const apiKey = import.meta.env.OPENAI_API_KEY;

if (!apiKey) {
    console.warn('OPENAI_API_KEY is missing');
}

export const openai = new OpenAI({
    apiKey: apiKey || 'dummy-key', // Prevent crash if missing, but calls will fail
});
