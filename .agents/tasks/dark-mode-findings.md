# Dark Mode Findings — vetflow-frontend

Read-only investigation. No code was changed. All paths are relative to
`c:\Users\carva\Desktop\projeto_pessoais\vetflow-frontend`.

Stack: React 19 + TypeScript + MUI v7 (`@mui/material ^7.3.10`) + Vite, on the
Minimal Material Kit template. Build: `npm run build` (`tsc && vite build`).
Tests: `npm run test` (`vitest run`). Lint: `npm run lint`. No `AGENTS.md` /
`CONTRIBUTING` / `.kiro/steering` files exist in the frontend.

---

## 1. How dark mode works today

Dark mode is implemented the "correct" MUI v7 way — **CSS-variables color
schemes**, not a custom context and not `palette.mode` swapping.

- `src/theme/create-theme.ts` builds the theme with
  `colorSchemes: { light: {...}, dark: {...} }` (lines 18–31) and
  `cssVariables: themeConfig.cssVariables`. Both a light **and** a dark palette
  are fully defined — the theme is not light-only.
- `src/theme/theme-config.ts` sets the CSS-variable config (lines ~113–116):
  `cssVarPrefix: ''` and `colorSchemeSelector: 'data-color-scheme'`. So the
  active scheme is selected by a `data-color-scheme="dark"` attribute on the
  root element, and every token is emitted as a CSS variable
  (`theme.vars.palette.*`).
- `src/theme/core/palette.ts` defines both schemes:
  - `background.light` = paper `#FFFFFF`, default `#F0F9FE`, neutral `#E8F5FF`
    (lines ~97–101).
  - `background.dark` = paper `grey[800]` (`#1C252E`), default `grey[900]`
    (`#141A21`), neutral `#28323D` (lines ~102–106).
  - `text.dark.primary` = `#FFFFFF` (line ~88). These dark values are fine.
- `src/theme/theme-provider.tsx` wraps the app in MUI's
  `ThemeProvider` (the CSS-vars provider) with `disableTransitionOnChange` and
  `<CssBaseline />`.
- **Toggle:** `src/layouts/components/theme-mode-toggle.tsx` uses MUI's
  `useColorScheme()` → `setMode('light' | 'dark')` and renders the sun/moon
  `IconButton`. Persistence is handled by MUI (localStorage) through the
  CSS-vars theme. The toggle itself works correctly.

**Conclusion:** The theming infrastructure is sound and dark mode *does* apply
globally. The bugs are **not** in the theme engine — they are **hardcoded light
color literals in individual components/pages** that ignore `theme.vars.*` and
therefore never react to the active color scheme. The global component overrides
in `src/theme/core/components.tsx` are correctly theme-aware (e.g.
`MuiOutlinedInput.root` uses `theme.vars.palette.background.neutral`, lines
~62–70; `MuiTableCell.head` uses `background.neutral`, lines ~87–94), which is
why the per-page hardcoded overrides stand out as the regressions.

---

## 2. Root causes mapped to the 4 observed bugs

### Bug 1 — Sidebar stays light (blue/green gradient) in dark mode
**Root cause (confirmed):** `src/layouts/dashboard/nav.tsx`, **line 52**, inside
`NavDesktop`:

```
background: 'linear-gradient(135deg, #F0F9FE 0%, #F5FDF8 100%)',
```

Hardcoded hex gradient on the fixed desktop nav `Box`. It has no
`theme.applyStyles('dark', ...)` branch and does not reference any CSS variable,
so it renders the same light gradient in both schemes.

**Fix direction:** Drive the background from the theme. Either use
`theme.vars.palette.background.default` / `background.paper`, or keep the
gradient for light and add a dark override via
`theme.applyStyles('dark', { background: theme.vars.palette.background.default })`.
Note the mobile drawer (`NavMobile`, same file) relies on the `Drawer` paper and
does not set this gradient, so only the desktop branch needs the fix.

### Bug 2 — TextField renders hardcoded white in dark mode
**Root cause (confirmed):** per-page search `TextField`s override the (otherwise
theme-aware) global input style with `backgroundColor: '#FFFFFF'` on
`.MuiOutlinedInput-root`. Each stays white with poor contrast in dark mode:

| File | Line | Snippet |
|------|------|---------|
| `src/pages/clientes.tsx` | 190 | `'& .MuiOutlinedInput-root': { backgroundColor: '#FFFFFF' }` (multi-line sx, lines 188–192) |
| `src/pages/financeiro.tsx` | 208 | `sx={{ mb: 3, '& .MuiOutlinedInput-root': { backgroundColor: '#FFFFFF' } }}` |
| `src/pages/pets.tsx` | 198 | same pattern |
| `src/pages/vacinas.tsx` | 177 | same pattern |
| `src/pages/consultas.tsx` | 132 | same pattern |
| `src/pages/agenda.tsx` | 215 | same pattern |
| `src/pages/catalogo.tsx` | 159 | same pattern |

**Fix direction:** Remove the per-page `backgroundColor: '#FFFFFF'` override
entirely — the global `MuiOutlinedInput` override in
`src/theme/core/components.tsx` (lines ~62–70) already paints inputs with
`theme.vars.palette.background.neutral`, which is correct in both schemes. If a
distinct search-field background is desired, use
`'background.paper'` or `'background.neutral'` instead of a literal.

