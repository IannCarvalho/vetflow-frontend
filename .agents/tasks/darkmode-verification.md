# Dark Mode Fixes — Verification Note

Iteration: FIRST (no `darkmode-review.json` present at start).
Scope: replace hardcoded light color literals so they defer to / reference
MUI v7 CSS-variable theme tokens, making dark mode render correctly. The theme
engine files were NOT modified.

All paths relative to `c:\Users\carva\Desktop\projeto_pessoais\vetflow-frontend`.

---

## Changes per file

### Fix 1 — Sidebar gradient (highest impact)
`src/layouts/dashboard/nav.tsx` (NavDesktop, ~line 52)
- Kept the light-mode gradient `linear-gradient(135deg, #F0F9FE 0%, #F5FDF8 100%)` unchanged.
- Added a dark override via `theme.applyStyles('dark', { background: theme.vars.palette.background.default })`.
- `NavMobile` left untouched (it does not set this gradient).

### Fix 2 — Search-bar TextFields (7 pages)
Removed the `'& .MuiOutlinedInput-root': { backgroundColor: '#FFFFFF' }` override
so inputs defer to the global theme-aware `MuiOutlinedInput` style
(`background.neutral`). No other TextField props changed.
- `src/pages/clientes.tsx` — removed the multi-line `sx` block entirely (it only held the override; the `slotProps`-style startAdornment config was left intact).
- `src/pages/financeiro.tsx` — `sx={{ mb: 3, ... }}` → `sx={{ mb: 3 }}`.
- `src/pages/pets.tsx` — `sx={{ mb: 3, ... }}` → `sx={{ mb: 3 }}`.
- `src/pages/vacinas.tsx` — `sx={{ mb: 3, ... }}` → `sx={{ mb: 3 }}`.
- `src/pages/consultas.tsx` — `sx={{ mb: 3, ... }}` → `sx={{ mb: 3 }}`.
- `src/pages/agenda.tsx` — `sx={{ mb: 3, ... }}` → `sx={{ mb: 3 }}`.
- `src/pages/catalogo.tsx` — `sx={{ mb: 3, ... }}` → `sx={{ mb: 3 }}`.

### Fix 3 — Dashboard section headers
`src/pages/dashboard-vetflow.tsx` (~lines 184 and 227)
- Both "Consultas Recentes" and "Vacinas a Vencer" header Boxes:
  `backgroundColor: '#E0F2FE'` → `backgroundColor: 'background.neutral'`.
  Padding / borderRadius unchanged.

### Fix 4 — Header blur band
`src/layouts/core/header-section.tsx` (~line 110)
- Kept the light-mode gradient `rgba(240, 249, 254, 0.7) / rgba(245, 253, 248, 0.7)`.
- Added a dark override via
  `theme.applyStyles('dark', { background: varAlpha(theme.vars.palette.background.defaultChannel, 0.7) })`
  (translucent dark band). `varAlpha` was already imported in this file.

### Fix 5a — Logo wrapper
`src/components/logo/logo.tsx` (~line 39)
- Converted the first `sx` array entry from a static object to the callback form `(theme) => ({ ... })`.
- Kept the light-mode `background: '#f9f9f6'` and added
  `theme.applyStyles('dark', { background: theme.vars.palette.background.paper })`.

### Fix 5b — Notification status colors
`src/components/notifications-center.tsx` (~lines 68-70, 127)
- Added imports: `import type { Theme } from '@mui/material/styles'` and `import { varAlpha } from 'minimal-shared/utils'`.
- `getBackgroundColor` now takes `(status, theme)` and returns scheme-aware soft tints:
  pending → `varAlpha(theme.vars.palette.info.mainChannel, 0.16)`,
  default → `varAlpha(theme.vars.palette.success.mainChannel, 0.16)`
  (replaces `#E0F2FE` / `#DCFCE7`).
- The `ListItem` `sx` was converted to the callback form `(theme) => ({ ... })` to pass `theme`.
- `getBorderColor` / `getTextOpacity` left unchanged (not in scope).

---

## Not touched (per instructions)
- `TableRow sx={{ backgroundColor: 'background.neutral' }}` rows — already theme tokens.
- Sign-in TextFields (`src/sections/auth/sign-in-view.tsx`) — no hardcoded bg.
- Social-login hover styles — acceptable translucent white.
- Theme palette/engine files — unchanged.

---

## Commands run and results

### `npm run build` (`tsc && vite build`)
PASS — Exit code 0. Zero TypeScript errors. `✓ 1523 modules transformed`, `✓ built in 24.94s`.
ESLint ran via the build's lint plugin: `14 problems (0 errors, 14 warnings)`.

### `npm run lint`
Exit code 0. `14 problems (0 errors, 14 warnings)`.
All 14 are pre-existing warnings unrelated to these fixes. The only warning in a
file edited here is `src/components/logo/logo.tsx:8` — `'RouterLink' is defined
but never used`. This import was already unused before this change (the edit only
touched the `sx` prop), so it was left as-is to keep the change minimal.

### `npm run test` (`vitest run`)
PASS — Exit code 0. `Test Files 4 passed (4)`, `Tests 47 passed (47)`.

### Grep for removed/replaced literals (PowerShell `Select-String`)
Searched the 12 changed files for `#FFFFFF`, `#E0F2FE`, `#DCFCE7`, `#f9f9f6`,
`rgba(240, 249, 254`, `rgba(245, 253, 248`:
- `#FFFFFF`, `#E0F2FE`, `#DCFCE7` — 0 remaining hits (all removed/replaced).
- `#f9f9f6` — 1 hit in `logo.tsx:39` (intentional LIGHT-mode value; dark override added).
- light rgba gradient — 1 hit in `header-section.tsx:110` (intentional LIGHT-mode value; dark override added).

Confirmed `theme.applyStyles('dark', ...)` branches present in nav.tsx (line 57),
header-section.tsx (line 111), and logo.tsx (line 43).

---

## Visual confirmation (NOT done here)
Final visual confirmation of the dark/light toggle requires a human running
`npm run dev` and clicking the sun/moon button in the header to confirm the
sidebar, search bars, dashboard headers, header blur band, logo wrapper, and
notification rows all render correctly in both schemes. This step was not
performed automatically and should be checked by a human.
