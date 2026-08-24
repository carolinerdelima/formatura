/**
 * Dados fixos que aparecem na página pública do convidado (`/c/:slug`).
 * São os mesmos pra todo mundo, então ficam direto no código em vez de
 * vir do banco — se a data, o local ou a chave PIX mudarem, edite aqui.
 */
export const CONVITE_INFO = {
  local: 'Churrascaria Família Strapazzon',
  endereco: 'Rua VRS, 855 — São Marcos, Farroupilha/RS · 95180-000',
  /** Mesmo formato do resto do app: `YYYY-MM-DDTHH:mm`. */
  dataHora: '2026-08-29T18:00',
  duracaoHoras: 5,
  pix: {
    tipo: 'Chave PIX',
    chave: '',
  },
  sugestoesPresente: [
    'Contribuição via PIX (chave ao lado)',
    'Vale-presente em loja de sua preferência',
    'Ajuda com a lua de formatura',
  ],
};
