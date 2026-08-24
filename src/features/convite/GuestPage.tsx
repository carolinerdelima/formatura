import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from '../../components/toastStore';
import { Toast } from '../../components/Toast';
import { dataPorExtenso, horaCurta } from '../../lib/format';
import type { Faixa, Genero } from '../../types';
import { CONVITE_INFO } from './conviteInfo';
import { linkComoChegar, linkSalvarNaAgenda } from './links';
import { buscarConvite, enviarRsvp, type ConviteData } from './rsvp';

type Fase = 'carregando' | 'nao-encontrado' | 'form' | 'obrigado';

/** Página pública e pessoal de RSVP — `/c/:slug`. Sem login, sem cadastro. */
export function GuestPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [fase, setFase] = useState<Fase>('carregando');
  const [convite, setConvite] = useState<ConviteData | null>(null);
  const [respostaFinal, setRespostaFinal] = useState<'confirmado' | 'recusado' | null>(null);

  useEffect(() => {
    let ativo = true;
    buscarConvite(slug).then((data) => {
      if (!ativo) return;
      if (!data) {
        setFase('nao-encontrado');
        return;
      }
      setConvite(data);
      setFase('form');
    });
    return () => {
      ativo = false;
    };
  }, [slug]);

  if (fase === 'carregando') {
    return <CentroPagina>Carregando seu convite…</CentroPagina>;
  }

  if (fase === 'nao-encontrado') {
    return (
      <CentroPagina>
        <div className="card" style={{ maxWidth: 420, textAlign: 'center' }}>
          <div style={{ fontSize: 32 }}>🌾</div>
          <h2 style={{ marginTop: 10 }}>Convite não encontrado</h2>
          <p style={{ color: 'var(--ink-soft)', marginTop: 8 }}>
            Esse link não corresponde a nenhum convite. Confira se copiou o endereço certinho, ou
            fale com a Carol.
          </p>
        </div>
      </CentroPagina>
    );
  }

  if (fase === 'obrigado' && convite) {
    return (
      <CentroPagina>
        <div className="card" style={{ maxWidth: 420, textAlign: 'center' }}>
          <div style={{ fontSize: 32 }}>{respostaFinal === 'confirmado' ? '🎉' : '💌'}</div>
          <h2 style={{ marginTop: 10 }}>
            {respostaFinal === 'confirmado' ? 'Presença confirmada!' : 'Resposta registrada'}
          </h2>
          <p style={{ color: 'var(--ink-soft)', marginTop: 8 }}>
            {respostaFinal === 'confirmado'
              ? `Que alegria, ${convite.nome}! Nos vemos na golden hour. 🌾✨`
              : `Obrigada por avisar, ${convite.nome}. Você vai fazer falta!`}
          </p>
          {respostaFinal === 'confirmado' ? <PresentesEPix /> : null}
        </div>
      </CentroPagina>
    );
  }

  return convite ? <FormularioConvite slug={slug} convite={convite} onEnviado={setRespostaFinal} onFaseObrigado={() => setFase('obrigado')} /> : null;
}

function CentroPagina({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {children}
      <Toast />
    </div>
  );
}

