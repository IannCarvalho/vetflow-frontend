# `src/api` — Camada de acesso à API

[← Voltar ao README do frontend](../../README.md)

Clientes HTTP que falam com o backend VetFlow. Cada arquivo expõe funções tipadas (CRUD) para um recurso específico, isolando o resto do app dos detalhes de rede.

## Responsabilidade

- Centralizar a instância do Axios e sua configuração (base URL, interceptors de auth/erro).
- Oferecer um módulo por recurso, retornando dados já tipados (ver [`src/types`](../types/README.md)).
- Nunca conter lógica de UI ou de estado — isso vive nos [hooks](../hooks/README.md) e nas [pages](../pages/README.md)/[sections](../sections/README.md).

## Arquivos

| Arquivo | Papel |
| --- | --- |
| `axios.ts` | Instância base do Axios + interceptors (token JWT, tratamento de 401). |
| `createEntityApi.ts` | Fábrica genérica de funções CRUD (`getAll`/`getById`/`create`/`update`/`remove`) reusada pelos módulos de recurso. |
| `agentApi.ts` | Cliente HTTP do Assistente VetFlow (vetflow-agent), separado do backend — não injeta o JWT nem redireciona no 401. |
| `authApi.ts` | Login, logout, refresh e fluxo de autenticação. |
| `usersApi.ts` | Perfil, senha e dados do usuário logado. |
| `clientsApi.ts` | CRUD de clientes (tutores). |
| `petsApi.ts` | CRUD de pets. |
| `appointmentsApi.ts` | Agendamentos / consultas marcadas. |
| `consultationsApi.ts` | Prontuários de consulta. |
| `prescriptionsApi.ts` | Receitas. |
| `vaccinesApi.ts` | Vacinas. |
| `attachmentsApi.ts` | Upload e listagem de anexos. |
| `catalogApi.ts` | Catálogo de produtos/serviços. |
| `invoicesApi.ts` | Faturas / financeiro. |
| `dashboardApi.ts` | Métricas agregadas do dashboard. |
| `notificationsApi.ts` | Notificações do usuário. |

## Convenções

- Toda chamada passa pela instância de `axios.ts`; não crie um `axios` novo por módulo.
- Erros de rede são normalizados em [`src/utils/api-error.ts`](../utils/README.md).
- Os módulos daqui são consumidos pelos React Query hooks em [`src/hooks`](../hooks/README.md).
