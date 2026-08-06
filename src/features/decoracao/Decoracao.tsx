import { ChecklistBlock } from '../../components/ChecklistBlock';
import { ComprasBlock } from '../../components/ComprasBlock';
import { InspiracoesBlock } from '../../components/InspiracoesBlock';
import { Card, CardTitle, ViewHead } from '../../components/ui';
import { FLORES } from '../../store/seed';

const ESTILOS: ReadonlyArray<readonly [string, number, string]> = [
  ['Boho', 40, 'var(--salvia)'],
  ['Country', 30, 'var(--terracota)'],
  ['Elegante', 30, 'var(--dourado)'],
];

export function Decoracao() {
  return (
    <>
      <ViewHead
        eyebrow="Decoração"
        title="🌾 Decoração"
        desc="Boho é 40% da identidade e mora aqui: linho, tecidos leves, flores desconstruídas, velas e muito verde."
      />

      <Card>
        <CardTitle ic="🎯">Equilíbrio de estilos</CardTitle>
        <div className="style-bars">
          {ESTILOS.map(([nome, pct, cor]) => (
            <div className="sb" key={nome}>
              <span className="lbl">{nome}</span>
              <span className="track">
                <span style={{ width: `${pct}%`, background: cor }} />
              </span>
              <span className="pct">{pct}%</span>
            </div>
          ))}
        </div>

        <div className="mood" style={{ marginTop: 16 }}>
          <div className="m-card">
            <h4>🌸 Composição floral</h4>
            <ul>
              {FLORES.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <div className="m-card">
            <h4>🍰 Mesa de doces</h4>
            <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', margin: 0 }}>
              Nada de painel gigante — que pareça que "sempre esteve ali". Madeira, flores crescendo
              pelos cantos, velas, livros antigos, porta-retratos, lanternas, frutas (uvas, figos,
              peras), cerâmicas e cristais.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid two" style={{ marginTop: 18 }}>
        <ChecklistBlock cat="decoracao" />
        <ComprasBlock cat="decoracao" />
      </div>

      <InspiracoesBlock cat="decoracao" />
    </>
  );
}
