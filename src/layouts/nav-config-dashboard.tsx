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
    title: 'Clientes',
    path: '/clientes',
    icon: <Icon icon="mdi:account-multiple" width={24} height={24} />,
  },
  {
    title: 'Pets',
    path: '/pets',
    icon: <Icon icon="mdi:paw" width={24} height={24} />,
  },
];
