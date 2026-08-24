import { CONVITE_INFO } from './conviteInfo';

/** Link do Google Maps para o endereço da festa. */
export function linkComoChegar(): string {
  const q = encodeURIComponent(`${CONVITE_INFO.local}, ${CONVITE_INFO.endereco}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/** Formata uma data local (sem fuso) no padrão `YYYYMMDDTHHmmss` exigido pelo Google Calendar. */
function formatoGCal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}00`
  );
}

/** Link "Adicionar ao Google Agenda" com data/local já preenchidos. */
export function linkSalvarNaAgenda(): string {
  const inicio = new Date(CONVITE_INFO.dataHora);
  const fim = new Date(inicio.getTime() + CONVITE_INFO.duracaoHoras * 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: 'Formatura da Carol — Ciência da Computação',
    dates: `${formatoGCal(inicio)}/${formatoGCal(fim)}`,
    location: `${CONVITE_INFO.local}, ${CONVITE_INFO.endereco}`,
    details: 'Golden Hour at the Farm 🌾✨',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
