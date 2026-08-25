import { toast } from '../components/toastStore';
import { supabase } from '../lib/supabase';
import type { Convidado } from '../types';

const TABLE = 'convidados';

/** Formato das linhas no Postgres (snake_case) - convertido de/para `Convidado` (camelCase). */
interface ConvidadoRow {
  id: string;
  nome: string;
  grupo: string;
  faixa: string;
  idade: number | null;
  genero: string;
  bebe: boolean;
  status: string;
  provavel: boolean;
  convite_enviado: boolean;
  obs: string;
  slug: string;
  vagas: number | null;
  confirmados_qtd: number | null;
  familia_grupo_slug: string | null;
  familia_grupo_nome: string | null;
}

function fromRow(r: ConvidadoRow): Convidado {
  return {
    id: r.id,
    nome: r.nome,
    grupo: r.grupo,
    faixa: r.faixa as Convidado['faixa'],
    idade: r.idade,
    genero: r.genero as Convidado['genero'],
    bebe: r.bebe,
    status: r.status as Convidado['status'],
    provavel: r.provavel,
    conviteEnviado: r.convite_enviado,
    obs: r.obs,
    slug: r.slug,
    vagas: r.vagas,
    confirmadosQtd: r.confirmados_qtd,
    familiaGrupoSlug: r.familia_grupo_slug,
    familiaGrupoNome: r.familia_grupo_nome,
  };
}

/** Monta o patch em snake_case só com os campos informados (evita sobrescrever o resto). */
function toRowPatch(patch: Partial<Convidado>): Partial<ConvidadoRow> {
  const row: Partial<ConvidadoRow> = {};
  if (patch.nome !== undefined) row.nome = patch.nome;
  if (patch.grupo !== undefined) row.grupo = patch.grupo;
  if (patch.faixa !== undefined) row.faixa = patch.faixa;
  if (patch.idade !== undefined) row.idade = patch.idade;
  if (patch.genero !== undefined) row.genero = patch.genero;
  if (patch.bebe !== undefined) row.bebe = patch.bebe;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.provavel !== undefined) row.provavel = patch.provavel;
  if (patch.conviteEnviado !== undefined) row.convite_enviado = patch.conviteEnviado;
  if (patch.obs !== undefined) row.obs = patch.obs;
  if (patch.vagas !== undefined) row.vagas = patch.vagas;
  if (patch.confirmadosQtd !== undefined) row.confirmados_qtd = patch.confirmadosQtd;
  if (patch.familiaGrupoSlug !== undefined) row.familia_grupo_slug = patch.familiaGrupoSlug;
  if (patch.familiaGrupoNome !== undefined) row.familia_grupo_nome = patch.familiaGrupoNome;
  return row;
}

/** Busca todos os convidados da festa (exige sessão autenticada - RLS bloqueia `anon`). */
export async function fetchConvidados(): Promise<Convidado[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from(TABLE).select('*').order('nome');
  if (error) {
    console.error('Falha ao buscar convidados do Supabase:', error.message);
    toast('Não conseguiu carregar os convidados do banco agora.');
    return null;
  }
  return (data as ConvidadoRow[]).map(fromRow);
}

/**
 * Insere um convidado novo (id e slug já gerados no cliente).
 * @returns `true` se a gravação foi confirmada - só aí o link dele é real.
 */
export async function insertConvidado(g: Convidado): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from(TABLE).insert({
    id: g.id,
    nome: g.nome,
    grupo: g.grupo,
    faixa: g.faixa,
    idade: g.idade,
    genero: g.genero,
    bebe: g.bebe,
    status: g.status,
    provavel: g.provavel,
    convite_enviado: g.conviteEnviado,
    obs: g.obs,
    slug: g.slug,
    vagas: g.vagas ?? null,
    confirmados_qtd: g.confirmadosQtd ?? null,
    familia_grupo_slug: g.familiaGrupoSlug ?? null,
    familia_grupo_nome: g.familiaGrupoNome ?? null,
  });
  if (error) {
    console.error('Falha ao criar convidado no Supabase:', error.message);
    toast(`Não salvou "${g.nome}" no banco - o link dele não vai funcionar. Tenta de novo.`);
    return false;
  }
  return true;
}

/**
 * Insere ou atualiza vários convidados de uma vez (por `id`) - usado ao
 * restaurar um backup `.json`, pra garantir que a tabela remota fica igual
 * ao que acabou de ser restaurado localmente, e não o contrário.
 */
