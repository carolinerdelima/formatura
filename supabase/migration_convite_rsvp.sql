-- ============================================================
-- Migração: convidados vira tabela real + RSVP público seguro
-- ============================================================
-- Contexto: hoje TODO o estado do app (incluindo a lista de convidados)
-- mora dentro de UM blob JSON na tabela `formatura_state` (linha id='main'),
-- lido/escrito pela chave `anon` sem nenhuma restrição — ou seja, qualquer
-- pessoa com a chave pública (que já está no JS do site) lê e edita tudo.
--
-- Este script:
--   1. Cria uma tabela relacional `convidados` (uma linha por convidado).
--   2. Migra os convidados que já existem dentro do blob para essa tabela.
--   3. Tranca a tabela `convidados` E a `formatura_state` com RLS — só a
--      sua conta autenticada (admin) tem acesso direto a qualquer uma.
--   4. Cria duas funções RPC (SECURITY DEFINER) que são a ÚNICA porta de
--      entrada pública: leem/gravam só a linha do convidado pelo slug,
--      nunca a tabela inteira.
--
-- Rode isto uma vez no SQL Editor do seu projeto Supabase (Dashboard →
-- SQL Editor → New query → cole tudo → Run). É idempotente: pode rodar de
-- novo sem duplicar dados ou dar erro.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tabela `convidados` (festa) — uma linha por convidado
-- ------------------------------------------------------------
create table if not exists public.convidados (
  id               text primary key,
  nome             text not null default '',
  grupo            text not null default '',
  faixa            text not null default 'adulto'
                     check (faixa in ('adulto', 'crianca', 'adolescente')),
  idade            integer,
  genero           text not null default ''
                     check (genero in ('', 'F', 'M')),
  bebe             boolean not null default true,
  status           text not null default 'pendente'
                     check (status in ('pendente', 'confirmado', 'recusado')),
  provavel         boolean not null default true,
  convite_enviado  boolean not null default false,
  obs              text not null default '',
  -- token curto e único usado na URL pública /c/:slug — nunca o id interno
  slug             text not null unique
                     default substr(md5(random()::text || clock_timestamp()::text), 1, 10),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- updated_at sempre reflete a última alteração (inclusive as feitas pelo convidado)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_convidados_updated_at on public.convidados;
create trigger trg_convidados_updated_at
  before update on public.convidados
  for each row
  execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 2. Migração dos convidados que hoje estão dentro do blob JSON
--    (tabela `formatura_state`, linha id='main', campo data->'convidados')
--    Só insere quem ainda não existe na tabela nova (idempotente).
-- ------------------------------------------------------------
insert into public.convidados
  (id, nome, grupo, faixa, idade, genero, bebe, status, provavel, convite_enviado, obs)
select
  g.id,
  coalesce(g.nome, ''),
  coalesce(g.grupo, ''),
  coalesce(nullif(g.faixa, ''), 'adulto'),
  g.idade,
  coalesce(g.genero, ''),
  coalesce(g.bebe, true),
  coalesce(nullif(g.status, ''), 'pendente'),
  coalesce(g.provavel, true),
  coalesce(g."conviteEnviado", false),
  coalesce(g.obs, '')
from public.formatura_state fs,
  lateral jsonb_to_recordset(fs.data->'convidados') as g(
    id text, nome text, grupo text, faixa text, idade integer,
    genero text, bebe boolean, status text, provavel boolean,
    "conviteEnviado" boolean, obs text
  )
where fs.id = 'main'
  and g.id is not null
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 3. RLS — trava as duas tabelas. Ninguém não-autenticado acessa direto.
-- ------------------------------------------------------------

-- 3a. remove qualquer policy antiga (de qualquer nome) que hoje libere acesso,
--     em AMBAS as tabelas, para começar do zero com segurança.
do $$
declare
  pol record;
begin
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public' and tablename in ('convidados', 'formatura_state')
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

alter table public.convidados enable row level security;
alter table public.formatura_state enable row level security;

-- 3b. admin (sua conta autenticada) tem acesso total às duas tabelas.
create policy "admin_full_access_convidados"
on public.convidados
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "admin_full_access_formatura_state"
on public.formatura_state
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

-- Nenhuma policy para `anon` em nenhuma das duas tabelas — acesso direto
-- fica bloqueado por padrão. O convidado só entra pelas funções abaixo.

-- ------------------------------------------------------------
-- 4. Função pública de leitura — só os campos necessários da página do convidado
-- ------------------------------------------------------------
create or replace function public.rpc_get_convite(p_slug text)
returns table (
  nome text,
  status text,
  faixa text,
  genero text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select c.nome, c.status, c.faixa, c.genero
  from public.convidados c
  where c.slug = p_slug;
end;
$$;

revoke all on function public.rpc_get_convite(text) from public;
grant execute on function public.rpc_get_convite(text) to anon, authenticated;

-- ------------------------------------------------------------
-- 5. Função pública de confirmação — grava só a própria linha, pelo slug
-- ------------------------------------------------------------
create or replace function public.rpc_confirmar_presenca(
  p_slug text,
  p_status text,
  p_faixa text default null,
  p_genero text default null
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

  if p_faixa is not null and p_faixa not in ('adulto', 'crianca', 'adolescente') then
    raise exception 'faixa inválida: %', p_faixa;
  end if;

  if p_genero is not null and p_genero not in ('', 'F', 'M') then
    raise exception 'gênero inválido: %', p_genero;
  end if;

  update public.convidados
  set
    status = p_status,
    faixa  = coalesce(nullif(p_faixa, ''), faixa),
    genero = coalesce(nullif(p_genero, ''), genero)
  where slug = p_slug;

  if not found then
    raise exception 'convidado não encontrado';
  end if;
end;
$$;

revoke all on function public.rpc_confirmar_presenca(text, text, text, text) from public;
grant execute on function public.rpc_confirmar_presenca(text, text, text, text) to anon, authenticated;

-- ------------------------------------------------------------
-- 6. Realtime — permite que a área admin veja RSVPs chegando ao vivo,
--    sem precisar recarregar a página.
-- ------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'convidados'
  ) then
    alter publication supabase_realtime add table public.convidados;
  end if;
end $$;

-- ============================================================
-- Fim. Depois de rodar isto, confira em Table Editor → convidados
-- que os convidados migraram com um `slug` preenchido em cada linha.
-- ============================================================
