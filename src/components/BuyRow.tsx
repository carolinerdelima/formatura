import { CATS } from '../lib/catalogo';
import { useStore } from '../store/useStore';
import type { ItemCompra } from '../types';
import { ValorInput } from './ValorInput';
import { Chip, IconButton, PillToggle } from './ui';

/** Uma linha editável de compra/gasto. */
export function BuyRow({ item, showCat = false }: { item: ItemCompra; showCat?: boolean }) {
  const edit = useStore((s) => s.editCompra);
  const togglePago = useStore((s) => s.toggleCompraPago);
  const remove = useStore((s) => s.removeCompra);

  return (
    <div className="buyrow">
      <input
        value={item.nome}
        placeholder="Descrição"
        onChange={(e) => edit(item.id, 'nome', e.target.value)}
      />
      <ValorInput valor={item.valor} onChange={(n) => edit(item.id, 'valor', n)} />
      <PillToggle
        on={item.pago}
        onLabel="Pago"
        offLabel="A pagar"
        onClick={() => togglePago(item.id)}
      />
      <IconButton danger title="Remover" onClick={() => remove(item.id)}>
        🗑
      </IconButton>
      {showCat ? (
        <div style={{ gridColumn: '1/-1', marginTop: -4 }}>
          <Chip>
            {CATS[item.categoria].ic} {CATS[item.categoria].label}
          </Chip>
        </div>
      ) : null}
    </div>
  );
}
