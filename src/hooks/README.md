# `src/hooks` — Hooks de dados (React Query)

[← Voltar ao README do frontend](../../README.md)

Hooks que encapsulam o acesso a dados via [TanStack React Query](https://tanstack.com/query), ligando a [camada de API](../api/README.md) ao estado de servidor consumido pelas telas.

## Responsabilidade

- Expor `useQuery`/`useMutation` por recurso, com chaves de cache, invalidação e estados (loading/error) prontos.
- Encapsular as chamadas de [`src/api`](../api/README.md) para que páginas e sections não lidem com Axios diretamente.
- Centralizar política de cache e refetch (ex.: polling de notificações).

## Arquivos

| Hook | Recurso |
| --- | --- |
| `useClientsQuery.ts` | Clientes (tutores). |
| `usePetsQuery.ts` | Pets. |
| `useAppointmentsQuery.ts` | Agendamentos. |
| `useConsultationsQuery.ts` | Consultas / prontuários. |
| `usePrescriptionsQuery.ts` | Receitas. |
| `useVaccinesQuery.ts` | Vacinas. |
| `useAttachmentsQuery.ts` | Anexos. |
| `useCatalogQuery.ts` | Catálogo de produtos/serviços. |
| `useInvoicesQuery.ts` | Faturas / financeiro. |
| `useDashboardQuery.ts` | Métricas do dashboard. |
| `useNotificationsQuery.ts` | Notificações (com polling). |

## Convenções

- Um hook por recurso; a chamada HTTP real sempre vem de [`src/api`](../api/README.md).
- Padronize as query keys por recurso para invalidação previsível após mutations.
- Tipos de entrada/saída vêm de [`src/types`](../types/README.md).