function FormularioConvite({
  slug,
  convite,
  onEnviado,
  onFaseObrigado,
}: {
  slug: string;
  convite: ConviteData;
  onEnviado: (r: 'confirmado' | 'recusado') => void;
  onFaseObrigado: () => void;
}) {
  const precisaFaixaGenero = convite.genero === '';
  const [faixa, setFaixa] = useState<Faixa>(convite.faixa);
  const [genero, setGenero] = useState<Genero>(convite.genero);
  const [enviando, setEnviando] = useState<'confirmado' | 'recusado' | null>(null);
  const jaRespondeu = convite.status !== 'pendente';
  const [mudarResposta, setMudarResposta] = useState(false);

  const responder = async (status: 'confirmado' | 'recusado') => {
    setEnviando(status);
    const ok = await enviarRsvp(slug, status, precisaFaixaGenero ? faixa : undefined, precisaFaixaGenero ? genero : undefined);
    setEnviando(null);
    if (ok) {
      onEnviado(status);
      onFaseObrigado();
    } else {
      toast('Não deu pra enviar agora — tenta de novo em instantes.');
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '32px auto', padding: '0 16px' }}>
      <div className="hero">
        <div className="sundial" />
        <div className="kicker">Golden Hour at the Farm</div>
        <h2>
          Olá, <em>{convite.nome || 'convidado'}</em>!
        </h2>
        <div className="where">
          📍 {CONVITE_INFO.local} · {CONVITE_INFO.endereco}
          <br />
          🗓️ {dataPorExtenso(CONVITE_INFO.dataHora)}, {horaCurta(CONVITE_INFO.dataHora)}
        </div>
        <div className="row" style={{ marginTop: 18 }}>
          <a className="btn soft" href={linkComoChegar()} target="_blank" rel="noopener noreferrer">
            📍 Como chegar
          </a>
          <a className="btn soft" href={linkSalvarNaAgenda()} target="_blank" rel="noopener noreferrer">
            🗓️ Salvar na agenda
          </a>
        </div>
      </div>

      {jaRespondeu && !mudarResposta ? (
        <div className="card" style={{ marginTop: 18, textAlign: 'center' }}>
          <p style={{ margin: 0 }}>
            Você já respondeu:{' '}
            <b>{convite.status === 'confirmado' ? 'vai à festa 🎉' : 'não vai poder ir'}</b>
          </p>
          <button
            type="button"
            className="btn ghost sm"
            style={{ marginTop: 10 }}
            onClick={() => setMudarResposta(true)}
          >
            Mudar resposta
          </button>
          {convite.status === 'confirmado' ? <PresentesEPix /> : null}
        </div>
      ) : (
        <div className="card" style={{ marginTop: 18 }}>
          <h3>Você vem?</h3>
          {precisaFaixaGenero ? (
            <div className="row" style={{ marginTop: 10 }}>
              <div>
                <label className="fld">Faixa etária</label>
                <select value={faixa} onChange={(e) => setFaixa(e.target.value as Faixa)}>
                  <option value="adulto">Adulto</option>
                  <option value="crianca">Criança</option>
                  <option value="adolescente">Adolescente</option>
                </select>
              </div>
              <div>
                <label className="fld">Gênero</label>
                <select value={genero} onChange={(e) => setGenero(e.target.value as Genero)}>
                  <option value="">Selecione</option>
                  <option value="F">Feminino</option>
                  <option value="M">Masculino</option>
                </select>
              </div>
            </div>
          ) : null}
          <div className="row" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn"
              disabled={enviando !== null}
              onClick={() => void responder('confirmado')}
            >
              {enviando === 'confirmado' ? 'Enviando…' : '✓ Vou sim!'}
            </button>
            <button
              type="button"
              className="btn ghost"
              disabled={enviando !== null}
              onClick={() => void responder('recusado')}
            >
              {enviando === 'recusado' ? 'Enviando…' : 'Não vou poder ir'}
            </button>
          </div>
        </div>
      )}
      <Toast />
    </div>
  );
}

function PresentesEPix() {
  const { pix, sugestoesPresente } = CONVITE_INFO;
  return (
    <div style={{ marginTop: 16, textAlign: 'left' }}>
      <h4 style={{ fontSize: 15 }}>🎁 Ideias de presente</h4>
      <ul style={{ fontSize: 13.5, color: 'var(--ink-soft)', paddingLeft: 18 }}>
        {sugestoesPresente.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      {pix.chave ? (
        <div className="chiprow">
          <span className="chip">
            {pix.tipo}: <b>{pix.chave}</b>
          </span>
          <button
            type="button"
            className="btn sm soft"
            onClick={() => {
              void navigator.clipboard.writeText(pix.chave);
              toast('Chave PIX copiada!');
            }}
          >
            Copiar chave
          </button>
        </div>
      ) : null}
    </div>
  );
}
