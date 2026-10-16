# `src/sections` — Blocos de tela por domínio

[← Voltar ao README do frontend](../../README.md)

Componentes de domínio específicos de um recurso — principalmente diálogos de formulário, relatórios e visões — montados pelas [pages](../pages/README.md). Diferem de [`src/components`](../components/README.md) por serem acoplados a uma feature.

## Responsabilidade

- Agrupar formulários, modais e visualizações de cada feature do VetFlow.
- Encapsular validação (react-hook-form/yup) e interação de uma funcionalidade.
- Consumir [hooks](../hooks/README.md) para ler/gravar dados daquele recurso.

## Subpastas

| Pasta | Conteúdo |
| --- | --- |
| `auth/` | `sign-in-view`, `sign-up-modal`. |
| `account/` | Formulário de conta, troca de senha, foto de perfil. |
| `clients/` | Diálogo de cliente. |
| `pets/` | Diálogo de pet. |
| `appointments/` | Diálogo e constantes de agendamento. |
| `consultations/` | Formulário e relatório de consulta. |
| `prescriptions/` | Formulário e relatório de receita. |
| `vaccines/` | Diálogo de vacina. |
| `attachments/` | Diálogo de upload de anexo. |
| `catalog/` | Diálogo de item do catálogo. |
| `invoices/` | Formulário de fatura, gráfico de receita mensal, constantes. |
| `timeline/` | Linha do tempo do pet. |
| `error/` | Visão de "não encontrado". |

## Convenções

- Componentes aqui são específicos de uma feature; o que for genérico vai para [`src/components`](../components/README.md).
- Formulários usam react-hook-form + yup; tipos vêm de [`src/types`](../types/README.md).
