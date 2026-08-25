-- ============================================================
-- Migração: links de "família" (um link cobre um grupo de N pessoas)
-- ============================================================
-- Em vez de cadastrar cada pessoa da família com nome/faixa/gênero, você
-- cria UMA linha com o nome da família e quantas vagas ela tem (ex: "Família
-- Silva", 3 vagas). Gera um único link — quando abrem, escolhem quantos de
-- fato vão ("2 de 3") em vez do fluxo individual de confirmar/recusar.
--
-- É a MESMA tabela `convidados` de antes — uma linha vira "família" quando
-- `vagas` não é nulo. Convidados individuais continuam exatamente como
-- estavam (vagas fica nulo pra eles, sem nenhuma mudança de comportamento).
--
-- Rode uma vez no SQL Editor do Supabase, depois de já ter rodado
-- `migration_convite_rsvp.sql`. Idempotente.
-- ============================================================

alter table public.convidados add column if not exists vagas integer;
alter table public.convidados add column if not exists confirmados_qtd integer;

alter table public.convidados
  drop constraint if exists convidados_vagas_check;
alter table public.convidados
  add constraint convidados_vagas_check check (vagas is null or vagas >= 1);

alter table public.convidados
  drop constraint if exists convidados_confirmados_qtd_check;
alter table public.convidados
  add constraint convidados_confirmados_qtd_check
  check (confirmados_qtd is null or (confirmados_qtd >= 0 and confirmados_qtd <= coalesce(vagas, confirmados_qtd)));

-- ------------------------------------------------------------
-- Atualiza as funções públicas pra também expor/gravar vagas e confirmados_qtd
-- ------------------------------------------------------------
-- o retorno de rpc_get_convite ganhou colunas novas — Postgres não deixa só
-- substituir quando a "forma" do retorno muda, precisa apagar antes.
drop function if exists public.rpc_get_convite(text);

create or replace function public.rpc_get_convite(p_slug text)
returns table (
  nome text,
  status text,
  faixa text,
  genero text,
  vagas integer,
  confirmados_qtd integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select c.nome, c.status, c.faixa, c.genero, c.vagas, c.confirmados_qtd
  from public.convidados c
  where c.slug = p_slug;
end;
$$;

revoke all on function public.rpc_get_convite(text) from public;
grant execute on function public.rpc_get_convite(text) to anon, authenticated;

-- ganhou um parâmetro novo (p_confirmados_qtd) — apaga a versão de 4
-- parâmetros antes, senão fica com as duas versões coexistindo no banco.
drop function if exists public.rpc_confirmar_presenca(text, text, text, text);

create or replace function public.rpc_confirmar_presenca(
  p_slug text,
  p_status text,
  p_faixa text default null,
  p_genero text default null,
  p_confirmados_qtd integer default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_vagas integer;
begin
  if p_status not in ('confirmado', 'recusado') then
    raise exception 'status inválido: %', p_status;
  end if;

  if p_faixa is not null and p_faixa not in ('adulto', 'crianca', 'adolescente') then
    raise exception 'faixa inválida: %', p_faixa;
  end if;

  if p_genero is not null and p_genero not in ('', 'F', 'M') then
    raise exception 'gênero inválido: %', p_genero;
  end if;

  select vagas into v_vagas from public.convidados where slug = p_slug;
  if not found then
    raise exception 'convidado não encontrado';
  end if;

  if v_vagas is not null and p_confirmados_qtd is not null
     and (p_confirmados_qtd < 0 or p_confirmados_qtd > v_vagas) then
    raise exception 'quantidade confirmada inválida para % vagas', v_vagas;
  end if;

  update public.convidados
  set
    status = p_status,
    faixa = coalesce(nullif(p_faixa, ''), faixa),
    genero = coalesce(nullif(p_genero, ''), genero),
    confirmados_qtd = case when v_vagas is not null then p_confirmados_qtd else confirmados_qtd end
  where slug = p_slug;
end;
$$;

revoke all on function public.rpc_confirmar_presenca(text, text, text, text, integer) from public;
grant execute on function public.rpc_confirmar_presenca(text, text, text, text, integer) to anon, authenticated;