export async function upsertConvidados(list: Convidado[]): Promise<void> {
  if (!supabase || list.length === 0) return;
  const rows = list.map((g) => ({
    id: g.id,
    nome: g.nome,
    grupo: g.grupo,
    faixa: g.faixa,
    idade: g.idade,
    genero: g.genero,
    bebe: g.bebe,
    status: g.status,
    provavel: g.provavel,
    convite_enviado: g.conviteEnviado,
    obs: g.obs,
    // se o convidado restaurado não tinha slug (backup de versão antiga), gera um novo
    slug: g.slug || Math.random().toString(36).slice(2, 12),
    vagas: g.vagas ?? null,
    confirmados_qtd: g.confirmadosQtd ?? null,
    familia_grupo_slug: g.familiaGrupoSlug ?? null,
    familia_grupo_nome: g.familiaGrupoNome ?? null,
  }));
  const { error } = await supabase.from(TABLE).upsert(rows);
  if (error) {
    console.error('Falha ao restaurar convidados no Supabase:', error.message);
    toast('Falha ao gravar os convidados restaurados no banco - veja o console.');
  }
}

/** Atualiza só os campos informados de um convidado. */
export async function updateConvidado(id: string, patch: Partial<Convidado>): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from(TABLE).update(toRowPatch(patch)).eq('id', id);
  if (error) {
    console.error('Falha ao atualizar convidado no Supabase:', error.message);
    toast('Não salvou essa edição no banco - tenta de novo.');
  }
}

/**
 * Agrupa vários convidados já cadastrados sob um link de família compartilhado
 * — preserva todos os dados individuais (faixa, gênero, bebe) de cada um.
 */
export async function agruparEmFamilia(
  ids: string[],
  grupoSlug: string,
  grupoNome: string,
): Promise<void> {
  if (!supabase || ids.length === 0) return;
  const { error } = await supabase
    .from(TABLE)
    .update({ familia_grupo_slug: grupoSlug, familia_grupo_nome: grupoNome })
    .in('id', ids);
  if (error) {
    console.error('Falha ao agrupar convidados no Supabase:', error.message);
    toast('Não conseguiu agrupar no banco — tenta de novo.');
  }
}

/** Desfaz um grupo de família — os convidados voltam a ser individuais (nada mais muda). */
export async function desagruparFamilia(grupoSlug: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from(TABLE)
    .update({ familia_grupo_slug: null, familia_grupo_nome: null })
    .eq('familia_grupo_slug', grupoSlug);
  if (error) {
    console.error('Falha ao desagrupar família no Supabase:', error.message);
    toast('Não conseguiu desagrupar no banco — tenta de novo.');
  }
}

/** Remove um convidado. */
export async function deleteConvidado(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) {
    console.error('Falha ao remover convidado no Supabase:', error.message);
    toast('Não conseguiu remover no banco - tenta de novo.');
  }
}

const pendingPatches = new Map<string, Partial<Convidado>>();
const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();
/** Espera após a última edição de um convidado antes de gravar - evita uma
 *  requisição por tecla digitada. Patches sucessivos do mesmo convidado
 *  dentro da janela se acumulam num só envio. */
const UPDATE_DEBOUNCE_MS = 900;

/** Agenda a atualização de um convidado, mesclando com edições pendentes dele. */
export function scheduleConvidadoUpdate(id: string, patch: Partial<Convidado>): void {
  if (!supabase) return;

  pendingPatches.set(id, { ...(pendingPatches.get(id) ?? {}), ...patch });

  const existing = pendingTimers.get(id);
  if (existing) clearTimeout(existing);

  pendingTimers.set(
    id,
    setTimeout(() => {
      pendingTimers.delete(id);
      const toSend = pendingPatches.get(id);
      pendingPatches.delete(id);
      if (toSend) void updateConvidado(id, toSend);
    }, UPDATE_DEBOUNCE_MS),
  );
}

/**
 * Assina mudanças em tempo real na tabela (INSERT/UPDATE/DELETE) - é o que
 * faz um RSVP de convidado aparecer na aba Convidados sem precisar recarregar.
 * Retorna uma função para cancelar a assinatura.
 */
export function subscribeConvidados(onChange: () => void): () => void {
  const client = supabase;
  if (!client) return () => {};
  const channel = client
    .channel('convidados-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, () => onChange())
    .subscribe();
  return () => {
    void client.removeChannel(channel);
  };
}
