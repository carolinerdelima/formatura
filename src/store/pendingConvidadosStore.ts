import { create } from 'zustand';

interface PendingState {
  /** IDs de convidados cuja gravação no Supabase ainda não foi confirmada. */
  pending: Set<string>;
  marcar: (id: string) => void;
  desmarcar: (id: string) => void;
}

/**
 * Rastreia convidados recém-criados que ainda não confirmaram a gravação no
 * banco - evita que o link seja copiado antes de existir de verdade do outro
 * lado (o RSVP daria "convite não encontrado" nesse intervalo).
 */
export const usePendingConvidadosStore = create<PendingState>()((set) => ({
  pending: new Set(),
  marcar: (id) =>
    set((s) => ({ pending: new Set(s.pending).add(id) })),
  desmarcar: (id) =>
    set((s) => {
      const next = new Set(s.pending);
      next.delete(id);
      return { pending: next };
    }),
}));
