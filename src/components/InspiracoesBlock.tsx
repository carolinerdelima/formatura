import { useStore } from '../store/useStore';
import type { CategoriaInspiracao } from '../types';
import { InlineAdd } from './InlineAdd';
import { Card, CardTitle, IconButton } from './ui';

/** Bloco de inspirações (links/referências) por categoria. */
export function InspiracoesBlock({ cat }: { cat: CategoriaInspiracao }) {
  const list = useStore((s) => s.inspiracoes[cat]);
  const add = useStore((s) => s.addInspiracao);
  const edit = useStore((s) => s.editInspiracao);
  const remove = useStore((s) => s.removeInspiracao);

  return (
    <Card style={{ marginTop: 18 }}>
      <CardTitle ic="📎">Inspirações</CardTitle>
      <p className="card-sub">Guarde ideias e links de referência.</p>

      <div>
        {list.length ? (
          list.map((i) => (
            <div className="buyrow insp" key={i.id}>
              <input
                value={i.titulo}
                placeholder="Ideia / referência"
                onChange={(e) => edit(cat, i.id, 'titulo', e.target.value)}
              />
              <input
                value={i.link}
                placeholder="Link (Pinterest, Insta…)"
                onChange={(e) => edit(cat, i.id, 'link', e.target.value)}
              />
              <span style={{ display: 'flex', gap: 2 }}>
                {i.link ? (
                  <a
                    className="icon-btn"
                    href={i.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir"
                  >
                    ↗
                  </a>
                ) : null}
                <IconButton danger title="Remover" onClick={() => remove(cat, i.id)}>
                  🗑
                </IconButton>
              </span>
            </div>
          ))
        ) : (
          <div className="empty">Cole aqui links de referências que você curtir.</div>
        )}
      </div>

      <InlineAdd placeholder="Nova inspiração…" onAdd={(v) => add(cat, v)} />
    </Card>
  );
}
