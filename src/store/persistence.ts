import { uid } from '../lib/format';
import type {
  AppState,
  CategoriaInspiracao,
  CategoriaOperacional,
  Convidado,
  ItemCompra,
} from '../types';
import { seed } from './seed';

/** Chave do app HTML single-file original (migrada automaticamente). */
const LEGACY_KEY = 'festaFormatura_carol_v1';
export const STORAGE_KEY = 'festaFormatura_carol_v2';

/**
 * Camada de persistência isolada. Hoje é localStorage; para trocar por uma API
 * basta reimplementar `load`/`save` aqui - nenhum componente conhece o storage.
 */
export interface StorageAdapter {
  load(): AppState;
  save(state: AppState): void;
  /** `false` quando o localStorage não está disponível (modo somente-sessão). */
  isPersistent(): boolean;
}

/** Preenche campos ausentes/legados para o estado ficar sempre completo. */
export function normalize(raw: unknown): AppState {
  const base = seed();
  if (!raw || typeof raw !== 'object') return base;
  const s = raw as Partial<AppState> & Record<string, unknown>;

  const checklists = { ...base.checklists } as Record<
    CategoriaOperacional,
    AppState['checklists'][CategoriaOperacional]
  >;
  if (s.checklists && typeof s.checklists === 'object') {
    for (const key of Object.keys(checklists) as CategoriaOperacional[]) {
      const v = (s.checklists as Record<string, unknown>)[key];
      if (Array.isArray(v)) checklists[key] = v;
    }
  }

  const inspiracoes = { ...base.inspiracoes };
  if (s.inspiracoes && typeof s.inspiracoes === 'object') {
    for (const key of Object.keys(inspiracoes) as CategoriaInspiracao[]) {
      const v = (s.inspiracoes as Record<string, unknown>)[key];
      if (Array.isArray(v)) inspiracoes[key] = v;
    }
  }

  const compras: ItemCompra[] = Array.isArray(s.compras)
    ? s.compras.map((c: Partial<ItemCompra>) => ({
        id: c.id ?? uid(),
        categoria: c.categoria ?? 'comida',
        nome: c.nome ?? '',
        valor: Number(c.valor) || 0,
        pago: c.pago ?? false,
        reservado: c.reservado ?? false,
        link: c.link ?? '',
        obs: c.obs ?? '',
      }))
    : base.compras;

  const convidados: Convidado[] = Array.isArray(s.convidados)
    ? s.convidados.map((g) => migraConvidado(g as Partial<Convidado> & { menor?: boolean }))
    : [];

  const convidadosColacao: Convidado[] = Array.isArray(s.convidadosColacao)
    ? s.convidadosColacao.map((g) => migraConvidado(g as Partial<Convidado> & { menor?: boolean }))
    : [];

  return {
    festa: { ...base.festa, ...(s.festa ?? {}) },
    bebida: { choppLitros: s.bebida?.choppLitros ?? null },
    pix: { ...base.pix, ...(s.pix ?? {}) },
    checklists,
    inspiracoes,
    compras,
    convidados,
    convidadosColacao,
    // `_tab` era o nome do campo na versão HTML original
    tab: (s.tab ?? (s['_tab'] as AppState['tab']) ?? 'inicio') as AppState['tab'],
  };
}

/** Migração: "menor" (booleano) + idade inferida vira "faixa" explícita. */
function migraConvidado(g: Partial<Convidado> & { menor?: boolean }): Convidado {
  let faixa = g.faixa;
  if (faixa === undefined) {
    if (g.menor) faixa = g.idade != null && Number(g.idade) < 12 ? 'crianca' : 'adolescente';
    else faixa = 'adulto';
  }
  return {
    id: g.id ?? uid(),
    nome: g.nome ?? '',
    grupo: g.grupo ?? '',
    faixa,
    idade: g.idade ?? null,
    genero: g.genero ?? '',
    bebe: g.bebe !== false,
    status: g.status ?? 'pendente',
    provavel: g.provavel !== false,
    conviteEnviado: g.conviteEnviado ?? false,
    obs: g.obs ?? '',
  };
}

/** Adapter de localStorage com fallback silencioso para memória. */
export const localStorageAdapter: StorageAdapter = (() => {
  let persistent = true;

  return {
    isPersistent: () => persistent,
    load() {
      try {
        const raw =
          window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_KEY);
        return raw ? normalize(JSON.parse(raw)) : seed();
      } catch {
        persistent = false;
        return seed();
      }
    },
    save(state) {
      if (!persistent) return;
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        persistent = false;
      }
    },
  };
})();
