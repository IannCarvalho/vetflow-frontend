# `src/routes` — Roteamento

[← Voltar ao README do frontend](../../README.md)

Configuração de rotas do React Router: mapeamento de URL → [página](../pages/README.md), proteção de rotas e utilitários de navegação.

## Responsabilidade

- Declarar a árvore de rotas e qual [layout](../layouts/README.md) + [page](../pages/README.md) cada caminho renderiza.
- Proteger rotas autenticadas e tratar erros de rota.
- Oferecer hooks de navegação reutilizáveis.

## Arquivos e subpastas

| Item | Papel |
| --- | --- |
| `sections.tsx` | Definição central das rotas (lazy loading por página). |
| `protected-route.tsx` | Guard que exige sessão autenticada. |
| `hooks/` | `use-router.ts`, `use-pathname.ts` — navegação programática. |
| `components/` | `router-link.tsx` (link integrado ao MUI), `error-boundary.tsx`. |

## Convenções

- Toda nova tela entra como rota em `sections.tsx`, apontando para uma página de [`src/pages`](../pages/README.md).
- Use os hooks desta pasta (`use-router`, `use-pathname`) em vez de importar o React Router direto nos componentes.
- Rotas privadas devem passar por `protected-route.tsx`.
