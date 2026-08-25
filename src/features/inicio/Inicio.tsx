import { useCountdown } from '../../hooks/useCountdown';
import { PALETA } from '../../lib/catalogo';
import { brl } from '../../lib/format';
import { guestMetrics, pagoDe, totalDe } from '../../store/selectors';
import { useStore } from '../../store/useStore';
import { Card, CardTitle, Note, Stat, ViewHead } from '../../components/ui';

export function Inicio() {
  const festa = useStore((s) => s.festa);
  const setFesta = useStore((s) => s.setFesta);
  const compras = useStore((s) => s.compras);
  const convidados = useStore((s) => s.convidados);
  const chopp = useStore((s) => s.bebida.choppLitros);

  const c = useCountdown(festa.dataHora);
  const gm = guestMetrics(convidados);
  const orc = totalDe(compras);
  const pago = pagoDe(compras);
  const pctPago = orc ? Math.round((pago / orc) * 100) : 0;

  const unit = (n: number, l: string) => (
    <div className="unit" key={l}>
      <div className="n">{String(n).padStart(2, '0')}</div>
      <div className="l">{l}</div>
    </div>
  );

  return (
    <>
      <ViewHead
        eyebrow="Painel principal"
        title="Contagem regressiva ☀️"
        desc="Tudo o que falta para o grande dia, em um lugar só."
      />

      <div className="hero">
        <div className="sundial" />
        <div className="kicker">Janta de formatura</div>
        <h2>
          Formatura da <em>Carol</em>
        </h2>
        <div className="where">
          📍 {festa.local} · {festa.endereco}
          <br />
          🗓️ 29 de agosto de 2026, 18h - pôr do sol na fazenda
        </div>
        <div className="count">
          {unit(c.dias, 'Dias')}
          {unit(c.horas, 'Horas')}
          {unit(c.min, 'Min')}
          {unit(c.seg, 'Seg')}
        </div>
      </div>

      {chopp == null ? (
        <div style={{ marginTop: 18 }}>
          <Note>
            🍺 <b>Pendência aberta:</b> definir quantos litros de chopp liberar. Ajuste na aba{' '}
            <b>Bebida</b> - calcule sobre ~{gm.consumidores || 80} pessoas que podem beber. Regra de
            bolso: entre 1,2 e 2 L por consumidor de álcool.
          </Note>
        </div>
      ) : null}

      <div className="stats" style={{ marginTop: 18 }}>
        <Stat n={c.dias} label="Dias restantes" />
        <Stat
          n={gm.confirmados}
          sufixo={<small>/{gm.total || 0}</small>}
          label="Convidados confirmados"
          pct={gm.total ? Math.round((gm.confirmados / gm.total) * 100) : 0}
        />
        <Stat n={brl(orc)} label="Orçamento total" />
        <Stat n={`${pctPago}%`} label={`Já pago (${brl(pago)})`} pct={pctPago} />
      </div>

      <Card style={{ marginTop: 18 }}>
        <CardTitle ic="🎨">Paleta oficial</CardTitle>
        <p className="card-sub">
          Rustic Chic · Boho · Country Elegante - a luz dourada como fio condutor.
        </p>
        <div className="swatches">
          {PALETA.map(([nome, hex]) => (
            <div className="sw" key={hex}>
              <i style={{ background: hex }} />
              {nome} <code>{hex}</code>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid two" style={{ marginTop: 18 }}>
        <Card>
          <CardTitle ic="📍">A festa</CardTitle>
          <div className="row">
            <div>
              <label className="fld">Local</label>
              <input value={festa.local} onChange={(e) => setFesta('local', e.target.value)} />
            </div>
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <div className="grow2">
              <label className="fld">Endereço</label>
              <input
                value={festa.endereco}
                onChange={(e) => setFesta('endereco', e.target.value)}
              />
            </div>
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <div>
              <label className="fld">Data e hora</label>
              <input
                type="datetime-local"
                value={festa.dataHora}
                onChange={(e) => setFesta('dataHora', e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle ic="✨">O conceito</CardTitle>
          <p className="card-sub">"Janta de formatura"</p>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: 0 }}>
            A festa começa às 18h, na luz dourada. Fotos ao ar livre na hora mágica, depois todos
            entram para o jantar e a iluminação vira velas e luz quente. O vestido rosa antigo muda
            de tom conforme o dia se despede. Sofisticado sem perder o aconchego.
          </p>
        </Card>
      </div>
    </>
  );
}
