import type { ReactNode } from 'react';
import { dataPorExtenso, horaCurta } from '../../lib/format';
import { guestMetrics } from '../../store/selectors';
import { useStore } from '../../store/useStore';
import type { Convidado } from '../../types';
import { usePrintTargetStore } from './printTargetStore';

const faixaLabel = (g: Convidado) =>
  g.faixa === 'crianca' ? 'Criança' : g.faixa === 'adolescente' ? 'Adolescente' : 'Adulto';
const generoLabel = (g: Convidado) =>
  g.genero === 'F' ? 'Feminino' : g.genero === 'M' ? 'Masculino' : '-';
const statusLabel = (g: Convidado) =>
  g.status === 'confirmado' ? 'Confirmado' : g.status === 'recusado' ? 'Recusou' : 'Pendente';

interface GuestListPrintableProps {
  eyebrow: string;
  titulo: string;
  subtitulo: string;
  /** Linha de local/data - omitida quando não há informação de evento a mostrar. */
  meta?: ReactNode;
  convidados: Convidado[];
}

/** Marcação pura da folha de impressão - sem depender de qual evento é. */
function GuestListPrintable({ eyebrow, titulo, subtitulo, meta, convidados }: GuestListPrintableProps) {
  const gm = guestMetrics(convidados);
  const ordenados = [...convidados].sort((a, b) =>
    (a.nome || '').localeCompare(b.nome || '', 'pt-BR'),
  );
  const agora = new Date();

  const tile = (n: number, l: string) => (
    <div className="ps" key={l}>
      <b>{n}</b>
      <span>{l}</span>
    </div>
  );

  return (
    <div id="print-guests">
      <div className="print-header">
        <div className="print-eyebrow">{eyebrow}</div>
        <h1>Lista de Convidados</h1>
        <div className="print-sub">{subtitulo}</div>
        {meta ? <div className="print-meta">{meta}</div> : null}
      </div>

      <div className="print-summary">
        {tile(gm.total, 'Convidados')}
        {tile(gm.confirmados, 'Confirmados')}
        {tile(gm.pendentes, 'Pendentes')}
        {tile(gm.recusados, 'Recusaram')}
      </div>
      <div className="print-summary">
        {tile(gm.criancas, 'Crianças')}
        {tile(gm.adolescentes, 'Adolescentes')}
        {tile(gm.homens, 'Homens')}
        {tile(gm.mulheres, 'Mulheres')}
      </div>

      <table className="print-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nome</th>
            <th>Grupo</th>
            <th>Faixa</th>
            <th>Gênero</th>
            <th>Status</th>
            <th>Convite</th>
            <th>Bebe</th>
          </tr>
        </thead>
        <tbody>
          {ordenados.length ? (
            ordenados.map((g, i) => (
              <tr key={g.id}>
                <td>{i + 1}</td>
                <td>{g.nome || '-'}</td>
                <td>{g.grupo || '-'}</td>
                <td>{faixaLabel(g)}</td>
                <td>{generoLabel(g)}</td>
                <td>{statusLabel(g)}</td>
                <td>{g.conviteEnviado ? 'Sim' : 'Não'}</td>
                <td>{g.faixa !== 'adulto' ? '-' : g.bebe ? 'Sim' : 'Não'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', color: '#a08a78' }}>
                Nenhum convidado cadastrado ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="print-footer">
        {titulo} · Gerado em {agora.toLocaleDateString('pt-BR')} às{' '}
        {agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · {gm.total}{' '}
        convidados no total
      </div>
    </div>
  );
}

/**
 * Fica sempre montada mas invisível na tela - só o `@media print` a revela,
 * então `window.print()` ("Salvar como PDF") gera o documento pronto pra
 * cerimonialista. Mostra a lista da festa ou da colação de acordo com o
 * `printTargetStore`, setado por `imprimirListaConvidados()`.
 */
export function PrintGuestList() {
  const target = usePrintTargetStore((s) => s.target);
  const festa = useStore((s) => s.festa);
  const convidadosFesta = useStore((s) => s.convidados);
  const convidadosColacao = useStore((s) => s.convidadosColacao);

  if (target === 'colacao') {
    return (
      <GuestListPrintable
        eyebrow="Janta de formatura"
        titulo="Colação de Grau"
        subtitulo="Colação de grau de Carol - Ciência da Computação"
        convidados={convidadosColacao}
      />
    );
  }

  const data = dataPorExtenso(festa.dataHora);
  const hora = horaCurta(festa.dataHora);
  const meta = (
    <>
      📍 {festa.local} - {festa.endereco}
      {data ? (
        <>
          <br />
          🗓️ {data}, {hora}
        </>
      ) : null}
    </>
  );

  return (
    <GuestListPrintable
      eyebrow="Janta de formatura"
      titulo="Formatura"
      subtitulo="Formatura de Carol - Ciência da Computação"
      meta={meta}
      convidados={convidadosFesta}
    />
  );
}
