import { create } from 'zustand';

interface ToastState {
  msg: string;
  visible: boolean;
  show: (msg: string) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  msg: '',
  visible: false,
  show: (msg) => set({ msg, visible: true }),
  hide: () => set({ visible: false }),
}));

/** Dispara um aviso rápido de qualquer lugar do app. */
export const toast = (msg: string) => useToastStore.getState().show(msg);
