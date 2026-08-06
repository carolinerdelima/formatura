import { IconButton, PillToggle } from '../../components/ui';
import type { Convidado, Faixa, Genero, StatusConvidado } from '../../types';

interface GuestRowProps {
  g: Convidado;
  onEdit: <K extends keyof Convidado>(id: string, campo: K, valor: Convidado[K]) => void;
  onToggleConvite: (id: string) => void;
  onToggleBebe: (id: string) => void;
  onToggleProvavel: (id: string) => void;
  onRemove: (id: string) => void;
}

/** Linha de convidado editável — compartilhada entre a festa e a colação. */
export function GuestRow({
  g,
  onEdit,
  onToggleConvite,
  onToggleBebe,
  onToggleProvavel,
  onRemove,
}: GuestRowProps) {
  const faixaClass =
    g.faixa === 'crianca' ? 'is-crianca' : g.faixa === 'adolescente' ? 'is-adol' : '';
  const vem = g.provavel !== false;

  return (
    <div className="guest-card">
      <button
        type="button"
        className={`provavel-badge ${vem ? 'sim' : 'nao'}`}
        title={vem ? 'Acho que vem — clique para marcar que acha que NÃO vem' : 'Acho que NÃO vem — clique para marcar que acha que vem'}
        onClick={() => onToggleProvavel(g.id)}
      >
        {vem ? '✓' : '✗'}
      </button>
      <input
        className="f-nome"
        value={g.nome}
        placeholder="Nome"
        onChange={(e) => onEdit(g.id, 'nome', e.target.value)}
      />
      <input
        className="f-grupo"
        value={g.grupo}
        placeholder="Grupo"
        onChange={(e) => onEdit(g.id, 'grupo', e.target.value)}
      />

      <select
        className="f-genero"
        title="Gênero"
        value={g.genero}
        onChange={(e) => onEdit(g.id, 'genero', e.target.value as Genero)}
      >
        <option value="">Gênero</option>
        <option value="F">Feminino</option>
        <option value="M">Masculino</option>
      </select>

      <select
        className={`f-faixa ${faixaClass}`.trim()}
        title="Faixa etária"
        value={g.faixa}
        onChange={(e) => onEdit(g.id, 'faixa', e.target.value as Faixa)}
      >
        <option value="adulto">Adulto</option>
        <option value="crianca">Criança</option>
        <option value="adolescente">Adolescente</option>
      </select>

      {g.faixa === 'adulto' ? (
        <PillToggle
          on={g.bebe}
          onLabel="Bebe"
          offLabel="Não bebe"
          variantOff="minor"
          title="Bebe álcool? (entra na conta do chopp)"
          onClick={() => onToggleBebe(g.id)}
        />
      ) : null}

      {g.faixa !== 'adulto' ? (
        <input
          className="f-idade"
          type="number"
          min={0}
          max={17}
          value={g.idade ?? ''}
          placeholder="anos"
          title="Idade (opcional)"
          onChange={(e) =>
            onEdit(g.id, 'idade', e.target.value === '' ? null : Number(e.target.value))
          }
        />
      ) : null}

      <select
        className="f-status"
        value={g.status}
        onChange={(e) => onEdit(g.id, 'status', e.target.value as StatusConvidado)}
      >
        <option value="pendente">Pendente</option>
        <option value="confirmado">Confirmado</option>
        <option value="recusado">Recusou</option>
      </select>

      <PillToggle
        on={g.conviteEnviado}
        onLabel="Enviado"
        offLabel="Enviar"
        title="Convite enviado?"
        onClick={() => onToggleConvite(g.id)}
      />
      <IconButton danger title="Remover convidado" onClick={() => onRemove(g.id)}>
        🗑
      </IconButton>
    </div>
  );
}
