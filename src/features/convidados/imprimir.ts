import { usePrintTargetStore, type PrintTarget } from './printTargetStore';

/**
 * Abre o diálogo de impressão do navegador com o título certo do arquivo.
 * A view `PrintGuestList` fica sempre montada mas invisível; o `@media print`
 * revela só ela, então "Salvar como PDF" gera o documento formatado — para a
 * lista da festa ou da colação, dependendo do `target`.
 */
export function imprimirListaConvidados(target: PrintTarget = 'festa') {
  usePrintTargetStore.getState().setTarget(target);
  const oldTitle = document.title;
  document.title =
    target === 'colacao'
      ? 'Lista de Convidados - Colação Carol'
      : 'Lista de Convidados - Formatura Carol';
  window.print();
  document.title = oldTitle;
}
