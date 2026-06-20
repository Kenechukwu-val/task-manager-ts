import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const supabase = createClient(
    PUBLIC_SUPABASE_URL, 
    PUBLIC_SUPABASE_ANON_KEY,
    {
        auth: {
            flowType: 'pkce', // Use PKCE flow for better security
            detectSessionInUrl: true, // Automatically detect session in URL
            persistSession: true, // Persist session in local storage
        }
    }
);
