# `src/components` — Componentes reutilizáveis

[← Voltar ao README do frontend](../../README.md)

Componentes de UI genéricos e de domínio, reaproveitados por várias telas. Nada aqui conhece uma página específica; são blocos de montagem.

## Responsabilidade

- Fornecer peças de UI compartilhadas (ícones, scrollbar, logo).
- Agrupar widgets de domínio transversais (busca global, central de notificações, botões de login social, callback OAuth).
- Manter cada componente autossuficiente, estilizado via tema MUI (ver [`src/theme`](../theme/README.md)).

## Subpastas e arquivos

| Item | Papel |
| --- | --- |
| `notifications-center.tsx` | Central de notificações in-app. |
| `global-search/` | Busca global (atalho/omnibox) sobre os recursos. |
| `iconify/` | Wrapper `<Iconify>` + conjunto de ícones registrados. |
| `logo/` | Logo da aplicação. |
| `scrollbar/` | Scrollbar customizada (SimpleBar). |
| `social-login/` | Botões de login Google, Facebook e Discord. |
| `oauth-callback/` | Handler da rota de callback OAuth. |

## Convenções

- Use `<Iconify>` (não `<Icon>` cru) para qualquer ícone — ver `components/iconify`.
- Componentes de formulário de um recurso específico moram em [`src/sections`](../sections/README.md), não aqui.
- Dados vêm por props; busca de dados fica nos [hooks](../hooks/README.md).
