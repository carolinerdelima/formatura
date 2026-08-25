/** Ilustrações inline (SVG) da identidade visual rosa+dourado da página do convidado. */

/** Título em arco, tipo "FORMATURA DA CAROL" curvado — como no convite impresso. */
export function TituloArco({ texto }: { texto: string }) {
  const id = 'arco-titulo';
  return (
    <svg className="convite-title-arc" viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
      <path id={id} d="M 20 90 A 300 300 0 0 1 380 90" fill="none" />
      <text textAnchor="middle">
        <textPath href={`#${id}`} startOffset="50%">
          {texto}
        </textPath>
      </text>
    </svg>
  );
}

/** Capelo + diploma com laço dourado — ilustração aquarela da Carol (public/diploma.png). */
export function DiplomaIlustracao() {
  return <img className="convite-diploma" src="/diploma.png" alt="Capelo de formatura com diploma" />;
}

/** Ícone de mapa dobrado com pin — link "ver endereço". */
export function IconeMapa() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 12 L18 8 L30 12 L42 8 V36 L30 40 L18 36 L6 40 Z"
        fill="#FBF3E4"
        stroke="#C9A96E"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <line x1="18" y1="8" x2="18" y2="36" stroke="#D8C9A0" strokeWidth="1" />
      <line x1="30" y1="12" x2="30" y2="40" stroke="#D8C9A0" strokeWidth="1" />
      <circle cx="24" cy="21" r="10" fill="#D88FA8" />
      <circle cx="24" cy="21" r="3.4" fill="#fff" />
      <path d="M24 34 l0 6" stroke="#D88FA8" strokeWidth="0" />
    </svg>
  );
}

/** Ícone de calendário com relógio — link "adicionar à agenda". */
export function IconeCalendario() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="10" width="30" height="28" rx="4" fill="#FFFDFB" stroke="#C9A96E" strokeWidth="1.6" />
      <rect x="6" y="10" width="30" height="9" rx="4" fill="#D88FA8" />
      <line x1="13" y1="6" x2="13" y2="14" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round" />
      <line x1="29" y1="6" x2="29" y2="14" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round" />
      <g opacity="0.55">
        <rect x="11" y="23" width="4" height="4" fill="#E8C9D4" />
        <rect x="18" y="23" width="4" height="4" fill="#E8C9D4" />
        <rect x="25" y="23" width="4" height="4" fill="#E8C9D4" />
        <rect x="11" y="30" width="4" height="4" fill="#E8C9D4" />
        <rect x="18" y="30" width="4" height="4" fill="#E8C9D4" />
      </g>
      <circle cx="34" cy="34" r="10" fill="#fff" stroke="#D88FA8" strokeWidth="2" />
      <path d="M34 28 v6 l4 3" stroke="#D88FA8" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Laço dourado enrolado, usado nos quatro cantos da página. */
function Laco({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="70" height="70" viewBox="0 0 70 70" style={style} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 5 C 30 0, 15 30, 45 20 C 65 13, 55 45, 68 55"
        fill="none"
        stroke="#C9A265"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Confetes retangulares dourados espalhados. */
function Confetes({ style }: { style?: React.CSSProperties }) {
  const pecas = [
    [0, 0, 18], [14, 22, -20], [30, 6, 40], [8, 40, 10], [26, 34, -35],
  ];
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" style={style} xmlns="http://www.w3.org/2000/svg">
      {pecas.map(([x, y, rot], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width="9"
          height="5"
          rx="1.5"
          fill={i % 2 ? '#D8AE5C' : '#E8C9D4'}
          transform={`rotate(${rot} ${x + 4.5} ${y + 2.5})`}
        />
      ))}
    </svg>
  );
}

/** Decoração fixa nos quatro cantos da tela (laços + confete). Não interfere no clique. */
export function ConviteFundo() {
  return (
    <div className="convite-confete" aria-hidden="true">
      <Laco style={{ position: 'fixed', top: -6, left: -6 }} />
      <Laco style={{ position: 'fixed', top: -10, right: -10, transform: 'scaleX(-1)' }} />
      <Laco style={{ position: 'fixed', bottom: -14, left: -14, transform: 'rotate(180deg)' }} />
      <Laco style={{ position: 'fixed', bottom: -10, right: -6, transform: 'rotate(180deg) scaleX(-1)' }} />
      <Confetes style={{ position: 'fixed', top: 60, left: 4, opacity: 0.8 }} />
      <Confetes style={{ position: 'fixed', top: 90, right: 4, opacity: 0.7 }} />
      <Confetes style={{ position: 'fixed', bottom: 60, left: 10, opacity: 0.7 }} />
    </div>
  );
}
