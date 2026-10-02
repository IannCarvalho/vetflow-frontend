import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export type NavSection = {
  subheader?: string;
  items: NavItem[];
};

export const navData: NavSection[] = [
  {
    subheader: 'Operação',
    items: [
      {
        title: 'Dashboard',
        path: '/',
        icon: <Iconify icon="mdi:chart-line" width={24} />,
      },
      {
        title: 'Agenda',
        path: '/agenda',
        icon: <Iconify icon="mdi:calendar-clock" width={24} />,
      },
      {
        title: 'Clientes',
        path: '/clientes',
        icon: <Iconify icon="mdi:account-multiple" width={24} />,
      },
      {
        title: 'Pets',
        path: '/pets',
        icon: <Iconify icon="mdi:paw" width={24} />,
      },
      {
        title: 'Consultas',
        path: '/consultas',
        icon: <Iconify icon="mdi:stethoscope" width={24} />,
      },
      {
        title: 'Vacinas',
        path: '/vacinas',
        icon: <Iconify icon="mdi:needle" width={24} />,
      },
    ],
  },
  {
    subheader: 'Gestão',
    items: [
      {
        title: 'Catálogo',
        path: '/catalogo',
        icon: <Iconify icon="mdi:tag-multiple" width={24} />,
      },
      {
        title: 'Financeiro',
        path: '/financeiro',
        icon: <Iconify icon="mdi:cash-multiple" width={24} />,
      },
      {
        title: 'Painel Financeiro',
        path: '/financeiro/painel',
        icon: <Iconify icon="mdi:chart-bar" width={24} />,
      },
    ],
  },
];
