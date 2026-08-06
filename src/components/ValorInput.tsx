import { useState } from 'react';
import { brl, parseValor } from '../lib/format';

/**
 * Campo de valor em BRL: mostra formatado quando fora de foco e permite digitar
 * livre ("1.200,50", "1200.5", "R$ 90") enquanto editando. Cada tecla já
 * persiste o número parseado, então os totais atualizam ao vivo.
 */
export function ValorInput({
  valor,
  onChange,
  className = 'val',
  placeholder = 'R$ 0,00',
}: {
  valor: number;
  onChange: (n: number) => void;
  className?: string;
  placeholder?: string;
}) {
  const formatado = valor ? brl(valor) : '';
  // `null` = fora de edição (mostra formatado); string = rascunho em digitação
  const [rascunho, setRascunho] = useState<string | null>(null);

  return (
    <input
      className={className}
      placeholder={placeholder}
      value={rascunho ?? formatado}
      onFocus={() => setRascunho(valor ? String(valor).replace('.', ',') : '')}
      onChange={(e) => {
        setRascunho(e.target.value);
        onChange(parseValor(e.target.value));
      }}
      onBlur={() => setRascunho(null)}
    />
  );
}
