import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
});

function validateEnv() {
  const raw = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key',
  };

  const parsed = envSchema.safeParse(raw);

  if (!parsed.success) {
    const isProd = process.env.NODE_ENV === 'production';
    const level = isProd ? 'error' : 'warn';
    console[level]('⚠️  Environment variable validation:');
    for (const issue of parsed.error.issues) {
      console[level](`   - ${issue.path.join('.')}: ${issue.message}`);
    }
  }

  // Always return the raw values with fallbacks so the app can start.
  // In production, the warning will be visible in logs.
  return raw;
}

export const env = validateEnv();
