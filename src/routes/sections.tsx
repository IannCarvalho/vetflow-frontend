import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

import { OAuthCallbackHandler } from 'src/components/oauth-callback/oauth-callback-handler';

import { ProtectedRoute } from './protected-route';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard-vetflow'));
export const AgendaPage = lazy(() => import('src/pages/agenda'));
export const ClientesPage = lazy(() => import('src/pages/clientes'));
export const ClientPetsPage = lazy(() => import('src/pages/client-pets'));
export const PetsPage = lazy(() => import('src/pages/pets'));
export const PetVacinasPage = lazy(() => import('src/pages/pet-vacinas'));
export const PetConsultasPage = lazy(() => import('src/pages/pet-consultas'));
export const PetReceitasPage = lazy(() => import('src/pages/pet-receitas'));
export const PetAnexosPage = lazy(() => import('src/pages/pet-anexos'));
export const VacinasPage = lazy(() => import('src/pages/vacinas'));
export const ConsultasPage = lazy(() => import('src/pages/consultas'));
export const CatalogoPage = lazy(() => import('src/pages/catalogo'));
export const FinanceiroPage = lazy(() => import('src/pages/financeiro'));
export const FinanceiroDashboardPage = lazy(() => import('src/pages/financeiro-dashboard'));
export const AccountPage = lazy(() => import('src/pages/account'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  {
    path: 'sign-in',
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },
  {
    path: 'auth',
    children: [
      {
        path: 'discord/callback',
        element: <OAuthCallbackHandler />,
      },
      {
        path: 'google/callback',
        element: <OAuthCallbackHandler />,
      },
      {
        path: 'facebook/callback',
        element: <OAuthCallbackHandler />,
      },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'agenda', element: <AgendaPage /> },
      { path: 'clientes', element: <ClientesPage /> },
      { path: 'clientes/:clientId/pets', element: <ClientPetsPage /> },
      { path: 'pets', element: <PetsPage /> },
      { path: 'pets/:petId/vacinas', element: <PetVacinasPage /> },
      { path: 'pets/:petId/consultas', element: <PetConsultasPage /> },
      { path: 'pets/:petId/receitas', element: <PetReceitasPage /> },
      { path: 'pets/:petId/anexos', element: <PetAnexosPage /> },
      { path: 'vacinas', element: <VacinasPage /> },
      { path: 'consultas', element: <ConsultasPage /> },
      { path: 'catalogo', element: <CatalogoPage /> },
      { path: 'financeiro', element: <FinanceiroPage /> },
      { path: 'financeiro/painel', element: <FinanceiroDashboardPage /> },
      { path: 'account', element: <AccountPage /> },
    ],
  },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];
