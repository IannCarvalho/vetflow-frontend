# `src/pages` — Páginas (telas)

[← Voltar ao README do frontend](../../README.md)

Componentes de página de alto nível, um por rota. Orquestram hooks de dados, layout e os componentes de [`src/sections`](../sections/README.md) para montar cada tela completa.

## Responsabilidade

- Representar o destino de cada rota declarada em [`src/routes`](../routes/README.md).
- Compor dados ([hooks](../hooks/README.md)) + apresentação ([sections](../sections/README.md) e [components](../components/README.md)).
- Não conter lógica de rede direta — isso vem de hooks/api.

## Páginas principais

| Arquivo | Tela |
| --- | --- |
| `dashboard-vetflow.tsx` | Dashboard inicial com métricas. |
| `clientes.tsx` / `client-pets.tsx` | Clientes e pets de um cliente. |
| `pets.tsx` | Lista de pets. |
| `pet-prontuario.tsx` / `pet-consultas.tsx` / `pet-vacinas.tsx` | Prontuário, consultas e vacinas do pet. |
| `pet-receitas.tsx` / `pet-anexos.tsx` | Receitas e anexos do pet. |
| `consultas.tsx` / `vacinas.tsx` | Consultas e vacinas (visão geral). |
| `agenda.tsx` | Agenda de atendimentos. |
| `catalogo.tsx` | Catálogo de produtos/serviços. |
| `financeiro.tsx` / `financeiro-dashboard.tsx` | Financeiro e painel financeiro. |
| `account.tsx` | Conta do usuário. |
| `sign-in.tsx` | Login. |
| `page-not-found.tsx` | 404. |

## Convenções

- Uma página = uma rota; o roteamento (lazy load, guards) está em [`src/routes`](../routes/README.md).
- Diálogos e formulários específicos de recurso vêm de [`src/sections`](../sections/README.md).
