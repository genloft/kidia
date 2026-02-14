import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Manual .env parser
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const content = fs.readFileSync(envPath, 'utf-8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                let value = match[2].trim();
                // Remove quotes if present
                if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
                    value = value.slice(1, -1);
                }
                env[match[1].trim()] = value;
            }
        });
        return env;
    } catch (e) {
        return {};
    }
}

const env = loadEnv();

async function testOpenAI() {
    console.log('🤖 Testing OpenAI connection...');

    if (!env.OPENAI_API_KEY) {
        console.error('❌ No API KEY found.');
        return;
    }

    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: "Say 'Hello Kidia!'" }],
            model: "gpt-4o-mini",
        });

        console.log('✅ OpenAI Responded:', completion.choices[0].message.content);
    } catch (error) {
        console.error('❌ OpenAI Error:', error.message);
        if (error.code === 'insufficient_quota') {
            console.error('⚠️  Your API key is valid, but you have no credit/quota.');
        } else if (error.code === 'invalid_api_key') {
            console.error('⚠️  The API key is invalid.');
        }
    }
}

testOpenAI();
