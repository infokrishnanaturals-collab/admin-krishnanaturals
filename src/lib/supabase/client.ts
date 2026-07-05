import { createBrowserClient } from '@supabase/ssr';
import { auth } from '@/lib/firebase/config';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                fetch: async (url, options = {}) => {
                    const headers = new Headers(options?.headers);
                    
                    if (auth.currentUser) {
                        const token = await auth.currentUser.getIdToken();
                        headers.set('Authorization', `Bearer ${token}`);
                    }
                    
                    return fetch(url, {
                        ...options,
                        headers
                    });
                }
            }
        }
    );
}
