import { ChecklistBlock } from '../../components/ChecklistBlock';
import { ComprasBlock } from '../../components/ComprasBlock';
import { InspiracoesBlock } from '../../components/InspiracoesBlock';
import { Note, ViewHead } from '../../components/ui';
import { CATS } from '../../lib/catalogo';
import type { CategoriaOperacional } from '../../types';

const SUBTITULOS: Partial<Record<CategoriaOperacional, string>> = {
  comida:
    'Cardápio da casa já definido - aqui você acompanha ajustes e extras (doces, bolo, sobremesa).',
  musica:
    'Som e a iluminação da golden hour: playlist do pôr do sol, luz quente e velas na transição para a noite.',
};

/** View genérica de aba operacional: checklist + compras (+ inspirações). */
export function Operacional({
  cat,
  comInspiracoes = false,
}: {
  cat: CategoriaOperacional;
  comInspiracoes?: boolean;
}) {
  const meta = CATS[cat];

  return (
    <>
      <ViewHead eyebrow={meta.label} title={`${meta.ic} ${meta.label}`} desc={SUBTITULOS[cat]} />

      {cat === 'musica' ? (
        <Note>
          💡 <b>Ideia de roteiro de luz:</b> 18h luz natural dourada → varal de luzes ao anoitecer →
          velas altas e lanternas no jantar. A trilha acompanha: algo leve e solar no início, mais
          quente conforme escurece.
        </Note>
      ) : null}

      <div className="grid two" style={{ marginTop: cat === 'musica' ? 18 : 0 }}>
        <ChecklistBlock cat={cat} />
        <ComprasBlock cat={cat} />
      </div>

      {comInspiracoes && cat === 'musica' ? <InspiracoesBlock cat="musica" /> : null}
    </>
  );
}
