import { InlineAdd } from '../../components/InlineAdd';
import { ValorInput } from '../../components/ValorInput';
import { Card, CardTitle, IconButton, Note, PillToggle, ViewHead } from '../../components/ui';
import { CATS, ORDEM_PESSOAL } from '../../lib/catalogo';
import { comprasDe } from '../../store/selectors';
import { useStore } from '../../store/useStore';
import type { CategoriaPessoal } from '../../types';

export function Pessoal() {
  return (
    <>
      <ViewHead
        eyebrow="Sobre mim"
        title="🌸 Sobre mim"
        desc="Sua produção para o dia. Guarde inspirações, valores, e marque o que já reservou e já pagou. Tudo entra nos Gastos."
      />

      <Note>
        👗 <b>Vestido dos sonhos:</b> rosa antigo, tecido acetinado fosco, caimento fluido, decote
        elegante, pouco brilho, bem feminino - conversa com toda a paleta.
      </Note>

      <div style={{ marginTop: 18 }} className="grid">
        {ORDEM_PESSOAL.map((cat) => (
          <BlocoPessoal key={cat} cat={cat} />
        ))}
      </div>
    </>
  );
}

function BlocoPessoal({ cat }: { cat: CategoriaPessoal }) {
  const compras = useStore((s) => s.compras);
  const add = useStore((s) => s.addCompra);
  const edit = useStore((s) => s.editCompra);
  const togglePago = useStore((s) => s.toggleCompraPago);
  const toggleReservado = useStore((s) => s.toggleCompraReservado);
  const remove = useStore((s) => s.removeCompra);

  const meta = CATS[cat];
  const list = comprasDe(compras, cat);

  return (
    <Card>
      <CardTitle ic={meta.ic}>{meta.label}</CardTitle>
      <p className="card-sub">Inspirações + valor + se já marcou/reservou + se já pagou.</p>

      <div>
        {list.length ? (
          list.map((c) => (
            <div className="buyrow pessoal" key={c.id}>
              <input
                value={c.nome}
                placeholder="Descrição / ideia"
                onChange={(e) => edit(c.id, 'nome', e.target.value)}
              />
              <input
                value={c.link}
                placeholder="Link de inspiração"
                onChange={(e) => edit(c.id, 'link', e.target.value)}
              />
              <ValorInput valor={c.valor} onChange={(n) => edit(c.id, 'valor', n)} />
              <PillToggle
                on={c.reservado}
                onLabel="Marcado"
                offLabel="A marcar"
                title="Já marcou/reservou?"
                onClick={() => toggleReservado(c.id)}
              />
              <span style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <PillToggle
                  on={c.pago}
                  onLabel="Pago"
                  offLabel="A pagar"
                  onClick={() => togglePago(c.id)}
                />
                {c.link ? (
                  <a
                    className="icon-btn"
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir link"
                  >
                    ↗
                  </a>
                ) : null}
                <IconButton danger title="Remover" onClick={() => remove(c.id)}>
                  🗑
                </IconButton>
              </span>
            </div>
          ))
        ) : (
          <div className="empty">Adicione inspirações, valores e marque quando reservar.</div>
        )}
      </div>

      <InlineAdd
        placeholder={`Nova ideia de ${meta.label.toLowerCase()}…`}
        onAdd={(v) => add(cat, v)}
      />
    </Card>
  );
}
