-- ============================================================
-- Migração: agrupar convidados individuais já cadastrados sob um link
-- compartilhado, sem perder nenhum dado individual (gênero, bebe, etc).
-- ============================================================
-- Diferente da "família por vagas" (migration_familias.sql, que é um
-- placeholder sem nomes), isso agrupa convidados DE VERDADE, já cadastrados
-- com seus próprios dados. `familia_grupo_slug` é o token do link
-- compartilhado — todo mundo com o mesmo valor faz parte do mesmo grupo.
-- Cada convidado continua tendo seu `slug` individual funcionando também.
--
-- Rode uma vez no SQL Editor do Supabase, depois das migrações anteriores.
-- Idempotente.
-- ============================================================

alter table public.convidados add column if not exists familia_grupo_slug text;
alter table public.convidados add column if not exists familia_grupo_nome text;

create index if not exists idx_convidados_familia_grupo_slug
  on public.convidados (familia_grupo_slug);

-- ------------------------------------------------------------
-- Leitura pública do grupo: nome da família + status de cada membro pelo nome.
-- Nunca expõe o `id` interno — só o slug individual de cada um (pra permitir
-- trocar a resposta de uma pessoa específica depois).
-- ------------------------------------------------------------
create or replace function public.rpc_get_convite_grupo(p_slug text)
returns table (
  familia_nome text,
  membro_slug text,
  membro_nome text,
  membro_status text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select c.familia_grupo_nome, c.slug, c.nome, c.status
  from public.convidados c
  where c.familia_grupo_slug = p_slug
  order by c.nome;
end;
$$;

revoke all on function public.rpc_get_convite_grupo(text) from public;
grant execute on function public.rpc_get_convite_grupo(text) to anon, authenticated;

-- ------------------------------------------------------------
-- Confirma/recusa UM membro do grupo — só se ele realmente pertencer ao
-- grupo do slug informado (checagem dupla: não dá pra usar o link de um
-- grupo pra mexer em alguém de fora dele).
-- ------------------------------------------------------------
create or replace function public.rpc_confirmar_membro_grupo(
  p_grupo_slug text,
  p_membro_slug text,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('confirmado', 'recusado') then
    raise exception 'status inválido: %', p_status;
  end if;

  update public.convidados
  set status = p_status
  where slug = p_membro_slug
    and familia_grupo_slug = p_grupo_slug;

  if not found then
    raise exception 'membro não encontrado neste grupo';
  end if;
end;
$$;

revoke all on function public.rpc_confirmar_membro_grupo(text, text, text) from public;
grant execute on function public.rpc_confirmar_membro_grupo(text, text, text) to anon, authenticated;
