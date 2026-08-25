/* ============================================================
   Modelo de dados - Formatura da Carol
   ============================================================ */

/** Categorias operacionais: têm checklist + lista de compras. */
export const CATEGORIAS_OPERACIONAIS = [
  'comida',
  'bebida',
  'decoracao',
  'musica',
  'papelaria',
] as const;

/** Categorias pessoais: aba "Sobre mim". */
export const CATEGORIAS_PESSOAIS = [
  'vestido',
  'maquiagem',
  'cabelo',
  'acessorios',
  'calcado',
] as const;

export type CategoriaOperacional = (typeof CATEGORIAS_OPERACIONAIS)[number];
export type CategoriaPessoal = (typeof CATEGORIAS_PESSOAIS)[number];
export type Categoria = CategoriaOperacional | CategoriaPessoal;

export const CATEGORIAS: readonly Categoria[] = [
  ...CATEGORIAS_OPERACIONAIS,
  ...CATEGORIAS_PESSOAIS,
];

/** Categorias que aceitam inspirações (links de referência). */
export const CATEGORIAS_INSPIRACAO = [
  'decoracao',
  'musica',
  'papelaria',
  'maquiagem',
  'cabelo',
] as const;
export type CategoriaInspiracao = (typeof CATEGORIAS_INSPIRACAO)[number];

export type Faixa = 'adulto' | 'crianca' | 'adolescente';
export type Genero = '' | 'F' | 'M';
export type StatusConvidado = 'pendente' | 'confirmado' | 'recusado';
export type TipoChavePix = 'Chave PIX' | 'CPF' | 'Celular' | 'E-mail' | 'Aleatória';

export interface Convidado {
  id: string;
  nome: string;
  grupo: string;
  faixa: Faixa;
  idade: number | null;
  genero: Genero;
  /** Só relevante quando `faixa === 'adulto'`. */
  bebe: boolean;
  status: StatusConvidado;
  /** Sua expectativa pessoal de comparecimento - independente do `status` oficial. */
  provavel: boolean;
  conviteEnviado: boolean;
  obs: string;
  /** Token curto e único da URL pública `/c/:slug` - só a festa (não a colação) tem link de RSVP. */
  slug?: string;
}

export interface ItemCompra {
  id: string;
  categoria: Categoria;
  nome: string;
  valor: number;
  pago: boolean;
  /** Usado só nas categorias de "Sobre mim". */
  reservado: boolean;
  link: string;
  obs: string;
}

export interface ChecklistItem {
  id: string;
  texto: string;
  feito: boolean;
}

export interface Inspiracao {
  id: string;
  titulo: string;
  link: string;
}

export interface Festa {
  titulo: string;
  /** Formato de `<input type="datetime-local">`: `YYYY-MM-DDTHH:mm`. */
  dataHora: string;
  local: string;
  endereco: string;
}

export interface Pix {
  tipo: TipoChavePix;
  chave: string;
  /** Data URL (base64) da imagem do QR. */
  imagem: string;
}

export type TabId =
  | 'inicio'
  | CategoriaOperacional
  | 'convidados'
  | 'colacao'
  | 'pessoal'
  | 'gastos';

export interface AppState {
  festa: Festa;
  bebida: { choppLitros: number | null };
  pix: Pix;
  checklists: Record<CategoriaOperacional, ChecklistItem[]>;
  inspiracoes: Record<CategoriaInspiracao, Inspiracao[]>;
  compras: ItemCompra[];
  /** Convidados da festa de formatura. */
  convidados: Convidado[];
  /** Convidados da colação de grau - evento separado, em outro dia. */
  convidadosColacao: Convidado[];
  tab: TabId;
}

/** Métricas agregadas da lista de convidados. */
export interface GuestMetrics {
  total: number;
  confirmados: number;
  recusados: number;
  pendentes: number;
  enviados: number;
  /** Convidados + pendentes que não recusaram - base do planejamento (lembrancinhas, etc). */
  considerados: number;
  /** Não recusaram e você marcou como prováveis - sua estimativa real de quem vem. */
  provaveis: number;
  /** Adultos não recusados que bebem - atualiza ao vivo, mesmo antes de confirmar. */
  bebedoresConsiderados: number;
  /** Crianças + adolescentes entre os considerados (não recusados). */
  menores: number;
  /** Entre os considerados (não recusados) - para planejar lembrancinhas. */
  criancas: number;
  adolescentes: number;
  homens: number;
  mulheres: number;
  semGenero: number;
  /** Só entre confirmados - usado no cálculo do chopp. */
  menoresConfirmados: number;
  bebedores: number;
  naoBebem: number;
  /** Base para o cálculo do chopp: confirmados adultos que bebem. */
  consumidores: number;
}
