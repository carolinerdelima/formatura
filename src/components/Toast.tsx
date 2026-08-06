import { useEffect } from 'react';
import { useToastStore } from './toastStore';

export function Toast() {
  const { msg, visible, hide } = useToastStore();

  useEffect(() => {
    if (!visible) return;
    const t = window.setTimeout(hide, 1800);
    return () => window.clearTimeout(t);
  }, [visible, msg, hide]);

  return (
    <div id="toast" className={visible ? 'show' : ''}>
      {msg}
    </div>
  );
}
