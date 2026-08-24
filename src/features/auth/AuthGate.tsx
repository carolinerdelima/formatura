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

  useEffect(() => {
    if (!session) return;
    initRemoteSync();
    initConvidadosSync();
    return () => stopConvidadosSync();
  }, [session]);

  // `undefined` = ainda checando a sessão salva; evita um flash pra tela de login
  if (session === undefined) return null;
  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
