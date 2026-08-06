import type { ReactNode } from 'react';

/** Cabeçalho de view (eyebrow + título + descrição). */
export function ViewHead({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: ReactNode;
  desc?: string;
}) {
  return (
    <div className="view-head">
      <div className="eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
      {desc ? <p>{desc}</p> : null}
    </div>
  );
}

export function Card({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`card ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

export function CardTitle({
  ic,
  children,
  aside,
}: {
  ic: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <h3>
      <span className="ic">{ic}</span> {children}
      {aside ? <span className="push">{aside}</span> : null}
    </h3>
  );
}

/** Card de estatística com número grande + label. */
export function Stat({
  n,
  label,
  color,
  pct,
  sufixo,
}: {
  n: ReactNode;
  label: string;
  color?: string;
  /** Se informado, desenha a barra de progresso. */
  pct?: number;
  sufixo?: ReactNode;
}) {
  return (
    <div className="stat">
      <div className="n" style={color ? { color } : undefined}>
        {n}
        {sufixo}
      </div>
      <div className="l">{label}</div>
      {pct !== undefined ? (
        <div className="bar">
          <span style={{ width: `${pct}%` }} />
        </div>
      ) : null}
    </div>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className="chip">{children}</span>;
}

export function Note({ children }: { children: ReactNode }) {
  return <div className="note">{children}</div>;
}

/** Pill clicável que alterna estado (pago/a pagar, bebe/não bebe...). */
export function PillToggle({
  on,
  onLabel,
  offLabel,
  onClick,
  variantOff = 'due',
  title,
}: {
  on: boolean;
  onLabel: string;
  offLabel: string;
  onClick: () => void;
  variantOff?: 'due' | 'minor';
  title?: string;
}) {
  return (
    <button
      type="button"
      className={`pill-toggle ${on ? 'paid' : variantOff}`}
      onClick={onClick}
      title={title}
    >
      {on ? onLabel : offLabel}
    </button>
  );
}

export function IconButton({
  children,
  onClick,
  title,
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  title?: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      className={`icon-btn ${danger ? 'danger' : ''}`.trim()}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}
