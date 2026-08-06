import { uid } from '../lib/format';
import type { AppState, ChecklistItem } from '../types';

const mk = (arr: string[]): ChecklistItem[] =>
  arr.map((texto) => ({ id: uid(), texto, feito: false }));

/** Estado inicial (semente) com o conceito da Carol já embutido. */
export function seed(): AppState {
  return {
    festa: {
      titulo: 'Formatura — Ciência da Computação',
      dataHora: '2026-08-29T18:00',
      local: 'Churrascaria Família Strapazzon',
      endereco: 'Rua VRS, 855 — São Marcos, Farroupilha/RS · 95180-000',
    },
    bebida: { choppLitros: null },
    pix: { chave: '', tipo: 'Chave PIX', imagem: '' },
    checklists: {
      comida: mk([
        'Confirmar cardápio final com a casa',
        'Definir opção vegetariana',
        'Alinhar horário de saída dos pratos',
        'Sobremesa / mesa de doces',
        'Bolo de formatura',
      ]),
      bebida: mk([
        'Definir litros de chopp a liberar',
        'Confirmar carta de drinks da casa',
        'Água e não-alcoólicos para quem dirige',
        'Brinde / espumante para o momento do diploma',
      ]),
      decoracao: mk([
        'Fechar florista (composição solta + muito verde)',
        'Definir arranjos das mesas',
        'Velas altas + lanternas',
        'Toalhas de linho / tecidos leves',
        'Capim dos pampas (pouco!) + eucalipto',
        'Mesa de doces estilo "sempre esteve ali"',
      ]),
      musica: mk([
        'Contratar som / DJ ou playlist',
        'Playlist do pôr do sol (golden hour)',
        'Iluminação quente + varal de luzes',
        'Velas para a transição noite',
        'Testar som no espaço',
      ]),
      papelaria: mk([
        'Convite (papel texturizado + lacre de cera)',
        'Enviar convites',
        'Lembrancinhas',
        'Cartaz "Bem-vindos" da entrada',
        'Placa/base para o quadro de formatura',
        'Cartaz da mesa de presentes + QR PIX',
        'Tags / plaquinhas de mesa',
      ]),
    },
    inspiracoes: {
      decoracao: [],
      musica: [],
      papelaria: [],
      maquiagem: [],
      cabelo: [],
    },
    compras: [
      {
        id: uid(),
        categoria: 'vestido',
        nome: 'Aluguel do vestido (rosa antigo, acetinado fosco)',
        valor: 0,
        pago: false,
        reservado: false,
        link: '',
        obs: '',
      },
    ],
    convidados: [],
    convidadosColacao: [],
    tab: 'inicio',
  };
}

/** Composição floral usada na aba Decoração. */
export const FLORES = [
  'Rosas champagne/nude/rosa antigo',
  'Dálias (rosa queimado, pêssego, creme)',
  'Lisianthus rosé e branco',
  'Ranúnculos champagne e rosa',
  'Cosmos brancos e rosados',
  'Astilbe creme',
  'Cravos champagne',
  'Pampas — só alguns!',
  'Muito verde: eucalipto, oliveira, ruscus',
];
