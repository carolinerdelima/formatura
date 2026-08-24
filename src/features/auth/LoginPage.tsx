import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useSession } from './useSession';

/** Tela de login — só a admin (você) tem conta aqui. Sem cadastro público. */
export function LoginPage() {
  const { session } = useSession();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (session) return <Navigate to="/" replace />;

  const entrar = async () => {
    if (!supabase) {
      setErro('Supabase não configurado neste ambiente.');
      return;
    }
    setErro('');
    setEnviando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setEnviando(false);
    if (error) setErro('E-mail ou senha incorretos.');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div className="card" style={{ maxWidth: 360, width: '100%' }}>
        <div className="view-head" style={{ marginBottom: 18 }}>
          <div className="eyebrow">Golden Hour at the Farm</div>
          <h2 style={{ fontSize: 26 }}>
            Formatura da <em>Carol</em>
          </h2>
          <p>Área administrativa — só você tem acesso.</p>
        </div>

        <div className="row" style={{ flexDirection: 'column' }}>
          <div>
            <label className="fld">E-mail</label>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void entrar();
              }}
            />
          </div>
          <div style={{ marginTop: 10 }}>
            <label className="fld">Senha</label>
            <input
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void entrar();
              }}
            />
          </div>
        </div>

        {erro ? (
          <p style={{ color: '#b5442f', fontSize: 13, marginTop: 10 }}>{erro}</p>
        ) : null}

        <button
          type="button"
          className="btn"
          style={{ width: '100%', marginTop: 16 }}
          disabled={enviando}
          onClick={() => void entrar()}
        >
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </div>
    </div>
  );
}
