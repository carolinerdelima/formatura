import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from '../../components/toastStore';
import { Toast } from '../../components/Toast';
import { horaCurta } from '../../lib/format';
import type { Faixa, Genero } from '../../types';
import { ConviteFundo, DiplomaIlustracao, IconeCalendario, IconeMapa, TituloArco } from './ConviteArt';
import './convite.css';
import { CONVITE_INFO } from './conviteInfo';
import {
  CATEGORIAS_PRESENTE,
  PREFERENCIAS_BASICAS,
  SUGESTOES_PRESENTE,
  TITULO_PREFERENCIAS,
  type CategoriaPresente,
} from './giftSuggestions';
import { linkComoChegar, linkSalvarNaAgenda } from './links';
import {
  buscarConvite,
  buscarConviteGrupo,
  confirmarMembroGrupo,
  enviarRsvp,
  type ConviteData,
  type GrupoData,
} from './rsvp';

type Fase = 'carregando' | 'nao-encontrado' | 'form' | 'obrigado' | 'grupo';

const DIA_SEMANA = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' });
const DIA_NUM = new Intl.DateTimeFormat('pt-BR', { day: '2-digit' });
const MES_ANO = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });

/** Página pública e pessoal de RSVP - `/c/:slug`. Sem login, sem cadastro. */
export function GuestPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [fase, setFase] = useState<Fase>('carregando');
  const [convite, setConvite] = useState<ConviteData | null>(null);
  const [grupo, setGrupo] = useState<GrupoData | null>(null);
  const [respostaFinal, setRespostaFinal] = useState<'confirmado' | 'recusado' | null>(null);

  useEffect(() => {
    let ativo = true;
    buscarConvite(slug).then(async (data) => {
      if (!ativo) return;
      if (data) {
        setConvite(data);
        setFase('form');
        return;
      }
      // não é um convite individual/família por vagas — tenta como grupo de família
      const g = await buscarConviteGrupo(slug);
      if (!ativo) return;
      if (!g) {
        setFase('nao-encontrado');
        return;
      }
      setGrupo(g);
      setFase('grupo');
    });
    return () => {
      ativo = false;
    };
  }, [slug]);

  if (fase === 'carregando') {
    return (
      <PaginaConvite>
        <p style={{ textAlign: 'center', fontFamily: 'var(--serif)', color: '#9c7a4a' }}>
          Carregando seu convite…
        </p>
      </PaginaConvite>
    );
  }

  if (fase === 'grupo' && grupo) {
    return <GrupoPagina slug={slug} grupo={grupo} onAtualizar={setGrupo} />;
  }

  if (fase === 'nao-encontrado') {
    return (
      <PaginaConvite>
        <div className="convite-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32 }}>🌸</div>
          <h3 style={{ marginTop: 10 }}>Convite não encontrado</h3>
          <p className="sub">
            Esse link não corresponde a nenhum convite. Confira se copiou o endereço certinho, ou
            fale com a Carol.
          </p>
        </div>
      </PaginaConvite>
    );
  }

  if (fase === 'obrigado' && convite) {
    return (
      <PaginaConvite>
        <div className="convite-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32 }}>{respostaFinal === 'confirmado' ? '🎉' : '💌'}</div>
          <h3 style={{ marginTop: 10 }}>
            {respostaFinal === 'confirmado' ? 'Presença confirmada!' : 'Resposta registrada'}
          </h3>
          <p className="sub">
            {respostaFinal === 'confirmado'
              ? `Que alegria, ${convite.nome}! Nos vemos lá ✨`
              : `Obrigada por avisar, ${convite.nome}. Você vai fazer falta :(`}
          </p>
        </div>
        {respostaFinal === 'confirmado' ? <SecaoPresente /> : null}
      </PaginaConvite>
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

/** Casca comum da página: fundo rosa+dourado com laços/confete nos cantos. */
function PaginaConvite({ children }: { children: React.ReactNode }) {
  return (
    <div className="convite-page">
      <ConviteFundo />
      <div className="convite-wrap">{children}</div>
      <Toast />
    </div>
  );
}

function Hero() {
  const data = new Date(CONVITE_INFO.dataHora);
  const diaSemana = DIA_SEMANA.format(data);
  return (
    <div className="convite-hero">
      <TituloArco texto={CONVITE_INFO.nomeEvento.toUpperCase()} />
      <DiplomaIlustracao />
      <div className="convite-date">
        <div>
          <div className="dia-semana">{diaSemana}</div>
          <div className="num">{DIA_NUM.format(data)}</div>
        </div>
        <div className="info">
          {MES_ANO.format(data)}
          <br />
          às {horaCurta(CONVITE_INFO.dataHora)} horas
        </div>
      </div>
      <p className="convite-frase">
        Com o coração cheio de gratidão, convido você a celebrar esse momento comigo, no{' '}
        {CONVITE_INFO.local}.
      </p>
      <div className="convite-acoes">
        <a className="convite-acao" href={linkComoChegar()} target="_blank" rel="noopener noreferrer">
          <IconeMapa />
          <span>Ver endereço no mapa</span>
        </a>
        <a
          className="convite-acao"
          href={linkSalvarNaAgenda()}
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconeCalendario />
          <span>Adicionar à agenda</span>
        </a>
      </div>
      <div className="convite-pill">
        Janta, bebidas não alcoólicas e chopp por conta da formanda.
      </div>
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
  const ehFamilia = convite.vagas != null;
  const precisaFaixaGenero = !ehFamilia && convite.genero === '';
  const [faixa, setFaixa] = useState<Faixa>(convite.faixa);
  const [genero, setGenero] = useState<Genero>(convite.genero);
  const [qtd, setQtd] = useState(convite.confirmadosQtd ?? convite.vagas ?? 0);
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
      ehFamilia ? qtd : undefined,
    );
    setEnviando(null);
    if (ok) {
      onEnviado(status);
      onFaseObrigado();
    } else {
      toast('Não deu pra enviar agora - tenta de novo em instantes.');
    }
  };

  const confirmarFamilia = async () => {
    setEnviando('confirmado');
    const ok = await enviarRsvp(slug, qtd > 0 ? 'confirmado' : 'recusado', undefined, undefined, qtd);
    setEnviando(null);
    if (ok) {
      onEnviado(qtd > 0 ? 'confirmado' : 'recusado');
      onFaseObrigado();
    } else {
      toast('Não deu pra enviar agora - tenta de novo em instantes.');
    }
  };

  return (
    <PaginaConvite>
      <Hero />

      {jaRespondeu && !mudarResposta ? (
        <div className="convite-card" style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontFamily: 'var(--sans)' }}>
            {ehFamilia ? (
              <>
                Vocês já responderam:{' '}
                <b>
                  {convite.confirmadosQtd ?? 0} de {convite.vagas} confirmaram
                </b>
              </>
            ) : (
              <>
                Você já respondeu:{' '}
                <b>{convite.status === 'confirmado' ? 'vai à festa 🎉' : 'não vai poder ir'}</b>
              </>
            )}
          </p>
          <button
            type="button"
            className="convite-btn ghost sm"
            style={{ marginTop: 10 }}
            onClick={() => setMudarResposta(true)}
          >
            Mudar resposta
          </button>
        </div>
      ) : ehFamilia ? (
        <div className="convite-card">
          <h3>Quantos de vocês vêm?</h3>
          <p className="sub">
            Essa família tem {convite.vagas} vaga{convite.vagas === 1 ? '' : 's'}. Escolha quantos
            vão de fato.
          </p>
          <select className="convite-select" value={qtd} onChange={(e) => setQtd(Number(e.target.value))}>
            {Array.from({ length: (convite.vagas ?? 0) + 1 }, (_, i) => i).map((n) => (
              <option key={n} value={n}>
                {n} de {convite.vagas}
              </option>
            ))}
          </select>
          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              className="convite-btn"
              disabled={enviando !== null}
              onClick={() => void confirmarFamilia()}
            >
              {enviando ? 'Enviando…' : 'Confirmar'}
            </button>
          </div>
        </div>
      ) : (
        <div className="convite-card">
          <h3>Você vem?</h3>
          {precisaFaixaGenero ? (
            <div style={{ display: 'flex', gap: 10, marginTop: 10, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label className="sub" style={{ display: 'block', margin: '0 0 4px' }}>
                  Faixa etária
                </label>
                <select
                  className="convite-select"
                  style={{ width: '100%' }}
                  value={faixa}
                  onChange={(e) => setFaixa(e.target.value as Faixa)}
                >
                  <option value="adulto">Adulto</option>
                  <option value="crianca">Criança</option>
                  <option value="adolescente">Adolescente</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="sub" style={{ display: 'block', margin: '0 0 4px' }}>
                  Gênero
                </label>
                <select
                  className="convite-select"
                  style={{ width: '100%' }}
                  value={genero}
                  onChange={(e) => setGenero(e.target.value as Genero)}
                >
                  <option value="">Selecione</option>
                  <option value="F">Feminino</option>
                  <option value="M">Masculino</option>
                </select>
              </div>
            </div>
          ) : null}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              type="button"
              className="convite-btn"
              disabled={enviando !== null}
              onClick={() => void responder('confirmado')}
            >
              {enviando === 'confirmado' ? 'Enviando…' : '✓ Vou sim!'}
            </button>
            <button
              type="button"
              className="convite-btn ghost"
              disabled={enviando !== null}
              onClick={() => void responder('recusado')}
            >
              {enviando === 'recusado' ? 'Enviando…' : 'Não vou poder ir'}
            </button>
          </div>
        </div>
      )}

      <SecaoPresente />
    </PaginaConvite>
  );
}

/**
 * Página de um GRUPO de família (convidados já cadastrados individualmente,
 * agrupados sob um link compartilhado). Mostra cada pessoa pelo nome; cada
 * uma confirma/recusa por conta própria.
 */
function GrupoPagina({
  slug,
  grupo,
  onAtualizar,
}: {
  slug: string;
  grupo: GrupoData;
  onAtualizar: (g: GrupoData) => void;
}) {
  const [enviando, setEnviando] = useState<string | null>(null);

  const responderMembro = async (membroSlug: string, status: 'confirmado' | 'recusado') => {
    setEnviando(membroSlug);
    const ok = await confirmarMembroGrupo(slug, membroSlug, status);
    setEnviando(null);
    if (ok) {
      onAtualizar({
        ...grupo,
        membros: grupo.membros.map((m) => (m.slug === membroSlug ? { ...m, status } : m)),
      });
      toast('Resposta salva!');
    } else {
      toast('Não deu pra salvar agora - tenta de novo.');
    }
  };

  const confirmados = grupo.membros.filter((m) => m.status === 'confirmado').length;

  return (
    <PaginaConvite>
      <Hero />
      <div className="convite-card">
        <h3>
          Quem vem?{' '}
          <span className="convite-pill" style={{ marginTop: 0, verticalAlign: 'middle' }}>
            {confirmados}/{grupo.membros.length}
          </span>
        </h3>
        <p className="sub">Cada pessoa confirma por conta própria — pode mudar quando quiser.</p>
        <div>
          {grupo.membros.map((m) => (
            <div className="convite-membro" key={m.slug}>
              <span className="nome">{m.nome}</span>
              <button
                type="button"
                className="convite-btn sm"
                style={m.status !== 'confirmado' ? { background: '#e9e2d8', color: '#5a3d2b' } : undefined}
                disabled={enviando === m.slug}
                onClick={() => void responderMembro(m.slug, 'confirmado')}
              >
                {enviando === m.slug ? '…' : 'Vou'}
              </button>
              <button
                type="button"
                className="convite-btn ghost sm"
                disabled={enviando === m.slug}
                onClick={() => void responderMembro(m.slug, 'recusado')}
              >
                {enviando === m.slug ? '…' : 'Não vou'}
              </button>
            </div>
          ))}
        </div>
      </div>
      <SecaoPresente />
    </PaginaConvite>
  );
}

/** Bloco de sugestões de presente / chave PIX, cada um revelado só ao clicar. */
function SecaoPresente() {
  const { pix } = CONVITE_INFO;
  const [verSugestoes, setVerSugestoes] = useState(false);
  const [verPix, setVerPix] = useState(false);

  const categorias = Object.keys(CATEGORIAS_PRESENTE) as CategoriaPresente[];

  return (
    <div className="convite-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src="/presente-icone.png" alt="" style={{ width: 26, height: 26 }} />
        <p style={{ margin: 0, fontFamily: 'var(--sans)', fontWeight: 700 }}>
          Deseja dar algum presente?
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
        <button type="button" className="convite-btn ghost sm" onClick={() => setVerSugestoes((v) => !v)}>
          {verSugestoes ? 'Ocultar sugestões' : 'Clique aqui pra ver sugestões'}
        </button>
        <button type="button" className="convite-btn ghost sm" onClick={() => setVerPix((v) => !v)}>
          {verPix ? 'Ocultar chave PIX' : 'Clique aqui para ver a chave PIX'}
        </button>
      </div>

      {verSugestoes ? (
        <div style={{ marginTop: 14 }}>
          <p style={{ fontFamily: 'var(--serif)', color: 'var(--cv-gold)', fontSize: 15, margin: '0 0 8px' }}>
            {TITULO_PREFERENCIAS}
          </p>
          <ul style={{ fontSize: 13.5, color: 'var(--cv-ink)', paddingLeft: 18, margin: 0 }}>
            {PREFERENCIAS_BASICAS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>

          {SUGESTOES_PRESENTE.length ? (
            <div style={{ marginTop: 18 }}>
              <h4 style={{ fontSize: 14, margin: '0 0 4px', color: 'var(--cv-gold)' }}>
                💭 Exemplos do gosto da Carol
              </h4>
              <p className="sub" style={{ margin: '0 0 10px' }}>
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
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <span className="convite-pill" style={{ marginTop: 0 }}>
                {pix.tipo}: {pix.chave}
              </span>
              <button
                type="button"
                className="convite-btn ghost sm"
                onClick={() => {
                  void navigator.clipboard.writeText(pix.chave);
                  toast('Chave PIX copiada!');
                }}
              >
                Copiar chave
              </button>
            </div>
          ) : (
            <p className="sub">Chave PIX ainda não cadastrada.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
