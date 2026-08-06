import { useStore } from '../store/useStore';
import type { CategoriaOperacional } from '../types';
import { InlineAdd } from './InlineAdd';
import { Card, CardTitle, Chip, IconButton } from './ui';

/** Bloco de checklist (pendências) de uma categoria operacional. */
export function ChecklistBlock({ cat }: { cat: CategoriaOperacional }) {
  const items = useStore((s) => s.checklists[cat]);
  const add = useStore((s) => s.addChecklistItem);
  const toggle = useStore((s) => s.toggleChecklistItem);
  const edit = useStore((s) => s.editChecklistItem);
  const remove = useStore((s) => s.removeChecklistItem);

  const feitas = items.filter((i) => i.feito).length;

  return (
    <Card>
      <CardTitle
        ic="✔"
        aside={
          <Chip>
            {feitas}/{items.length} ok
          </Chip>
        }
      >
        Pendências
      </CardTitle>
      <p className="card-sub">Sua checklist desta aba. Clique no texto para editar.</p>

      {items.length ? (
        <ul className="checklist">
          {items.map((it) => (
            <li key={it.id} className={it.feito ? 'done' : ''}>
              <input
                type="checkbox"
                className="chk"
                checked={it.feito}
                onChange={() => toggle(cat, it.id)}
              />
              <span
                className="txt"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => edit(cat, it.id, e.currentTarget.textContent?.trim() ?? '')}
              >
                {it.texto}
              </span>
              <IconButton danger title="Remover" onClick={() => remove(cat, it.id)}>
                ✕
              </IconButton>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">Sem pendências ainda. Adicione a primeira abaixo.</div>
      )}

      <InlineAdd placeholder="Nova pendência…" onAdd={(v) => add(cat, v)} />
    </Card>
  );
}
