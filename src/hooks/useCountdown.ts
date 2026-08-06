import { useEffect, useState } from 'react';

export interface Countdown {
  dias: number;
  horas: number;
  min: number;
  seg: number;
}

const calc = (dataHora: string): Countdown => {
  const target = new Date(dataHora).getTime();
  let d = Math.max(0, (isNaN(target) ? Date.now() : target) - Date.now());
  const dias = Math.floor(d / 864e5);
  d -= dias * 864e5;
  const horas = Math.floor(d / 36e5);
  d -= horas * 36e5;
  const min = Math.floor(d / 6e4);
  d -= min * 6e4;
  return { dias, horas, min, seg: Math.floor(d / 1e3) };
};

/** Contador regressivo ao vivo, atualizado a cada segundo. */
export function useCountdown(dataHora: string): Countdown {
  const [c, setC] = useState(() => calc(dataHora));

  useEffect(() => {
    setC(calc(dataHora));
    const t = window.setInterval(() => setC(calc(dataHora)), 1000);
    return () => window.clearInterval(t);
  }, [dataHora]);

  return c;
}
