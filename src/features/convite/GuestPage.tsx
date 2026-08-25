import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from '../../components/toastStore';
import { Toast } from '../../components/Toast';
import { dataPorExtenso, horaCurta } from '../../lib/format';
import type { Faixa, Genero } from '../../types';
import { CONVITE_INFO } from './conviteInfo';
import {
  CATEGORIAS_PRESENTE,
  PREFERENCIAS_BASICAS,
  SUGESTOES_PRESENTE,
  type CategoriaPresente,
} from './giftSuggestions';
import { linkComoChegar, linkSalvarNaAgenda } from './links';
import { buscarConvite, enviarRsvp, type ConviteData } from './rsvp';

type Fase = 'carregando' | 'nao-encontrado' | 'form' | 'obrigado';

/** Página pública e pessoal de RSVP - `/c/:slug`. Sem login, sem cadastro. */
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
        <div style={{ maxWidth: 420, width: '100%' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32 }}>{respostaFinal === 'confirmado' ? '🎉' : '💌'}</div>
            <h2 style={{ marginTop: 10 }}>
              {respostaFinal === 'confirmado' ? 'Presença confirmada!' : 'Resposta registrada'}
            </h2>
            <p style={{ color: 'var(--ink-soft)', marginTop: 8 }}>
              {respostaFinal === 'confirmado'
                ? `Que alegria, ${convite.nome}! Nos vemos lá ✨`
                : `Obrigada por avisar, ${convite.nome}. Você vai fazer falta :(`}
            </p>
          </div>
          {respostaFinal === 'confirmado' ? <SecaoPresente /> : null}
        </div>
      </CentroPagina>
    );
  }

  return convite ? (
    <FormularioConvite
      slug={slug}
      convite={convite}
      onEnviado={setRespostaFinal}
      onFaseObrigado={() => setFase('obrigado')}
    />
  ) : null;
}

function CentroPagina({ children }: { children: React.ReactNode }) {
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
    const ok = await enviarRsvp(
      slug,
      status,
      precisaFaixaGenero ? faixa : undefined,
      precisaFaixaGenero ? genero : undefined,
    );
    setEnviando(null);
    if (ok) {
      onEnviado(status);
      onFaseObrigado();
    } else {
      toast('Não deu pra enviar agora - tenta de novo em instantes.');
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '32px auto', padding: '0 16px' }}>
      <div className="hero">
        <div className="sundial" />
        <div className="kicker">{CONVITE_INFO.nomeEvento}</div>
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
          <a
            className="btn soft"
            href={linkSalvarNaAgenda()}
            target="_blank"
            rel="noopener noreferrer"
          >
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

      <SecaoPresente />

      <Toast />
    </div>
  );
}

/** Bloco entre a descrição do evento e a confirmação: sugestões de presente / chave PIX,
 *  cada um revelado só ao clicar - não empurra a tela de confirmação pra baixo à toa. */
function SecaoPresente() {
  const { pix } = CONVITE_INFO;
  const [verSugestoes, setVerSugestoes] = useState(false);
  const [verPix, setVerPix] = useState(false);

  const categorias = Object.keys(CATEGORIAS_PRESENTE) as CategoriaPresente[];

  return (
    <div className="card" style={{ marginTop: 18 }}>
      <p style={{ margin: 0 }}>🎁 Deseja dar algum presente?</p>
      <div className="row" style={{ marginTop: 10 }}>
        <button type="button" className="btn ghost sm" onClick={() => setVerSugestoes((v) => !v)}>
          {verSugestoes ? 'Ocultar sugestões' : 'Clique aqui pra ver sugestões'}
        </button>
        <button type="button" className="btn ghost sm" onClick={() => setVerPix((v) => !v)}>
          {verPix ? 'Ocultar chave PIX' : 'Clique aqui para ver a chave PIX'}
        </button>
      </div>

      {verSugestoes ? (
        <div style={{ marginTop: 14 }}>
          <ul style={{ fontSize: 13.5, color: 'var(--ink-soft)', paddingLeft: 18, margin: 0 }}>
            {PREFERENCIAS_BASICAS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>

          {SUGESTOES_PRESENTE.length ? (
            <div style={{ marginTop: 18 }}>
              <h4 style={{ fontSize: 14, margin: '0 0 4px' }}>💭 Exemplos do gosto da Carol</h4>
              <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '0 0 10px' }}>
                São só referências pra pegar a ideia - não precisa ser exatamente isso.
              </p>
              {categorias.map((cat) => {
                const itens = SUGESTOES_PRESENTE.filter((s) => s.categoria === cat);
                if (!itens.length) return null;
                return (
                  <div key={cat} style={{ marginBottom: 14 }}>
                    <h5 style={{ fontSize: 13, margin: '0 0 8px' }}>{CATEGORIAS_PRESENTE[cat]}</h5>
                    <div className="gift-grid">
                      {itens.map((item) => (
                        <figure className="gift-item" key={item.nome}>
                          <img src={`/presentes/${item.imagem}`} alt={item.nome} loading="lazy" />
                          <figcaption>{item.nome}</figcaption>
                        </figure>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      {verPix ? (
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          {pix.qrImagem ? (
            <img
              src={pix.qrImagem}
              alt="QR code do PIX"
              style={{ maxWidth: 200, borderRadius: 10, marginBottom: 10 }}
            />
          ) : null}
          {pix.chave ? (
            <div className="chiprow" style={{ justifyContent: 'center' }}>
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
          ) : (
            <p className="empty" style={{ textAlign: 'left' }}>
              Chave PIX ainda não cadastrada.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
