# `src/contexts` — Contextos React

[← Voltar ao README do frontend](../../README.md)

Estado global compartilhado via React Context. Hoje concentra a **autenticação**
do usuário logado.

## Responsabilidade

- Prover estado de sessão (usuário logado + flag `isAuthenticated`) para toda a
  árvore de componentes, sem prop drilling.
- Persistir a sessão no `localStorage` (`auth_token` + `auth_user`) e reidratá-la
  no boot, para a sessão sobreviver a um refresh da página.
- Expor as ações de ciclo de vida da sessão (`login`, `register`, `logout`,
  `setAuthData`, `updateUser`) e o hook de consumo (`useAuth`).

## Arquivos

| Item | Papel |
| --- | --- |
| `auth-context.tsx` | `AuthProvider` (estado + ações de sessão) e o hook `useAuth`. |
| `auth-context.test.tsx` | Testes do provider: login/register populam estado e `localStorage`, `logout` limpa. |

## Convenções

- Consuma a sessão sempre via `useAuth()` — ele lança se usado fora do
  `AuthProvider`, o que evita ler `localStorage` espalhado pelos componentes.
- O token nunca é lido direto da sessão por outros módulos; o
  [`api/axios`](../api/README.md) é quem anexa o `Authorization` nas chamadas.
- Novas fatias de estado global entram como contextos próprios nesta pasta, cada
  uma com seu `Provider` + hook de consumo.
