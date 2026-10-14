/**
 * Demo mode configuration.
 *
 * When the app runs as the public portfolio demo, the backend is seeded with
 * fake data and exposes a well-known visitor account. Setting
 * `VITE_DEMO_MODE=true` at build time reveals an "Entrar como visitante"
 * button on the sign-in screen that logs in with that account, so an evaluator
 * can explore the product without creating credentials.
 *
 * These credentials are intentionally public and only work against a demo
 * backend (APP_ENV=demo, seeded database). They must never be enabled against
 * the production deployment.
 */

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export const DEMO_VISITOR_EMAIL = 'dr.joao@vetflow.com';
export const DEMO_VISITOR_PASSWORD = '123456';
