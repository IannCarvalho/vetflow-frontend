import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';

/**
 * Dark-mode accessibility gate. Mirrors accessibility.a11y.spec.ts but forces
 * the dark colour scheme, so a contrast regression in dark mode (nav
 * subheaders, active nav item, coloured chips/buttons) is caught in CI. The
 * light gate audits light mode only; this one closes the dark-mode gap.
 *
 * No backend / no real login: a fake auth token is seeded so ProtectedRoute
 * renders the shell. Dark mode is forced three ways so it holds regardless of
 * how MUI resolves it: localStorage `mui-mode`, the `data-color-scheme`
 * attribute (theme-config colorSchemeSelector), and the emulated media.
 */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const ROUTES = [
  '/',
  '/agenda',
  '/clientes',
  '/pets',
  '/consultas',
  '/vacinas',
  '/catalogo',
  '/financeiro',
  '/financeiro/painel',
  '/account',
];

async function seedDarkAuth(page: Page) {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => {
    localStorage.setItem('auth_token', 'ci-fake-token');
    localStorage.setItem(
      'auth_user',
      JSON.stringify({ id: 'ci', name: 'CI User', email: 'ci@vetflow.test' })
    );
    localStorage.setItem('mui-mode', 'dark');
    document.documentElement.setAttribute('data-color-scheme', 'dark');
  });
}

test.describe('Accessibility — dark mode (axe-core WCAG 2.1 AA)', () => {
  for (const route of ROUTES) {
    test(`no violations (dark): ${route}`, async ({ page }) => {
      await seedDarkAuth(page);
      await page.goto(route, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);

      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

      if (results.violations.length) {
        const lines = results.violations.map((v) => {
          const nodes = v.nodes
            .slice(0, 5)
            .map((n) => `        · ${n.target.join(' ')}`)
            .join('\n');
          return `  [${v.impact}] ${v.id} (${v.nodes.length}x) — ${v.help}\n${nodes}`;
        });
        // eslint-disable-next-line no-console
        console.error(`\naxe violations (dark) on ${route}:\n${lines.join('\n')}`);
      }

      expect(results.violations, `axe found dark-mode violations on ${route}`).toEqual([]);
    });
  }
});
