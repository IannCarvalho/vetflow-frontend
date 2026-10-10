# `src/utils` — Utilitários

[← Voltar ao README do frontend](../../README.md)

Funções puras e helpers sem estado: formatação, máscaras, normalização de erros e integrações auxiliares. Testáveis isoladamente (há testes `*.test.ts` nesta pasta).

## Responsabilidade

- Formatar números, datas/horas e aplicar máscaras de input.
- Normalizar erros vindos da [camada de API](../api/README.md) em mensagens de UI consistentes.
- Oferecer integrações utilitárias (ex.: consulta de CEP via ViaCEP).

## Arquivos

| Arquivo | Papel |
| --- | --- |
| `format-number.ts` | Formatação de números/moeda (+ teste). |
| `format-time.ts` | Formatação de datas e horas (+ teste). |
| `masks.ts` | Máscaras de CPF/telefone/etc. (+ teste). |
| `api-error.ts` | Normaliza erros do Axios em mensagens tratáveis. |
| `viacep.ts` | Lookup de endereço por CEP (ViaCEP). |

## Convenções

- Mantenha estas funções **puras** e sem dependência de React.
- Todo helper novo com lógica relevante deve vir acompanhado de um `*.test.ts` (Vitest).
- Tratamento de erro de rede passa por `api-error.ts`, não espalhado pelos hooks.
