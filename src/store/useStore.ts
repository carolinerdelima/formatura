import { create } from 'zustand';
import { uid } from '../lib/format';
import { localStorageAdapter, normalize, type StorageAdapter } from './persistence';
import { seed } from './seed';
import type {
  AppState,
  Categoria,
  CategoriaInspiracao,
  CategoriaOperacional,
  Convidado,
  Festa,
  ItemCompra,
  Pix,
  TabId,
} from '../types';

/** Adapter de persistência em uso — trocar aqui para plugar um backend. */
const storage: StorageAdapter = localStorageAdapter;

/** Convidado novo com os valores padrão (usado tanto pela festa quanto pela colação). */
function novoConvidado(nome: string, grupo: string): Convidado {
  return {
    id: uid(),
    nome,
    grupo,
    faixa: 'adulto',
    idade: null,
    genero: '',
    bebe: true,
    status: 'pendente',
    provavel: true,
    conviteEnviado: false,
    obs: '',
  };
}

interface Actions {
  setTab: (tab: TabId) => void;

  // festa / pix / bebida
  setFesta: <K extends keyof Festa>(campo: K, valor: Festa[K]) => void;
  setPix: <K extends keyof Pix>(campo: K, valor: Pix[K]) => void;
  setChopp: (litros: number | null) => void;

  // checklists
  addChecklistItem: (cat: CategoriaOperacional, texto: string) => void;
  toggleChecklistItem: (cat: CategoriaOperacional, id: string) => void;
  editChecklistItem: (cat: CategoriaOperacional, id: string, texto: string) => void;
  removeChecklistItem: (cat: CategoriaOperacional, id: string) => void;

  // compras
  addCompra: (cat: Categoria, nome: string, valor?: number) => void;
  editCompra: <K extends keyof ItemCompra>(id: string, campo: K, valor: ItemCompra[K]) => void;
  toggleCompraPago: (id: string) => void;
  toggleCompraReservado: (id: string) => void;
  removeCompra: (id: string) => void;

  // inspirações
  addInspiracao: (cat: CategoriaInspiracao, titulo: string) => void;
  editInspiracao: (
    cat: CategoriaInspiracao,
    id: string,
    campo: 'titulo' | 'link',
    v: string,
  ) => void;
  removeInspiracao: (cat: CategoriaInspiracao, id: string) => void;

  // convidados da festa
  addConvidado: (nome: string, grupo: string) => void;
  editConvidado: <K extends keyof Convidado>(id: string, campo: K, valor: Convidado[K]) => void;
  toggleConvite: (id: string) => void;
  toggleBebe: (id: string) => void;
  toggleProvavel: (id: string) => void;
  removeConvidado: (id: string) => void;

  // convidados da colação de grau (lista independente)
  addConvidadoColacao: (nome: string, grupo: string) => void;
  editConvidadoColacao: <K extends keyof Convidado>(
    id: string,
    campo: K,
    valor: Convidado[K],
  ) => void;
  toggleConviteColacao: (id: string) => void;
  toggleBebeColacao: (id: string) => void;
  toggleProvavelColacao: (id: string) => void;
  removeConvidadoColacao: (id: string) => void;

  // backup
  replaceState: (raw: unknown) => void;
  reset: () => void;
}

export type Store = AppState & Actions;

/** Aplica o patch, persiste e devolve o próximo estado. */
function persistFrom(state: Store, patch: Partial<AppState>): Partial<AppState> {
  const next: AppState = {
    festa: state.festa,
    bebida: state.bebida,
    pix: state.pix,
    checklists: state.checklists,
    inspiracoes: state.inspiracoes,
    compras: state.compras,
    convidados: state.convidados,
    convidadosColacao: state.convidadosColacao,
    tab: state.tab,
    ...patch,
  };
  storage.save(next);
  return patch;
}