**Important nuance (sign-in page):** The sign-in form fields in
`src/sections/auth/sign-in-view.tsx` (TextFields at lines 103 and 123) do **not**
set a hardcoded background — they inherit the correct global `background.neutral`
override and therefore adapt to dark mode. So the "white input on the sign-in
page" symptom in the brief is **not** caused by a hardcoded literal on those
fields. If the sign-in inputs still look wrong in dark mode, the likely cause is
the auth background overlay (`src/layouts/auth/layout.tsx`,
`backgroundImage: url(/assets/background/overlay.jpg)` at `opacity: 0.24`,
lines ~84–95) over `background.default`, not an input override. Worth a visual
re-check after the search-bar fixes; no code change is proposed for the sign-in
fields themselves.

### Bug 3 — Financeiro search bar renders solid white in dark mode
**Root cause (confirmed):** same class of bug as Bug 2, specifically
`src/pages/financeiro.tsx` **line 208** (`backgroundColor: '#FFFFFF'`). Covered
by the Bug 2 fix.

### Bug 4 — Dashboard card/table section headers have a light band
**Root cause (confirmed):** `src/pages/dashboard-vetflow.tsx` — the "Consultas
Recentes" and "Vacinas a Vencer" card header `Box`es hardcode a light-blue band:

- **line 184:** `<Box sx={{ p: 3, pb: 2, backgroundColor: '#E0F2FE', borderRadius: '4px 4px 0 0' }}>` (Consultas Recentes)
- **line 227:** identical `backgroundColor: '#E0F2FE'` (Vacinas a Vencer)

`#E0F2FE` is `primary.lighter`; it is a literal and does not change with the
scheme.

**Fix direction:** Replace with a theme token. `'background.neutral'` matches the
table-head band style used elsewhere (`MuiTableCell.head` and the
`TableRow sx={{ backgroundColor: 'background.neutral' }}` rows used across the
list pages), giving a consistent, scheme-aware header. Alternatively
`varAlpha(theme.vars.palette.primary.mainChannel, 0.08)` to keep a brand tint
that still darkens in dark mode.

---

## 3. Additional dark-mode issues found while reading

These are not in the original 4 but share the same hardcoded-literal root cause
and will look wrong (or off-brand) in dark mode:

1. **Header blur band is a hardcoded light gradient.**
   `src/layouts/core/header-section.tsx` **line 110**:
   `background: linear-gradient(135deg, rgba(240, 249, 254, 0.7) 0%, rgba(245, 253, 248, 0.7) 100%)`.
   Appears when the page is scrolled/offset. Light rgba values do not adapt to
   dark mode. Fix: drive from `background.default`/`paper` or add a
   `theme.applyStyles('dark', ...)` branch.

2. **Logo wrapper hardcodes a cream background.**
   `src/components/logo/logo.tsx` **line 39**: `background: '#f9f9f6'` (only in
   the `isSingle` boxed variant). Will show a light block in dark mode. Fix:
   `background.paper` or a conditional dark override.

3. **Notification rows hardcode light status colors.**
   `src/components/notifications-center.tsx` **lines 68–70**: `getBackgroundColor`
   returns `#E0F2FE` (pending) / `#DCFCE7` (default), applied via `bgcolor` at
   **line 127**. Low contrast against dark surfaces. Fix: use soft alpha tints
   of `info`/`success` channels (e.g.
   `varAlpha(theme.vars.palette.info.mainChannel, 0.16)`) or `background.neutral`.

4. **Table-head rows are already correct — do NOT change them.** Across the list
   and detail pages (`clientes`, `financeiro`, `financeiro-dashboard`, `pets`,
   `vacinas`, `consultas`, `pet-vacinas`, `pet-receitas`, `pet-consultas`,
   `pet-anexos`) the `TableRow sx={{ backgroundColor: 'background.neutral' }}`
   uses a theme token and adapts correctly. Listed here so the implementer does
   not mistake them for the `#E0F2FE` bug.

The social-login hover styles (`rgba(255,255,255,0.08)` in
`src/components/social-login/*.tsx`) are translucent white hovers and are
acceptable in both schemes — not flagged for change.

---

## 4. Recommended fix order

Ordered by blast radius and dependency (each step leaves the app buildable;
verify with `npm run build` and a visual dark-mode toggle check after each):

1. **Sidebar gradient** — `src/layouts/dashboard/nav.tsx` line 52. Highest
   visual impact (Bug 1), self-contained.
2. **Search-bar inputs** — remove `backgroundColor: '#FFFFFF'` from the 7 list
   pages (`clientes` 190, `financeiro` 208, `pets` 198, `vacinas` 177,
   `consultas` 132, `agenda` 215, `catalogo` 159). Same one-line pattern in each;
   do them as a single batch (Bugs 2 & 3).
3. **Dashboard section headers** — `src/pages/dashboard-vetflow.tsx` lines 184 &
   227, swap `#E0F2FE` → `background.neutral` (Bug 4).
4. **Header blur band** — `src/layouts/core/header-section.tsx` line 110
   (additional issue #1).
5. **Logo wrapper + notification status colors** — `logo.tsx` line 39 and
   `notifications-center.tsx` lines 68–70/127 (additional issues #2–#3).
6. **Re-check the sign-in page visually** in dark mode. If inputs still read as
   "white", investigate the auth overlay in `src/layouts/auth/layout.tsx`
   (lines ~84–95) rather than the TextFields, which are already theme-aware.

**Verification commands** (from `package.json`):
- `npm run build` — `tsc && vite build` must succeed after each change.
- `npm run lint` — ESLint over `src/**`.
- `npm run test` — `vitest run` (no theme-specific tests exist today; manual
  dark/light toggle via the header sun/moon button is the primary visual check).
