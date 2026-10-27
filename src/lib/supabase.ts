import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

function isValidHttpUrl(str: string): boolean {
  if (!str) return false;
  try {
    const parsed = new URL(str);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidSupabaseConfig(url: string, key: string): boolean {
  if (!isValidHttpUrl(url)) return false;
  const lowerUrl = url.toLowerCase();
  if (
    lowerUrl.includes('your-project') ||
    lowerUrl.includes('example.com') ||
    lowerUrl.includes('placeholder')
  ) {
    return false;
  }
  // Supabase anon keys are JWTs (3 segments separated by dots) or long security tokens
  if (!key || key.length < 20 || key === '123' || key.includes('...')) {
    return false;
  }
  return true;
}

function createSafeSupabaseClient(): SupabaseClient | null {
  if (!isValidSupabaseConfig(rawUrl, rawKey)) {
    return null;
  }
  try {
    return createClient(rawUrl, rawKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (error) {
    console.warn('Supabase client could not be initialized:', error);
    return null;
  }
}

export const supabase: SupabaseClient | null = createSafeSupabaseClient();
export const isSupabaseConfigured: boolean = Boolean(supabase !== null);