export const useStore = create<Store>()((set) => {
  const update = (fn: (s: Store) => Partial<AppState>) => set((s) => persistFrom(s, fn(s)));

  return {
    ...storage.load(),

    setTab: (tab) => update(() => ({ tab })),

    setFesta: (campo, valor) => update((s) => ({ festa: { ...s.festa, [campo]: valor } })),
    setPix: (campo, valor) => update((s) => ({ pix: { ...s.pix, [campo]: valor } })),
    setChopp: (choppLitros) => update(() => ({ bebida: { choppLitros } })),

    addChecklistItem: (cat, texto) =>
      update((s) => ({
        checklists: {
          ...s.checklists,
          [cat]: [...s.checklists[cat], { id: uid(), texto, feito: false }],
        },
      })),
    toggleChecklistItem: (cat, id) =>
      update((s) => ({
        checklists: {
          ...s.checklists,
          [cat]: s.checklists[cat].map((i) => (i.id === id ? { ...i, feito: !i.feito } : i)),
        },
      })),
    editChecklistItem: (cat, id, texto) =>
      update((s) => ({
        checklists: {
          ...s.checklists,
          [cat]: s.checklists[cat].map((i) => (i.id === id ? { ...i, texto } : i)),
        },
      })),
    removeChecklistItem: (cat, id) =>
      update((s) => ({
        checklists: { ...s.checklists, [cat]: s.checklists[cat].filter((i) => i.id !== id) },
      })),

    addCompra: (categoria, nome, valor = 0) =>
      update((s) => ({
        compras: [
          ...s.compras,
          { id: uid(), categoria, nome, valor, pago: false, reservado: false, link: '', obs: '' },
        ],
      })),
    editCompra: (id, campo, valor) =>
      update((s) => ({
        compras: s.compras.map((c) => (c.id === id ? { ...c, [campo]: valor } : c)),
      })),
    toggleCompraPago: (id) =>
      update((s) => ({
        compras: s.compras.map((c) => (c.id === id ? { ...c, pago: !c.pago } : c)),
      })),
    toggleCompraReservado: (id) =>
      update((s) => ({
        compras: s.compras.map((c) => (c.id === id ? { ...c, reservado: !c.reservado } : c)),
      })),
    removeCompra: (id) => update((s) => ({ compras: s.compras.filter((c) => c.id !== id) })),

    addInspiracao: (cat, titulo) =>
      update((s) => ({
        inspiracoes: {
          ...s.inspiracoes,
          [cat]: [...s.inspiracoes[cat], { id: uid(), titulo, link: '' }],
        },
      })),
    editInspiracao: (cat, id, campo, v) =>
      update((s) => ({
        inspiracoes: {
          ...s.inspiracoes,
          [cat]: s.inspiracoes[cat].map((i) => (i.id === id ? { ...i, [campo]: v } : i)),
        },
      })),
    removeInspiracao: (cat, id) =>
      update((s) => ({
        inspiracoes: { ...s.inspiracoes, [cat]: s.inspiracoes[cat].filter((i) => i.id !== id) },
      })),

    addConvidado: (nome, grupo) =>
      update((s) => ({ convidados: [...s.convidados, novoConvidado(nome, grupo)] })),
    editConvidado: (id, campo, valor) =>
      update((s) => ({
        convidados: s.convidados.map((g) => (g.id === id ? { ...g, [campo]: valor } : g)),
      })),
    toggleConvite: (id) =>
      update((s) => ({
        convidados: s.convidados.map((g) =>
          g.id === id ? { ...g, conviteEnviado: !g.conviteEnviado } : g,
        ),
      })),
    toggleBebe: (id) =>
      update((s) => ({
        convidados: s.convidados.map((g) => (g.id === id ? { ...g, bebe: !g.bebe } : g)),
      })),
    toggleProvavel: (id) =>
      update((s) => ({
        convidados: s.convidados.map((g) =>
          g.id === id ? { ...g, provavel: !(g.provavel !== false) } : g,
        ),
      })),
    removeConvidado: (id) =>
      update((s) => ({ convidados: s.convidados.filter((g) => g.id !== id) })),

    addConvidadoColacao: (nome, grupo) =>
      update((s) => ({
        convidadosColacao: [...s.convidadosColacao, novoConvidado(nome, grupo)],
      })),
    editConvidadoColacao: (id, campo, valor) =>
      update((s) => ({
        convidadosColacao: s.convidadosColacao.map((g) =>
          g.id === id ? { ...g, [campo]: valor } : g,
        ),
      })),
    toggleConviteColacao: (id) =>
      update((s) => ({
        convidadosColacao: s.convidadosColacao.map((g) =>
          g.id === id ? { ...g, conviteEnviado: !g.conviteEnviado } : g,
        ),
      })),
    toggleBebeColacao: (id) =>
      update((s) => ({
        convidadosColacao: s.convidadosColacao.map((g) =>
          g.id === id ? { ...g, bebe: !g.bebe } : g,
        ),
      })),
    toggleProvavelColacao: (id) =>
      update((s) => ({
        convidadosColacao: s.convidadosColacao.map((g) =>
          g.id === id ? { ...g, provavel: !(g.provavel !== false) } : g,
        ),
      })),
    removeConvidadoColacao: (id) =>
      update((s) => ({
        convidadosColacao: s.convidadosColacao.filter((g) => g.id !== id),
      })),

    replaceState: (raw) => update(() => normalize(raw)),
    reset: () => update(() => seed()),
  };
});

/** `true` enquanto o localStorage estiver disponível. */
export const isPersistent = () => storage.isPersistent();
