import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface SessionState {
  /** `undefined` enquanto ainda não sabemos (checando a sessão salva). */
  session: Session | null | undefined;
}

/** Sessão de autenticação atual do Supabase, atualizada ao vivo (login/logout). */
export function useSession(): SessionState {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session };
}
