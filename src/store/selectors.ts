import type { Categoria, Convidado, GuestMetrics, ItemCompra } from '../types';

/** Compras de uma categoria. */
export const comprasDe = (compras: ItemCompra[], cat: Categoria): ItemCompra[] =>
  compras.filter((c) => c.categoria === cat);

/** Soma o total orçado de uma lista de compras. */
export const totalDe = (list: ItemCompra[]): number =>
  list.reduce((s, c) => s + (Number(c.valor) || 0), 0);

/** Soma o total já pago de uma lista. */
export const pagoDe = (list: ItemCompra[]): number =>
  list.reduce((s, c) => s + (c.pago ? Number(c.valor) || 0 : 0), 0);

/**
 * Métricas agregadas da lista de convidados.
 * A faixa etária (adulto/criança/adolescente) é escolhida explicitamente por convidado.
 *
 * Duas bases de cálculo coexistem de propósito:
 * - "Considerados" (confirmados + pendentes, exclui quem recusou): usado para planejar
 *   lembrancinhas e perfil de convidados — não dá pra esperar todo mundo confirmar.
 * - Confirmados: usado só para o chopp, que é comprado mais perto da data.
 */
export function guestMetrics(list: Convidado[]): GuestMetrics {
  const conf = list.filter((g) => g.status === 'confirmado');
  const considerados = list.filter((g) => g.status !== 'recusado');

  let bebedores = 0;
  let naoBebem = 0;
  let menoresConfirmados = 0;
  for (const g of conf) {
    if (g.faixa === 'crianca' || g.faixa === 'adolescente') menoresConfirmados++;
    else if (g.bebe === false) naoBebem++;
    else bebedores++;
  }

  let criancas = 0;
  let adolescentes = 0;
  let homens = 0;
  let mulheres = 0;
  let semGenero = 0;
  let bebedoresConsiderados = 0;
  for (const g of considerados) {
    if (g.faixa === 'crianca') criancas++;
    else if (g.faixa === 'adolescente') adolescentes++;
    else if (g.bebe !== false) bebedoresConsiderados++;

    if (g.genero === 'M') homens++;
    else if (g.genero === 'F') mulheres++;
    else semGenero++;
  }

  const provaveis = considerados.filter((g) => g.provavel !== false).length;

  return {
    total: list.length,
    confirmados: conf.length,
    recusados: list.filter((g) => g.status === 'recusado').length,
    pendentes: list.filter((g) => g.status === 'pendente').length,
    enviados: list.filter((g) => g.conviteEnviado).length,
    considerados: considerados.length,
    provaveis,
    bebedoresConsiderados,
    menores: criancas + adolescentes,
    criancas,
    adolescentes,
    homens,
    mulheres,
    semGenero,
    menoresConfirmados,
    bebedores,
    naoBebem,
    consumidores: bebedores,
  };
}
