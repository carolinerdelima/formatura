import { useState } from 'react';
import { Card, CardTitle, Chip, Note, Stat, ViewHead } from '../../components/ui';
import { guestMetrics } from '../../store/selectors';
import { useStore } from '../../store/useStore';
import { GuestRow } from './GuestRow';
import { imprimirListaConvidados } from './imprimir';

export function Convidados() {
  const convidados = useStore((s) => s.convidados);
  const addConvidado = useStore((s) => s.addConvidado);
  const editConvidado = useStore((s) => s.editConvidado);
  const toggleConvite = useStore((s) => s.toggleConvite);
  const toggleBebe = useStore((s) => s.toggleBebe);
  const toggleProvavel = useStore((s) => s.toggleProvavel);
  const removeConvidado = useStore((s) => s.removeConvidado);
  const gm = guestMetrics(convidados);

  const [nome, setNome] = useState('');
  const [grupo, setGrupo] = useState('');

  const adicionar = () => {
    const n = nome.trim();
    if (!n) return;
    addConvidado(n, grupo.trim());
    setNome('');
    setGrupo('');
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
          Clique para editar direto. O botão "Enviar/Enviado" marca o status do convite. O PDF sai
          formatado na paleta da festa, pronto pra mandar pra cerimonialista.
        </p>
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
