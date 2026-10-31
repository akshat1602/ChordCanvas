import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Singleton instance for client-side use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export createClient as a helper function as well to prevent any import mismatches
export { createClient };