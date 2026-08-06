import { useState } from 'react';

/** Input + botão para adicionar item a uma lista (Enter também adiciona). */
export function InlineAdd({
  placeholder,
  onAdd,
  label = '+ Adicionar',
}: {
  placeholder: string;
  onAdd: (valor: string) => void;
  label?: string;
}) {
  const [v, setV] = useState('');

  const submit = () => {
    const t = v.trim();
    if (!t) return;
    onAdd(t);
    setV('');
  };

  return (
    <div className="inline-add">
      <input
        value={v}
        placeholder={placeholder}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
      />
      <button type="button" className="btn sm" onClick={submit}>
        {label}
      </button>
    </div>
  );
}
