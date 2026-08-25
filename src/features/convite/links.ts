import { CONVITE_INFO } from './conviteInfo';

/** Link do Google Maps para o endereço da festa. */
export function linkComoChegar(): string {
  const q = encodeURIComponent(`${CONVITE_INFO.local}, ${CONVITE_INFO.endereco}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/**
 * Link "Adicionar à agenda" — aponta pro arquivo `.ics` estático
 * (`public/formatura-carol.ics`), não pra um link do Google Agenda gerado
 * na hora. O `.ics` abre direto no app de calendário nativo em qualquer
 * aparelho (Android, iPhone, desktop) sem as inconsistências de fuso que o
 * link do Google Calendar tinha em alguns Android. Pra mudar data/horário/
 * texto do evento, edite `public/formatura-carol.ics` diretamente.
 */
export function linkSalvarNaAgenda(): string {
  return '/formatura-carol.ics';
}
