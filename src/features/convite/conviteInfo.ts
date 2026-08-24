/**
 * Dados fixos que aparecem na página pública do convidado (`/c/:slug`).
 * São os mesmos pra todo mundo, então ficam direto no código em vez de
 * vir do banco — se a data, o local ou a chave PIX mudarem, edite aqui.
 */
export const CONVITE_INFO = {
  nomeEvento: 'Formatura da Carol',
  local: 'Churrascaria Família Strapazzon',
  endereco: 'Rua VRS, 855 — São Marcos, Farroupilha/RS · 95180-000',
  /** Mesmo formato do resto do app: `YYYY-MM-DDTHH:mm`. */
  dataHora: '2026-09-05T19:00',
  duracaoHoras: 5,
  descricaoCalendario: 'Jantar e comemoração da formatura da Carol em Ciência da Computação ✨',
  pix: {
    tipo: 'Celular',
    chave: '51996642772',
    /** Arquivo em `public/` — servido direto da raiz do site. */
    qrImagem: '/pix-qr.jpeg',
  },
};
