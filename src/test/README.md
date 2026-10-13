# `src/test` — Infraestrutura de testes

[← Voltar ao README do frontend](../../README.md)

Setup compartilhado da suíte de testes (Vitest + React Testing Library). **Não**
contém testes — eles vivem ao lado do código, como `*.test.ts(x)`.

## Responsabilidade

- Registrar os matchers do `@testing-library/jest-dom` no Vitest.
- Garantir o `cleanup()` do React Testing Library após cada teste, desmontando a
  árvore para não vazar estado entre casos.

## Arquivos

| Item | Papel |
| --- | --- |
| `setup.ts` | Carregado por `setupFiles` em `vite.config.ts`; importa os matchers e registra o `afterEach(cleanup)`. |

## Convenções

- Escreva os testes junto do código (`src/**/*.{test,spec}.{ts,tsx}`), que é o
  `include` configurado em `vite.config.ts` — este diretório é só o preâmbulo
  comum a todos.
- Rode com `npm test` (`vitest run`). O ambiente é `jsdom`.
