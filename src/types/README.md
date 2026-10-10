# `src/types` — Tipos TypeScript compartilhados

[← Voltar ao README do frontend](../../README.md)

Definições de tipos e interfaces de domínio usadas por toda a aplicação (entidades, payloads de API, enums), além de declarações de módulos externos.

## Responsabilidade

- Centralizar os tipos das entidades do VetFlow (cliente, pet, consulta, receita, vacina, fatura, etc.).
- Garantir contratos consistentes entre [`src/api`](../api/README.md), [`src/hooks`](../hooks/README.md), [pages](../pages/README.md) e [sections](../sections/README.md).
- Fornecer declarações de tipo para libs externas sem tipos próprios.

## Arquivos

| Arquivo | Papel |
| --- | --- |
| `index.ts` | Tipos de domínio e payloads compartilhados. |
| `facebook-login.d.ts` | Declaração do SDK de login do Facebook. |

## Convenções

- Importe tipos daqui em vez de redeclarar interfaces por módulo.
- Tipos ligados exclusivamente ao tema MUI ficam em [`src/theme`](../theme/README.md), não aqui.
