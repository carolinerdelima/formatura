import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // eslint-disable-next-line no-console
    console.warn(
        'Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY. ' +
        'O app seguirá funcionando apenas com localStorage.',
    );
}

/** Client único do Supabase. `null` quando as env vars não estão configuradas
 *  (ex.: rodando local sem `.env`) - nesse caso o app cai para localStorage puro. */
export const supabase =
    supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;