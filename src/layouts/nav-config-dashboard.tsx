import { Icon } from '@iconify/react';

// ----------------------------------------------------------------------

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <Icon icon="mdi:chart-line" width={24} height={24} />,
  },
  {
    title: 'Agenda',
    path: '/agenda',
    icon: <Icon icon="mdi:calendar-clock" width={24} height={24} />,
  },
  {
    title: 'Clientes',
    path: '/clientes',
    icon: <Icon icon="mdi:account-multiple" width={24} height={24} />,
  },
  {
    title: 'Pets',
    path: '/pets',
    icon: <Icon icon="mdi:paw" width={24} height={24} />,
  },
  {
    title: 'Consultas',
    path: '/consultas',
    icon: <Icon icon="mdi:stethoscope" width={24} height={24} />,
  },
  {
    title: 'Vacinas',
    path: '/vacinas',
    icon: <Icon icon="mdi:needle" width={24} height={24} />,
  },
  {
    title: 'Catálogo',
    path: '/catalogo',
    icon: <Icon icon="mdi:tag-multiple" width={24} height={24} />,
  },
  {
    title: 'Financeiro',
    path: '/financeiro',
    icon: <Icon icon="mdi:cash-multiple" width={24} height={24} />,
  },
  {
    title: 'Painel Financeiro',
    path: '/financeiro/painel',
    icon: <Icon icon="mdi:chart-bar" width={24} height={24} />,
  },
];
