import { supabase } from '../../lib/supabase';
import type { Faixa, Genero, StatusConvidado } from '../../types';

export interface ConviteData {
  nome: string;
  status: StatusConvidado;
  faixa: Faixa;
  genero: Genero;
}

/**
 * Busca os dados públicos de um convidado pelo slug, via a função RPC
 * `rpc_get_convite` - nunca toca a tabela `convidados` diretamente.
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
  };
}

/**
 * Confirma ou recusa presença (e opcionalmente preenche faixa/gênero), via a
 * função RPC `rpc_confirmar_presenca` - grava só a própria linha do convidado.
 * @returns `true` se a gravação deu certo.
 */
export async function enviarRsvp(
  slug: string,
  status: 'confirmado' | 'recusado',
  faixa?: Faixa,
  genero?: Genero,
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.rpc('rpc_confirmar_presenca', {
    p_slug: slug,
    p_status: status,
    p_faixa: faixa ?? null,
    p_genero: genero ?? null,
  });
  if (error) {
    console.error('Falha ao enviar RSVP:', error.message);
    return false;
  }
  return true;
}
