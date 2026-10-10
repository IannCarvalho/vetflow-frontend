# `src/theme` — Tema MUI

[← Voltar ao README do frontend](../../README.md)

Configuração do tema Material UI: paleta, tipografia, sombras, overrides de componentes e o provider que injeta tudo na árvore React.

## Responsabilidade

- Definir identidade visual (cores, fontes, espaçamentos, sombras) de forma centralizada.
- Suportar modos de cor (claro/escuro) e expor o `ThemeProvider`.
- Estender os tipos do MUI para campos customizados do tema.

## Arquivos e subpastas

| Item | Papel |
| --- | --- |
| `theme-provider.tsx` | Provider que aplica o tema à aplicação. |
| `create-theme.ts` | Monta o objeto de tema a partir das peças de `core/`. |
| `theme-config.ts` | Configuração de alto nível (modo, defaults). |
| `create-classes.ts` | Helper de classes de componente. |
| `types.ts` / `extend-theme-types.d.ts` | Tipagem e extensão do tema. |
| `core/` | `palette.ts`, `typography.ts`, `shadows.ts`, `custom-shadows.ts`, `components.tsx`. |

## Convenções

- Cores e tipografia sempre a partir do tema (`theme.palette`, `theme.typography`), nunca hardcoded nos componentes.
- Overrides globais de componentes MUI ficam em `core/components.tsx`.
- O toggle de modo de cor vive no shell — ver [`src/layouts`](../layouts/README.md).
