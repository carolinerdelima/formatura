import { useEffect, useRef, useState } from 'react';
import { sair } from '../features/auth/authActions';
import { TABS } from '../lib/catalogo';
import { isPersistent, useStore } from '../store/useStore';
import type { AppState } from '../types';
import { toast } from './toastStore';

/** Monta o objeto puro de dados (sem as actions do store) para backup. */
function snapshot(s: AppState): AppState {
  return {
    festa: s.festa,
    bebida: s.bebida,
    pix: s.pix,
    checklists: s.checklists,
    inspiracoes: s.inspiracoes,
    compras: s.compras,
    convidados: s.convidados,
    convidadosColacao: s.convidadosColacao,
    tab: s.tab,
  };
}

export function Sidebar() {
  const tab = useStore((s) => s.tab);
  const setTab = useStore((s) => s.setTab);
  const replaceState = useStore((s) => s.replaceState);
  const fileRef = useRef<HTMLInputElement>(null);
  const [saveLabel, setSaveLabel] = useState(
    isPersistent() ? 'Salvo automaticamente' : 'Somente nesta sessão',
  );

  // pisca "Salvo ✓" a cada alteração do estado persistido
  useEffect(() => {
    let timer: number | undefined;
    const unsub = useStore.subscribe(() => {
      if (!isPersistent()) {
        setSaveLabel('Somente nesta sessão');
        return;
      }
      setSaveLabel('Salvo ✓');
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setSaveLabel('Salvo automaticamente'), 1400);
    });
    return () => {
      unsub();
      window.clearTimeout(timer);
    };
  }, []);

  const exportJSON = () => {
    const data = snapshot(useStore.getState());
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `formatura-carol-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Backup baixado');
  };

  const importJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data: unknown = JSON.parse(String(reader.result));
        if (!data || typeof data !== 'object') throw new Error('inválido');
        replaceState(data);
        toast('Backup restaurado ✓');
      } catch {
        toast('Arquivo inválido');
      }
    };
    reader.readAsText(file);
  };

  return (
    <aside className="side">
      <div className="brand">
        <div className="kicker">Janta de formatura</div>
        <h1>
          Formatura da <em>Carol</em>
        </h1>
        <div className="sub">Ciência da Computação</div>
      </div>

      <nav className="nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
          >
            <span className="ic">{t.ic}</span>
            <span className="txt">{t.label}</span>
          </button>
        ))}
      </nav>

      <div className="foot">
        <span>{saveLabel}</span>
        <button type="button" onClick={exportJSON}>
          ⬇️ Backup (.json)
        </button>
        <button type="button" onClick={() => fileRef.current?.click()}>
          ⬆️ Restaurar backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importJSON(f);
            e.target.value = '';
          }}
        />
        <button type="button" onClick={() => void sair()}>
          🚪 Sair
        </button>
      </div>
    </aside>
  );
}
