import { create } from 'zustand';

export type PrintTarget = 'festa' | 'colacao';

interface PrintTargetState {
  target: PrintTarget;
  setTarget: (t: PrintTarget) => void;
}

/**
 * Só existe uma área de impressão no DOM (`#print-guests`); esse store decide
 * qual lista de convidados ela deve mostrar no momento do `window.print()`.
 */
export const usePrintTargetStore = create<PrintTargetState>()((set) => ({
  target: 'festa',
  setTarget: (target) => set({ target }),
}));
