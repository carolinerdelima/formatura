import { useMemo, useState } from 'react';
import { ChecklistBlock } from '../../components/ChecklistBlock';
import { ComprasBlock } from '../../components/ComprasBlock';
import { Card, CardTitle, Chip, PillToggle, ViewHead } from '../../components/ui';
import { toast } from '../../components/toastStore';
import { guestMetrics } from '../../store/selectors';
import { useStore } from '../../store/useStore';

export function Bebida() {
  const litros = useStore((s) => s.bebida.choppLitros);
  const setChopp = useStore((s) => s.setChopp);
  const convidados = useStore((s) => s.convidados);

  const gm = guestMetrics(convidados);
  const base = gm.consumidores || 80;
  const sugMin = Math.round(base * 1.2);
  const sugMax = Math.round(base * 2);

  return (
    <>
      <ViewHead
        eyebrow="Bebida"
        title="🍹 Bebida"
        desc="Drinks e chopp são por conta da casa. Sua única definição obrigatória: quantos litros de chopp liberar."
      />

      <Card>
        <CardTitle ic="🍺" aside={<Chip>{litros == null ? '⚠️ a definir' : 'definido'}</Chip>}>
          Chopp liberado
        </CardTitle>
        <p className="card-sub">
          Baseado em <b>{base}</b> possíveis consumidores de álcool (confirmados que bebem, ou
          estimativa de 80): entre <b>{sugMin} L</b> e <b>{sugMax} L</b>.{' '}
          {gm.menoresConfirmados ? (
            <span style={{ color: 'var(--terracota)' }}>
              {gm.menoresConfirmados} menor(es) e {gm.naoBebem} que não bebe(m) já fora da conta.
            </span>
          ) : gm.naoBebem ? (
            <span style={{ color: 'var(--terracota)' }}>
              {gm.naoBebem} que não bebe(m) já fora da conta.
            </span>
          ) : null}
        </p>

        <div className="row">
          <div className="fit" style={{ minWidth: 180 }}>
            <label className="fld">Litros de chopp</label>
            <input
              type="number"
              min={0}
              step={10}
              value={litros ?? ''}
              placeholder="ex.: 120"
              onChange={(e) => setChopp(e.target.value === '' ? null : Number(e.target.value))}
            />
          </div>
          <div className="fit">
            <button
              type="button"
              className="btn soft sm"
              onClick={() => {
                setChopp(sugMin);
                toast('Chopp definido');
              }}
            >
              Usar {sugMin} L
            </button>
          </div>
          <div className="fit">
            <button
              type="button"
              className="btn soft sm"
              onClick={() => {
                setChopp(sugMax);
                toast('Chopp definido');
              }}
            >
              Usar {sugMax} L
            </button>
          </div>
        </div>
      </Card>

      <QuemBebeCard />

      <div className="grid two" style={{ marginTop: 18 }}>
        <ChecklistBlock cat="bebida" />
        <ComprasBlock cat="bebida" />
      </div>
    </>
  );
}

/** Card interativo "Quem bebe" — só adultos não-recusados aparecem. */
function QuemBebeCard() {
  const convidados = useStore((s) => s.convidados);
  const toggleBebe = useStore((s) => s.toggleBebe);
  const [busca, setBusca] = useState('');

  const guests = useMemo(
    () => convidados.filter((g) => g.faixa === 'adulto' && g.status !== 'recusado'),
    [convidados],
  );
  const bebem = guests.filter((g) => g.bebe).length;
  const nao = guests.length - bebem;

  const q = busca.trim().toLowerCase();
  const visiveis = q ? guests.filter((g) => (g.nome || '').toLowerCase().includes(q)) : guests;

  return (
    <Card style={{ marginTop: 18 }}>
      <CardTitle
        ic="🥂"
        aside={
          <Chip>
            {bebem} bebem · {nao} não
          </Chip>
        }
      >
        Quem bebe
      </CardTitle>
      <p className="card-sub">
        Todos começam como "Bebe". Marque as exceções que você já conhece — menores nem aparecem
        aqui.
      </p>

      {guests.length ? (
        <input
          placeholder="🔎 Buscar convidado…"
          style={{ marginBottom: 8 }}
          autoComplete="off"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      ) : null}

      <div className="bebe-scroll">
        {guests.length ? (
          visiveis.map((g) => (
            <div className="bebe-row" key={g.id}>
              <span className="bn">{g.nome || '(sem nome)'}</span>
              <span className={`badge ${g.status === 'confirmado' ? 'conf' : 'pend'}`}>
                {g.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
              </span>
              <PillToggle
                on={g.bebe}
                onLabel="Bebe"
                offLabel="Não bebe"
                variantOff="minor"
                onClick={() => toggleBebe(g.id)}
              />
            </div>
          ))
        ) : (
          <div className="empty">
            Cadastre convidados na aba <b>Convidados</b> para marcar quem bebe. Menores já ficam de
            fora.
          </div>
        )}
        {guests.length && !visiveis.length ? (
          <div className="empty">Nenhum convidado encontrado.</div>
        ) : null}
      </div>
    </Card>
  );
}
