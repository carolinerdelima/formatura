import { useState } from 'react';
import { BuyRow } from '../../components/BuyRow';
import { Card, CardTitle, Chip, Note, Stat, ViewHead } from '../../components/ui';
import { CATS } from '../../lib/catalogo';
import { parseValor } from '../../lib/format';
import { brl } from '../../lib/format';
import { comprasDe, pagoDe, totalDe } from '../../store/selectors';
import { useStore } from '../../store/useStore';
import { CATEGORIAS, type Categoria } from '../../types';

export function Gastos() {
  const compras = useStore((s) => s.compras);
  const add = useStore((s) => s.addCompra);

  const orc = totalDe(compras);
  const pago = pagoDe(compras);
  const falta = orc - pago;
  const pct = orc ? Math.round((pago / orc) * 100) : 0;

  const cats = CATEGORIAS.filter((c) => comprasDe(compras, c).length);

  const [nome, setNome] = useState('');
  const [cat, setCat] = useState<Categoria>('comida');
  const [valor, setValor] = useState('');

  const adicionar = () => {
    const n = nome.trim();
    if (!n) return;
    add(cat, n, parseValor(valor));
    setNome('');
    setValor('');
  };

  return (
    <>
      <ViewHead
        eyebrow="Gastos"
        title="💰 Controle de gastos"
        desc="Consolidado automático de tudo que tem valor em todas as abas. Marque como pago aqui ou na aba de origem - é o mesmo dado."
      />

      <div className="stats">
        <Stat n={brl(orc)} label="Orçamento total" />
        <Stat n={brl(pago)} label={`Já pago (${pct}%)`} color="var(--oliva)" pct={pct} />
        <Stat n={brl(falta)} label="Falta pagar" color="var(--terracota)" />
        <Stat n={compras.length} label="Itens no orçamento" />
      </div>

      {compras.length ? (
        <div style={{ marginTop: 18 }}>
          {cats.map((c) => {
            const list = comprasDe(compras, c);
            const t = totalDe(list);
            const p = pagoDe(list);
            return (
              <Card key={c}>
                <CardTitle ic={CATS[c].ic} aside={<Chip>{brl(t)}</Chip>}>
                  {CATS[c].label}
                </CardTitle>
                <p className="card-sub">
                  Pago {brl(p)} · Falta {brl(t - p)}
                </p>
                <div className="buylist">
                  {list.map((item) => (
                    <BuyRow key={item.id} item={item} />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div style={{ marginTop: 18 }}>
          <Note>
            Ainda não há itens com valor. Adicione "coisas a comprar" nas abas (Comida, Bebida,
            Decoração, Música, Papelaria) ou ideias na aba "Sobre mim" que aparecem aqui.
          </Note>
        </div>
      )}

      <Card style={{ marginTop: 18 }}>
        <CardTitle ic="➕">Adicionar gasto avulso</CardTitle>
        <div className="row">
          <div className="grow2">
            <label className="fld">Descrição</label>
            <input
              value={nome}
              placeholder="Ex.: som, aluguel de peça…"
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') adicionar();
              }}
            />
          </div>
          <div>
            <label className="fld">Categoria</label>
            <select value={cat} onChange={(e) => setCat(e.target.value as Categoria)}>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {CATS[c].ic} {CATS[c].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="fld">Valor</label>
            <input
              value={valor}
              placeholder="R$ 0,00"
              onChange={(e) => setValor(e.target.value)}
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
    </>
  );
}
