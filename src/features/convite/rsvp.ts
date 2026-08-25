import { supabase } from '../../lib/supabase';
import type { Faixa, Genero, StatusConvidado } from '../../types';

export interface ConviteData {
  nome: string;
  status: StatusConvidado;
  faixa: Faixa;
  genero: Genero;
  /** Presente só quando o link é de uma FAMÍLIA (grupo), não de uma pessoa. */
  vagas: number | null;
  confirmadosQtd: number | null;
}

/**
 * Busca os dados públicos de um convidado (ou família) pelo slug, via a
 * função RPC `rpc_get_convite` - nunca toca a tabela `convidados` diretamente.
 * @returns `null` se o slug não existir, o Supabase não estiver configurado,
 * ou a requisição falhar.
 */
export async function buscarConvite(slug: string): Promise<ConviteData | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('rpc_get_convite', { p_slug: slug });
  if (error) {
    console.error('Falha ao buscar convite:', error.message);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return null;
  return {
    nome: row.nome ?? '',
    status: (row.status ?? 'pendente') as StatusConvidado,
    faixa: (row.faixa ?? 'adulto') as Faixa,
    genero: (row.genero ?? '') as Genero,
    vagas: row.vagas ?? null,
    confirmadosQtd: row.confirmados_qtd ?? null,
  };
}

/**
 * Confirma ou recusa presença, via a função RPC `rpc_confirmar_presenca` -
 * grava só a própria linha do convidado/família.
 * - `faixa`/`genero`: só fazem sentido pra convidado individual.
 * - `confirmadosQtd`: só faz sentido pra link de família (quantos de fato vêm).
 * @returns `true` se a gravação deu certo.
 */
export async function enviarRsvp(
  slug: string,
  status: 'confirmado' | 'recusado',
  faixa?: Faixa,
  genero?: Genero,
  confirmadosQtd?: number,
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.rpc('rpc_confirmar_presenca', {
    p_slug: slug,
    p_status: status,
    p_faixa: faixa ?? null,
    p_genero: genero ?? null,
    p_confirmados_qtd: confirmadosQtd ?? null,
  });
  if (error) {
    console.error('Falha ao enviar RSVP:', error.message);
    return false;
  }
  return true;
}

export interface GrupoData {
  familiaNome: string;
  membros: { slug: string; nome: string; status: StatusConvidado }[];
}

/**
 * Busca um GRUPO de convidados individuais já cadastrados (agrupados via
 * "agrupar em família" na área admin) pelo slug compartilhado do grupo.
 * @returns `null` se o slug não corresponder a nenhum grupo.
 */
export async function buscarConviteGrupo(slug: string): Promise<GrupoData | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('rpc_get_convite_grupo', { p_slug: slug });
  if (error) {
    console.error('Falha ao buscar grupo:', error.message);
    return null;
  }
  const rows = Array.isArray(data) ? data : [];
  if (!rows.length) return null;
  return {
    familiaNome: rows[0].familia_nome ?? '',
    membros: rows.map((r) => ({
      slug: r.membro_slug,
      nome: r.membro_nome ?? '',
      status: (r.membro_status ?? 'pendente') as StatusConvidado,
    })),
  };
}

/**
 * Confirma/recusa UM membro do grupo, pelo slug individual dele — nunca
 * mexe nos outros membros nem em faixa/gênero/bebe (que continuam intactos).
 * @returns `true` se a gravação deu certo.
 */
export async function confirmarMembroGrupo(
  grupoSlug: string,
  membroSlug: string,
  status: 'confirmado' | 'recusado',
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.rpc('rpc_confirmar_membro_grupo', {
    p_grupo_slug: grupoSlug,
    p_membro_slug: membroSlug,
    p_status: status,
  });
  if (error) {
    console.error('Falha ao confirmar membro do grupo:', error.message);
    return false;
  }
  return true;
}
