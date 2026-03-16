/**
 * Supabase REST client — reads credentials from environment variables.
 */

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const BASE_URL = `https://${PROJECT_ID}.supabase.co/rest/v1`;

export const HEADERS = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  'Content-Type': 'application/json',
};

/**
 * Generic GET helper — returns parsed JSON array or empty array on error.
 */
export async function supabaseGet(url) {
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('[supabase]', err.message);
    return [];
  }
}
