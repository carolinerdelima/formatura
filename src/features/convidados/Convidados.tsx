import { useMemo, useState } from 'react';
import { Card, CardTitle, Chip, IconButton, Note, Stat, ViewHead } from '../../components/ui';
import { toast } from '../../components/toastStore';
import { guestMetrics } from '../../store/selectors';
import { useStore } from '../../store/useStore';
import { GuestRow } from './GuestRow';
import { imprimirListaConvidados } from './imprimir';

export function Convidados() {
  const convidados = useStore((s) => s.convidados);
  const addConvidado = useStore((s) => s.addConvidado);
  const addFamilia = useStore((s) => s.addFamilia);
  const editConvidado = useStore((s) => s.editConvidado);
  const toggleConvite = useStore((s) => s.toggleConvite);
  const toggleBebe = useStore((s) => s.toggleBebe);
  const toggleProvavel = useStore((s) => s.toggleProvavel);
  const removeConvidado = useStore((s) => s.removeConvidado);
  const agruparEmFamilia = useStore((s) => s.agruparEmFamilia);
  const desagruparFamilia = useStore((s) => s.desagruparFamilia);
  const gm = guestMetrics(convidados);

  const familias = convidados.filter((g) => g.vagas != null);
  const familiasVagas = familias.reduce((s, g) => s + (g.vagas ?? 0), 0);
  const familiasConfirmadas = familias.reduce((s, g) => s + (g.confirmadosQtd ?? 0), 0);

  // grupos de convidados individuais já agrupados (familiaGrupoSlug), pra listagem
  const grupos = useMemo(() => {
    const porSlug = new Map<string, { nome: string; membros: typeof convidados }>();
    for (const g of convidados) {
      if (!g.familiaGrupoSlug) continue;
      const atual = porSlug.get(g.familiaGrupoSlug) ?? { nome: g.familiaGrupoNome ?? '', membros: [] };
      atual.membros.push(g);
      porSlug.set(g.familiaGrupoSlug, atual);
    }
    return Array.from(porSlug.entries()).map(([slug, v]) => ({ slug, ...v }));
  }, [convidados]);

  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const toggleSelecionado = (id: string) =>
    setSelecionados((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const [nomeGrupoNovo, setNomeGrupoNovo] = useState('');

  const agrupar = () => {
    const n = nomeGrupoNovo.trim();
    if (!n || selecionados.size < 2) return;
    agruparEmFamilia(Array.from(selecionados), n);
    setSelecionados(new Set());
    setNomeGrupoNovo('');
    toast('Grupo criado!');
  };

  const [nome, setNome] = useState('');
  const [grupo, setGrupo] = useState('');

  const adicionar = () => {
    const n = nome.trim();
    if (!n) return;
    addConvidado(n, grupo.trim());
    setNome('');
    setGrupo('');
  };

  const [nomeFamilia, setNomeFamilia] = useState('');
  const [vagasFamilia, setVagasFamilia] = useState('4');

  const adicionarFamilia = () => {
    const n = nomeFamilia.trim();
    const v = Number(vagasFamilia);
    if (!n || !v || v < 1) return;
    addFamilia(n, v);
    setNomeFamilia('');
    setVagasFamilia('4');
  };

  return (
    <>
      <ViewHead
        eyebrow="Convidados"
        title="👥 Controle de convidados"
        desc="Meta de ~80 convidados. Escolha a faixa etária (Adulto, Criança ou Adolescente) e o gênero de cada um - isso define o perfil das lembrancinhas."
      />

      <div className="stats">
        <Stat n={gm.total} label="Convidados" />
        <Stat n={gm.provaveis} label="Devem vir de fato" color="var(--rosa-antigo)" />
        <Stat n={gm.confirmados} label="Confirmados" color="var(--oliva)" />
        <Stat n={gm.menores} label="Crianças / Adolescentes" color="var(--terracota)" />
        <Stat n={gm.bebedoresConsiderados} label="Bebem álcool (p/ chopp)" color="var(--dourado)" />
        <Stat n={gm.enviados} label={`Convites enviados · ${gm.pendentes} pend.`} />
      </div>

      <div style={{ marginTop: 14 }}>
        <Note>
          O <b>✓/✗</b> ao lado do nome é sua expectativa pessoal de comparecimento - clique para
          marcar quem você acha que não vem, mesmo que ainda esteja pendente. Isso alimenta o
          card <b>Devem vir de fato</b> ali acima, sem depender do status oficial do convite.
          Escolha também a <b>faixa etária</b> e o <b>Gênero</b> de cada convidado; só adultos
          entram na conta de quem bebe, ajuste quem não bebe na aba <b>Bebida</b>.
        </Note>
      </div>

      <Card style={{ marginTop: 18 }}>
        <CardTitle ic="🎀" aside={<Chip>{gm.considerados} no total</Chip>}>
          Perfil para lembrancinhas
        </CardTitle>
        <p className="card-sub">
          Contagem entre todos os convidados que não recusaram (confirmados + pendentes),
          separada por faixa e gênero - use para definir quantas de cada tipo de lembrancinha
          encomendar sem depender de todo mundo já ter confirmado.
        </p>
        <div className="stats">
          <Stat n={gm.criancas} label="Crianças" color="var(--rosa-antigo)" />
          <Stat n={gm.adolescentes} label="Adolescentes" color="var(--terracota)" />
          <Stat n={gm.homens} label="Homens" color="var(--dourado)" />
          <Stat n={gm.mulheres} label="Mulheres" color="var(--dourado)" />
        </div>
        {gm.semGenero ? (
          <div style={{ marginTop: 12 }}>
            <Note>⚠️ {gm.semGenero} convidado(s) sem gênero definido.</Note>
          </div>
        ) : null}
      </Card>

      <Card style={{ marginTop: 18 }}>
        <CardTitle ic="➕">Adicionar convidado</CardTitle>
        <div className="row">
          <div className="grow2">
            <label className="fld">Nome</label>
            <input
              value={nome}
              placeholder="Nome completo"
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') adicionar();
              }}
            />
          </div>
          <div>
            <label className="fld">Grupo</label>
            <input
              value={grupo}
              placeholder="Família, faculdade…"
              onChange={(e) => setGrupo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') adicionar();
              }}
            />
          </div>
          <div className="fit">
            <button type="button" className="btn" onClick={adicionar}>
              Adicionar
            </button>
          </div>
        </div>
      </Card>

      <Card style={{ marginTop: 18 }}>
        <CardTitle
          ic="👪"
          aside={
            familias.length ? (
              <Chip>
                {familiasConfirmadas}/{familiasVagas} vagas confirmadas
              </Chip>
            ) : undefined
          }
        >
          Criar link de família
        </CardTitle>
        <p className="card-sub">
          Pra grupos que você não quer cadastrar pessoa por pessoa: dá um nome, define quantas
          vagas o grupo tem, e gera <b>um link só</b> pra família toda. Quando abrirem, escolhem
          quantos de fato vão (ex: "2 de 4") em vez do fluxo individual de confirmar/recusar.
        </p>
        <div className="row">
          <div className="grow2">
            <label className="fld">Nome da família</label>
            <input
              value={nomeFamilia}
              placeholder="Ex.: Família Silva"
              onChange={(e) => setNomeFamilia(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') adicionarFamilia();
              }}
            />
          </div>
          <div>
            <label className="fld">Vagas</label>
            <input
              type="number"
              min={1}
              value={vagasFamilia}
              onChange={(e) => setVagasFamilia(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') adicionarFamilia();
              }}
            />
          </div>
          <div className="fit">
            <button type="button" className="btn" onClick={adicionarFamilia}>
              Gerar link
            </button>
          </div>
        </div>
      </Card>

      {grupos.length ? (
        <Card style={{ marginTop: 18 }}>
          <CardTitle ic="🔗">Grupos de família agrupados</CardTitle>
          <p className="card-sub">
            Convidados individuais que compartilham um link — cada um mantém seus próprios dados
            (gênero, se bebe), só a confirmação é feita junto.
          </p>
          <div>
            {grupos.map((grp) => (
              <div
                key={grp.slug}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                  padding: '9px 4px',
                  borderBottom: '1px dashed var(--line)',
                }}
              >
                <b style={{ fontSize: 14 }}>👪 {grp.nome}</b>
                <span className="chip">{grp.membros.map((m) => m.nome).join(', ')}</span>
                <span style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                  <IconButton
                    title="Copiar link do grupo"
                    onClick={() => {
                      void navigator.clipboard.writeText(`${window.location.origin}/c/${grp.slug}`);
                      toast('Link copiado!');
                    }}
                  >
                    🔗
                  </IconButton>
                  <IconButton
                    danger
                    title="Desagrupar (cada um volta a ter só o link individual)"
                    onClick={() => desagruparFamilia(grp.slug)}
                  >
                    ✕
                  </IconButton>
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card style={{ marginTop: 18 }}>
        <CardTitle
          ic="📋"
          aside={
            <button
              type="button"
              className="btn sm ghost"
              onClick={() => imprimirListaConvidados('festa')}
            >
              🖨️ Exportar PDF
            </button>
          }
        >
          Lista
        </CardTitle>
        <p className="card-sub">
          Clique para editar direto. O botão "Enviar/Enviado" marca o status do convite. Marque a
          caixinha de dois ou mais convidados pra agrupar num link de família compartilhado. O PDF
          sai formatado na paleta da festa, pronto pra mandar pra cerimonialista.
        </p>

        {selecionados.size >= 1 ? (
          <div className="row" style={{ marginBottom: 12 }}>
            <div className="grow2">
              <label className="fld">Nome do grupo ({selecionados.size} selecionado(s))</label>
              <input
                value={nomeGrupoNovo}
                placeholder="Ex.: Família Silva"
                onChange={(e) => setNomeGrupoNovo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') agrupar();
                }}
              />
            </div>
            <div className="fit">
              <button
                type="button"
                className="btn sm"
                disabled={selecionados.size < 2}
                onClick={agrupar}
                title={selecionados.size < 2 ? 'Selecione pelo menos 2 convidados' : undefined}
              >
                Agrupar selecionados
              </button>
            </div>
          </div>
        ) : null}

        <div>
          {convidados.length ? (
            convidados.map((g) => (
              <GuestRow
                key={g.id}
                g={g}
                onEdit={editConvidado}
                onToggleConvite={toggleConvite}
                onToggleBebe={toggleBebe}
                onToggleProvavel={toggleProvavel}
                onRemove={removeConvidado}
                selecionavel
                selecionado={selecionados.has(g.id)}
                onToggleSelecionado={toggleSelecionado}
                comLinkRsvp
              />
            ))
          ) : (
            <div className="empty">Nenhum convidado ainda. Meta: ~80. Adicione o primeiro acima.</div>
          )}
        </div>
      </Card>
    </>
  );
}
