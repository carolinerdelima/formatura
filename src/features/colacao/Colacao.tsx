import { useState } from 'react';
import { Card, CardTitle, Chip, Note, Stat, ViewHead } from '../../components/ui';
import { GuestRow } from '../convidados/GuestRow';
import { imprimirListaConvidados } from '../convidados/imprimir';
import { guestMetrics } from '../../store/selectors';
import { useStore } from '../../store/useStore';

/**
 * Convidados da colação de grau — evento separado da festa, em outro dia.
 * Lista própria (`convidadosColacao`), independente da lista da festa.
 */
export function Colacao() {
  const convidados = useStore((s) => s.convidadosColacao);
  const addConvidado = useStore((s) => s.addConvidadoColacao);
  const editConvidado = useStore((s) => s.editConvidadoColacao);
  const toggleConvite = useStore((s) => s.toggleConviteColacao);
  const toggleBebe = useStore((s) => s.toggleBebeColacao);
  const toggleProvavel = useStore((s) => s.toggleProvavelColacao);
  const removeConvidado = useStore((s) => s.removeConvidadoColacao);
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
        eyebrow="Colação de Grau"
        title="🎓 Convidados da colação"
        desc="Lista separada da festa — a colação é em outro dia. Escolha a faixa etária (Adulto, Criança ou Adolescente) e o gênero de cada um."
      />

      <div className="stats">
        <Stat n={gm.total} label="Convidados" />
        <Stat n={gm.provaveis} label="Devem vir de fato" color="var(--rosa-antigo)" />
        <Stat n={gm.confirmados} label="Confirmados" color="var(--oliva)" />
        <Stat n={gm.menores} label="Crianças / Adolescentes" color="var(--terracota)" />
        <Stat n={gm.enviados} label={`Convites enviados · ${gm.pendentes} pend.`} />
      </div>

      <div style={{ marginTop: 14 }}>
        <Note>
          O <b>✓/✗</b> ao lado do nome é sua expectativa pessoal de comparecimento — clique para
          marcar quem você acha que não vem, mesmo que ainda esteja pendente. Isso alimenta o card{' '}
          <b>Devem vir de fato</b> ali acima. Esta lista é independente da aba{' '}
          <b>Convidados</b> da festa — pode ter pessoas repetidas ou totalmente diferentes, cada
          evento com sua própria lista.
        </Note>
      </div>

      <Card style={{ marginTop: 18 }}>
        <CardTitle ic="🎀" aside={<Chip>{gm.considerados} no total</Chip>}>
          Perfil por faixa e gênero
        </CardTitle>
        <p className="card-sub">
          Contagem entre todos os convidados que não recusaram (confirmados + pendentes),
          separada por faixa e gênero.
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
              onClick={() => imprimirListaConvidados('colacao')}
            >
              🖨️ Exportar PDF
            </button>
          }
        >
          Lista
        </CardTitle>
        <p className="card-sub">
          Clique para editar direto. O botão "Enviar/Enviado" marca o status do convite.
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
              />
            ))
          ) : (
            <div className="empty">
              Nenhum convidado da colação ainda. Adicione o primeiro acima.
            </div>
          )}
        </div>
      </Card>
    </>
  );
}
