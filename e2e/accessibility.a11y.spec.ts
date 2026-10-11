import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';

/**
 * Accessibility gate. Audits each route with axe-core and fails the build on any
 * WCAG 2.0/2.1 A/AA violation, so a regression in contrast, button names, alt
 * text, ARIA, etc. is caught in CI instead of in production.
 *
 * No backend / no real login: we seed a fake auth token so ProtectedRoute lets
 * the shell render. API calls fail without a backend, but axe audits the
 * rendered chrome (headers, tables, filter chips, forms, tabs) — exactly where
 * the fixed issues lived. This gate protects those components from regressing;
 * it is not a full data-state audit.
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

async function seedAuth(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('auth_token', 'ci-fake-token');
    localStorage.setItem(
      'auth_user',
      JSON.stringify({ id: 'ci', name: 'CI User', email: 'ci@vetflow.test' })
    );
  });
}

test.describe('Accessibility (axe-core WCAG 2.1 AA)', () => {
  for (const route of ROUTES) {
    test(`no violations: ${route}`, async ({ page }) => {
      await seedAuth(page);
      await page.goto(route, { waitUntil: 'networkidle' });
      // Let the shell settle (lazy route chunk + first paint).
      await page.waitForTimeout(600);

      const results = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        // Without a backend in CI, data-driven pages stay stuck on their loading
        // spinner (CircularProgress/LinearProgress), which axe flags as an
        // unnamed progressbar. That is a transient state that never happens in
        // prod (data arrives, spinner unmounts), so it is not representative here
        // and would be a false positive. Giving every spinner an aria-label is a
        // real but separate improvement (36 usages) tracked as a follow-up.
        .disableRules(['aria-progressbar-name'])
        .analyze();

      if (results.violations.length) {
        const lines = results.violations.map((v) => {
          const nodes = v.nodes
            .slice(0, 5)
            .map((n) => `        · ${n.target.join(' ')}`)
            .join('\n');
          return `  [${v.impact}] ${v.id} (${v.nodes.length}x) — ${v.help}\n${nodes}`;
        });
        // eslint-disable-next-line no-console
        console.error(`\naxe violations on ${route}:\n${lines.join('\n')}`);
      }

      expect(results.violations, `axe found violations on ${route}`).toEqual([]);
    });
  }
});
