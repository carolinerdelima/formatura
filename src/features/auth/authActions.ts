import { supabase } from '../../lib/supabase';
import { stopConvidadosSync } from '../../store/useStore';

/** Encerra a sessão da admin. */
export async function sair(): Promise<void> {
  stopConvidadosSync();
  await supabase?.auth.signOut();
}
