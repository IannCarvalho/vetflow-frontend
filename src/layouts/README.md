# `src/layouts` — Layouts da aplicação

[← Voltar ao README do frontend](../../README.md)

Estruturas de página (shell) que envolvem o conteúdo roteado: cabeçalho, navegação lateral, área de conteúdo e o layout de autenticação.

## Responsabilidade

- Definir o "esqueleto" visual das áreas logada (dashboard) e de autenticação.
- Montar navegação, header, popovers de conta/notificações e toggle de tema.
- Posicionar o conteúdo das [pages](../pages/README.md) renderizado pelas [rotas](../routes/README.md).

## Subpastas e arquivos

| Item | Papel |
| --- | --- |
| `dashboard/` | Shell principal logado: `layout.tsx`, `nav.tsx`, `content.tsx`, `nav-utils.ts`. |
| `auth/` | Shell das telas de login/cadastro. |
| `core/` | Peças base reutilizáveis: `layout-section`, `header-section`, `main-section`, CSS vars. |
| `components/` | Widgets do shell: `account-popover`, `notifications-popover`, `menu-button`, `theme-mode-toggle`. |
| `nav-config-dashboard.tsx` | Configuração dos itens de menu do dashboard. |
| `nav-config-account.tsx` | Configuração do menu de conta. |

## Convenções

- Itens de menu usam `<Iconify>` (ver [`src/components`](../components/README.md)); evite objetos `NavItem` órfãos fora das seções configuradas.
- Variáveis de layout (larguras, alturas) ficam nos `css-vars.ts`.
- O layout decide a moldura; a lógica de dados fica nas pages/sections, não aqui.
