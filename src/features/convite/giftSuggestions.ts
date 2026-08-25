/**
 * Sugestões de presente mostradas na página do convidado (`/c/:slug`), dentro
 * do toggle "ver sugestões". Duas partes:
 *
 * 1. `PREFERENCIAS_BASICAS` - o guia principal (tamanhos, cores, estilo).
 *    É o que a maioria dos convidados realmente usa.
 * 2. `SUGESTOES_PRESENTE` - exemplos visuais do gosto da Carol, só
 *    referência, organizados por categoria, do mais simples ao mais caro
 *    dentro de cada uma.
 *
 * Pra adicionar uma imagem nova: salve em `public/presentes/` e acrescente
 * uma linha em `SUGESTOES_PRESENTE`.
 */

/** Guia principal - tamanhos, cores e estilo. Mostrado antes dos exemplos visuais. */
export const PREFERENCIAS_BASICAS: string[] = [
  'Acessórios / bijuterias / joias no dourado',
  'Calçado tamanho 37',
  'Roupas ->  tamanho P ou M. Calça tamanho 38/40',
  'Perfumes, body splashs, cremes com cheiro docinho ou florais',
  'Qualquer tipo de cosmético',
  'Acessórios pra computador (mouse, mousepad, teclado) rosas',
  'Cores que eu gosto: rosa, bege, branco, preto, marrom, azul',
  'Coisas do (Grêmio) 🔵⚫⚪',
  'Cafézinhos ☕',
  'Docinhos em geral 🍬',
  'Itens fitness (roupa de treino, acessórios de treino, etc.)',
];

export type CategoriaPresente = 'cabelo' | 'acessorios' | 'cosmeticos';

export const CATEGORIAS_PRESENTE: Record<CategoriaPresente, string> = {
  cabelo: '💇‍♀️ Para o cabelo',
  acessorios: '✨ Acessórios dourados',
  cosmeticos: '🌸 Perfumes & cremes',
};

export interface SugestaoPresente {
  nome: string;
  categoria: CategoriaPresente;
  /** Arquivo em `public/presentes/`. */
  imagem: string;
}

/** Do mais simples ao mais caro, dentro de cada categoria. */
export const SUGESTOES_PRESENTE: SugestaoPresente[] = [];
