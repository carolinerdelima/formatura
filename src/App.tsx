import { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { toast } from './components/toastStore';
import { Bebida } from './features/bebida/Bebida';
import { Colacao } from './features/colacao/Colacao';
import { Convidados } from './features/convidados/Convidados';
import { PrintGuestList } from './features/convidados/PrintGuestList';
import { Decoracao } from './features/decoracao/Decoracao';
import { Gastos } from './features/gastos/Gastos';
import { Inicio } from './features/inicio/Inicio';
import { Operacional } from './features/operacional/Operacional';
import { Papelaria } from './features/papelaria/Papelaria';
import { Pessoal } from './features/pessoal/Pessoal';
import { isPersistent, useStore } from './store/useStore';
import type { TabId } from './types';

const VIEWS: Record<TabId, () => JSX.Element> = {
  inicio: Inicio,
  comida: () => <Operacional cat="comida" />,
  bebida: Bebida,
  decoracao: Decoracao,
  musica: () => <Operacional cat="musica" comInspiracoes />,
  papelaria: Papelaria,
  convidados: Convidados,
  colacao: Colacao,
  pessoal: Pessoal,
  gastos: Gastos,
};

export default function App() {
  const tab = useStore((s) => s.tab);
  const View = VIEWS[tab] ?? Inicio;

  // volta ao topo ao trocar de aba (mesmo comportamento da versão HTML)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [tab]);

  useEffect(() => {
    if (!isPersistent()) {
      const t = window.setTimeout(
        () => toast('Sem localStorage disponível - os dados ficam só nesta sessão'),
        600,
      );
      return () => window.clearTimeout(t);
    }
  }, []);

  return (
    <>
      <div className="app">
        <Sidebar />
        <main className="main">
          <View />
        </main>
      </div>
      <Toast />
      <PrintGuestList />
    </>
  );
}
