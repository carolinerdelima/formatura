/** Gera um id curto e único. */
export const uid = (): string => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/** Formata um número como moeda brasileira. */
export const brl = (n: number): string =>
  (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Converte texto digitado (ex.: "1.200,50" ou "R$ 1.200,50") em número. */
export const parseValor = (v: string | number): number => {
  if (typeof v === 'number') return v;
  if (!v) return 0;
  const clean = String(v)
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
};

/** Formata a data da festa por extenso (ex.: "29 de agosto de 2026"). */
export const dataPorExtenso = (dataHora: string): string =>
  dataHora
    ? new Date(dataHora).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';

/** Formata só a hora (ex.: "18:00"). */
export const horaCurta = (dataHora: string): string =>
  dataHora
    ? new Date(dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '';
