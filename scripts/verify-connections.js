import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env parser since dotenv is not installed
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const content = fs.readFileSync(envPath, 'utf-8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                let value = match[2].trim();
                if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
                    value = value.slice(1, -1);
                }
                env[match[1].trim()] = value;
            }
        });
        return env;
    } catch (e) {
        console.error('Error reading .env:', e.message);
        return {};
    }
}

const env = loadEnv();

async function checkSupabase() {
    console.log('\n--- Checking Supabase ---');
    const url = env.PUBLIC_SUPABASE_URL;
    const key = env.PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error('❌ Missing credentials in .env');
        return false;
    }

    try {
        const supabase = createClient(url, key);
        // Try a simple query
        const { data, error } = await supabase.from('profiles').select('count').limit(1);

        if (error) {
            // Error calling table might be RLS or table missing, but connection worked if code is specific
            // If connection failed (e.g. bad URL), it throws or returns specific error
            if (error.code === 'PGRST301' || error.message.includes('fetch functionality') || error.code === '42P01') {
                // 42P01 is undefined_table, means connection OK but table missing
                console.log('⚠️  Connected, but table "profiles" might be missing. Did you run the schema?');
                console.log('Error details:', error.message);
                return true;
            }
            console.error('❌ Connection failed:', error.message);
            return false;
        }
        console.log('✅ Connection Successful!');
        return true;
    } catch (e) {
        console.error('❌ Connection Exception:', e.message);
        return false;
    }
}

async function checkOpenAI() {
    console.log('\n--- Checking OpenAI ---');
    const key = env.OPENAI_API_KEY;
    if (!key) {
        console.log('⚠️  OPENAI_API_KEY is missing. Skipping.');
        return;
    }
    // We can't easily test OpenAI without making a paid call or using a lib that might not be configured for node here easily without full import
    // But since we just want to check if key is present mostly
    console.log('ℹ️  Key is present. (Skipping actual API call to save tokens/complexity)');
}

async function checkStripe() {
    console.log('\n--- Checking Stripe ---');
    const key = env.STRIPE_SECRET_KEY;
    if (!key) {
        console.log('⚠️  STRIPE_SECRET_KEY is missing. Checkout will not work.');
        return;
    }
    console.log('✅ Stripe key is present.');
}

(async () => {
    await checkSupabase();
    await checkOpenAI();
    await checkStripe();
})();
