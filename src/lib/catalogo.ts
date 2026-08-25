import type { Categoria, CategoriaPessoal, TabId } from '../types';

export interface MetaCategoria {
  label: string;
  ic: string;
  pessoal?: boolean;
}

/** Metadados de cada categoria de custo/compra. */
export const CATS: Record<Categoria, MetaCategoria> = {
  comida: { label: 'Comida', ic: '🍽️' },
  bebida: { label: 'Bebida', ic: '🍹' },
  decoracao: { label: 'Decoração', ic: '🌾' },
  musica: { label: 'Música & Luz', ic: '🎶' },
  papelaria: { label: 'Papelaria', ic: '✉️' },
  maquiagem: { label: 'Maquiagem', ic: '💄', pessoal: true },
  cabelo: { label: 'Cabelo', ic: '💇‍♀️', pessoal: true },
  acessorios: { label: 'Acessórios', ic: '💍', pessoal: true },
  calcado: { label: 'Calçado', ic: '👠', pessoal: true },
  vestido: { label: 'Vestido', ic: '👗', pessoal: true },
};

/** Ordem dos blocos na aba "Sobre mim". */
export const ORDEM_PESSOAL: CategoriaPessoal[] = [
  'vestido',
  'maquiagem',
  'cabelo',
  'acessorios',
  'calcado',
];

export interface TabMeta {
  id: TabId;
  label: string;
  ic: string;
}

export const TABS: TabMeta[] = [
  { id: 'inicio', label: 'Início', ic: '☀️' },
  { id: 'comida', label: 'Comida', ic: '🍽️' },
  { id: 'bebida', label: 'Bebida', ic: '🍹' },
  { id: 'decoracao', label: 'Decoração', ic: '🌾' },
  { id: 'musica', label: 'Música & Luz', ic: '🎶' },
  { id: 'papelaria', label: 'Papelaria', ic: '✉️' },
  { id: 'convidados', label: 'Convidados', ic: '👥' },
  { id: 'colacao', label: 'Colação', ic: '🎓' },
  { id: 'pessoal', label: 'Sobre mim', ic: '🌸' },
  { id: 'gastos', label: 'Gastos', ic: '💰' },
];

/** Paleta oficial "Janta de formatura". */
export const PALETA: ReadonlyArray<readonly [string, string]> = [
  ['Linho', '#F7F3ED'],
  ['Rosa Chá', '#EBCFD1'],
  ['Rosa Antigo', '#C98E9A'],
  ['Pêssego', '#E8B48D'],
  ['Terracota', '#BF7356'],
  ['Sálvia', '#A7B39B'],
  ['Oliva', '#6F7255'],
  ['Café', '#4A3428'],
  ['Dourado', '#A9864F'],
];
