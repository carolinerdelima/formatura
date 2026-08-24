import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { initConvidadosSync, initRemoteSync, stopConvidadosSync } from '../../store/useStore';
import { useSession } from './useSession';

/**
 * Envolve toda a área administrativa. Sem sessão, redireciona para `/login`.
 * Com sessão, dispara o bootstrap dos dados remotos (blob + tabela de
 * convidados + realtime) uma única vez.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  // O Supabase dispara `onAuthStateChange` (com um novo objeto de sessão) a
  // cada renovação silenciosa de token, não só no login/logout. Depender do
  // `session` inteiro reiniciava o bootstrap (refetch + re-assinatura) a cada
  // renovação, o que podia sobrescrever uma edição local que ainda não tinha
  // terminado de gravar no Supabase. `user.id` só muda em login/logout de verdade.
  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) return;
    initRemoteSync();
    initConvidadosSync();
    return () => stopConvidadosSync();
  }, [userId]);

  // `undefined` = ainda checando a sessão salva; evita um flash pra tela de login
  if (session === undefined) return null;
  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
