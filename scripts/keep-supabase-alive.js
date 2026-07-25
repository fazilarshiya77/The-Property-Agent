import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to read .env file manually without external dependencies
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    for (const line of envConfig.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        const val = values.join('=').trim().replace(/^["']|["']$/g, '');
        if (key && val && !process.env[key.trim()]) {
          process.env[key.trim()] = val;
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase URL or Anon/Publishable Key is missing from environment variables.');
  console.error('Please make sure SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) are set.');
  process.exit(1);
}

async function pingSupabase() {
  const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/`;
  console.log(`📡 Pinging Supabase project at: ${endpoint}`);

  try {
    const startTime = Date.now();
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    const duration = Date.now() - startTime;

    if (response.ok || response.status < 500) {
      console.log(`✅ Success! Supabase project pinged in ${duration}ms (HTTP ${response.status} ${response.statusText}).`);
      console.log('🎉 Your Supabase project status is updated and will remain active without pausing.');
    } else {
      console.error(`⚠️ Received unexpected response code: ${response.status} ${response.statusText}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to ping Supabase project:', error.message);
    process.exit(1);
  }
}

pingSupabase();
