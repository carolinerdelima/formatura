import { brl } from '../lib/format';
import { comprasDe, pagoDe, totalDe } from '../store/selectors';
import { useStore } from '../store/useStore';
import type { Categoria } from '../types';
import { BuyRow } from './BuyRow';
import { InlineAdd } from './InlineAdd';
import { Card, CardTitle, Chip } from './ui';

/** Bloco "coisas a comprar" — tudo com valor alimenta a aba Gastos. */
export function ComprasBlock({ cat }: { cat: Categoria }) {
  const compras = useStore((s) => s.compras);
  const add = useStore((s) => s.addCompra);

  const list = comprasDe(compras, cat);
  const t = totalDe(list);
  const p = pagoDe(list);

  return (
    <Card>
      <CardTitle ic="🛒">Coisas a comprar</CardTitle>
      <p className="card-sub">
        Tudo com valor aqui aparece automaticamente na aba <b>Gastos</b>.
      </p>

      <div className="buylist">
        {list.length ? (
          list.map((c) => <BuyRow key={c.id} item={c} />)
        ) : (
          <div className="empty">Nada para comprar aqui ainda.</div>
        )}
      </div>

      <div className="chiprow">
        <Chip>
          Orçado: <b>{brl(t)}</b>
        </Chip>
        <Chip>
          Pago: <b>{brl(p)}</b>
        </Chip>
        <Chip>
          Falta: <b>{brl(t - p)}</b>
        </Chip>
      </div>

      <InlineAdd placeholder="Item a comprar…" onAdd={(v) => add(cat, v)} />
    </Card>
  );
}
