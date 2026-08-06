# Formatura da Carol — "Golden Hour at the Farm"

App local de organização da festa de formatura (Ciência da Computação, 29/08/2026,
Churrascaria Família Strapazzon — Farroupilha/RS). Migrado do HTML single-file
original para **Vite + React + TypeScript**, com hot reload e sem perder nenhuma
funcionalidade nem a identidade visual.

## Como rodar

```bash
npm install
npm run dev      # http://localhost:5173 (abre sozinho), com hot reload
```

Outros scripts:

| Script | O que faz |
| --- | --- |
| `npm run build` | Typecheck (`tsc -b`) + build de produção em `dist/` |
| `npm run preview` | Serve o build de produção |
| `npm run lint` | ESLint (flat config, TypeScript + react-hooks) |
| `npm run format` | Prettier em `src/` e nos arquivos de config |

## Estrutura de pastas

Convenção **por feature**, com uma pasta de componentes compartilhados. Cada aba do
app é uma feature; o que aparece em mais de uma aba (checklist, lista de compras,
inspirações) mora em `components/`.

```
src/
├── main.tsx                  # entry point
├── App.tsx                   # shell + roteador de abas (mapa TabId → view)
├── types.ts                  # TODO o modelo de dados (sem `any` em lugar nenhum)
├── lib/
│   ├── format.ts             # uid, brl(), parseValor(), datas
│   └── catalogo.ts           # metadados das categorias, abas e paleta
├── hooks/
│   └── useCountdown.ts       # contador regressivo ao vivo (1s)
├── store/
│   ├── useStore.ts           # store Zustand: estado + todas as actions
│   ├── persistence.ts        # StorageAdapter (localStorage) + normalize/migração
│   ├── selectors.ts          # dados derivados: totais, guestMetrics()
│   └── seed.ts               # estado inicial com os dados reais da festa
├── components/               # UI compartilhada entre abas
│   ├── ui.tsx                # Card, Stat, Chip, Note, PillToggle, ViewHead…
│   ├── Sidebar.tsx           # navegação + backup/restauração JSON
│   ├── ChecklistBlock.tsx    # checklist de pendências (qualquer aba operacional)
│   ├── ComprasBlock.tsx      # "coisas a comprar" (alimenta a aba Gastos)
│   ├── InspiracoesBlock.tsx  # lista de referências (título + link)
│   ├── BuyRow.tsx            # linha editável de compra/gasto
│   ├── ValorInput.tsx        # campo em BRL (formata fora de foco, livre ao digitar)
│   ├── Toast.tsx             # aviso rápido
│   └── toastStore.ts         # `toast('mensagem')` chamável de qualquer lugar
├── features/
│   ├── inicio/               # hero, contador, resumo, paleta, dados da festa
│   ├── operacional/          # view genérica: Comida e Música & Luz
│   ├── bebida/               # litros de chopp + card "Quem bebe" com busca
│   ├── decoracao/            # equilíbrio de estilos, flores, mesa de doces
│   ├── papelaria/            # convite, mesa de presentes + PIX, peças físicas
│   ├── convidados/           # CRUD, estatísticas, perfil de lembrancinhas, PDF
│   ├── pessoal/              # vestido, maquiagem, cabelo, acessórios, calçado
│   └── gastos/               # consolidado por categoria + gasto avulso
└── styles/                   # CSS global portado do HTML original
    ├── tokens.css            # as 9 cores da paleta + tipografia + sombras
    ├── base.css              # reset, layout, sidebar, responsivo
    ├── components.css        # cards, pills, stats, hero, checklists…
    └── print.css             # folha de impressão da lista de convidados
```

## Decisões de arquitetura

- **Zustand em vez de Context API.** O estado é um objeto grande e muito editado
  (cada tecla digitada num campo de valor). Com Context, qualquer alteração
  re-renderiza a árvore inteira; com Zustand cada componente assina só a fatia que
  usa (`useStore((s) => s.compras)`).
- **Persistência atrás de um adapter.** `store/persistence.ts` expõe a interface
  `StorageAdapter` (`load` / `save` / `isPersistent`). Hoje a implementação é
  localStorage; para trocar por um backend, basta escrever outro adapter e mudar a
  linha `const storage = …` em `useStore.ts` — nenhum componente conhece o storage.
- **`normalize()` migra dados antigos.** Na primeira execução o app lê a chave
  `festaFormatura_carol_v1` (do HTML original) se a nova ainda não existir, e
  converte o antigo campo `menor: boolean` para a `faixa` explícita
  (adulto/criança/adolescente). Nenhum dado se perde na migração.
- **CSS global, não CSS-in-JS.** O CSS original é a fonte de verdade do visual —
  portá-lo literalmente (com os hex exatos em `tokens.css`) preserva o "clima"
  melhor do que reconstruí-lo. As classes seguem o mesmo vocabulário de antes
  (`.card`, `.stat`, `.pill-toggle`, `.hero`), então dá pra comparar lado a lado.
- **PDF via `window.print()`, sem lib.** `PrintGuestList` fica sempre montada e
  invisível; o `@media print` esconde o app e revela só ela. O resultado é o mesmo
  layout na paleta da festa, sem somar ~500 kB de `jspdf`/`@react-pdf/renderer` ao
  bundle e sem uma segunda implementação do layout para manter. O botão
  "Exportar PDF" abre o diálogo; é só escolher "Salvar como PDF" no destino.

## Dados e backup

Tudo é salvo automaticamente no `localStorage` a cada alteração (a sidebar pisca
"Salvo ✓"). Na sidebar também ficam:

- **⬇️ Backup (.json)** — baixa o estado completo em `formatura-carol-backup-AAAA-MM-DD.json`.
- **⬆️ Restaurar backup** — carrega um `.json` desses de volta (passa pelo mesmo
  `normalize()`, então backups antigos continuam funcionando).

Se o navegador bloquear o localStorage, o app segue funcionando só naquela sessão e
avisa por um toast — vale fazer backup manual nesse caso.

## Regressões visuais conhecidas do HTML original (já prevenidas aqui)

1. `min-width: 0` explícito em `.main`, `.grid > *`, `.stat`, `.buyrow > *` e
   `.guest-card > *` — sem isso o conteúdo estoura a viewport em vez de encolher.
2. Rótulos de UI sempre com espaço ("Crianças / Adolescentes", nunca grudado), mais
   `overflow-wrap: anywhere` como rede de segurança em `.stat .l`, `.chip` e nos
   nomes das listas.
3. Todos os `<select>` são componentes controlados do React (`value` + `onChange`),
   então não existe o problema de `input` não disparar em `<select>`.
