import { useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Link from '@mui/material/Link';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { useGetPets } from 'src/hooks/usePetsQuery';

import { Iconify } from 'src/components/iconify';
import { type IconifyName } from 'src/components/iconify/register-icons';

/**
 * Shared header for every per-pet screen (Prontuário and its sections).
 *
 * It is the single navigation hub for one pet: a breadcrumb that answers
 * "where am I?" (Pets › {name} › {section}) and a tab bar that moves between
 * that pet's Prontuário, Consultas, Vacinas, Receitas and Anexos without ever
 * going back to the global pets table. Replaces the fragile per-page
 * "← Voltar" buttons, which assumed the user always arrived from /pets.
 *
 * The active section is derived from the URL, so a page just drops this in
 * without tracking its own tab state. An optional `action` slot keeps each
 * page's primary button (e.g. "Nova Consulta") on the right.
 */
type PetSection = 'prontuario' | 'consultas' | 'vacinas' | 'receitas' | 'anexos';

type TabDef = {
  value: PetSection;
  label: string;
  icon: IconifyName;
  /** Path suffix after /pets/:id. Prontuário has none. */
  suffix: string;
};

const TABS: TabDef[] = [
  { value: 'prontuario', label: 'Prontuário', icon: 'solar:clipboard-heart-bold', suffix: 'prontuario' },
  { value: 'consultas', label: 'Consultas', icon: 'solar:medical-visit-bold', suffix: 'consultas' },
  { value: 'vacinas', label: 'Vacinas', icon: 'solar:vaccine-bold', suffix: 'vacinas' },
  { value: 'receitas', label: 'Receitas', icon: 'solar:document-text-bold', suffix: 'receitas' },
  { value: 'anexos', label: 'Anexos', icon: 'solar:paperclip-bold', suffix: 'anexos' },
];

function sectionFromPathname(pathname: string): PetSection {
  const match = TABS.find((t) => t.suffix !== 'prontuario' && pathname.endsWith(`/${t.suffix}`));
  return match?.value ?? 'prontuario';
}

type PetHeaderProps = {
  /** Optional primary action for this section (e.g. a "Nova Consulta" button). */
  action?: React.ReactNode;
};

export default function PetHeader({ action }: PetHeaderProps) {
  const { petId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { data: allPets } = useGetPets();

  const currentPet = allPets?.find((p) => p.id === petId);
  const petName = currentPet?.name ?? 'Carregando...';
  const activeSection = useMemo(() => sectionFromPathname(pathname), [pathname]);
  const activeLabel = TABS.find((t) => t.value === activeSection)?.label ?? 'Prontuário';

  const goToSection = (section: PetSection) => {
    if (!petId) return;
    const tab = TABS.find((t) => t.value === section);
    if (!tab) return;
    navigate(`/pets/${petId}/${tab.suffix}`);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Breadcrumbs sx={{ mb: 1.5 }} separator="›" aria-label="Trilha de navegação">
        <Link
          component="button"
          type="button"
          underline="hover"
          color="text.secondary"
          variant="body2"
          onClick={() => navigate('/pets')}
        >
          Pets
        </Link>
        <Typography variant="body2" color="text.secondary">
          {petName}
        </Typography>
        <Typography variant="body2" color="text.primary">
          {activeLabel}
        </Typography>
      </Breadcrumbs>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Typography variant="h4">{petName}</Typography>
        {action}
      </Stack>

      <Tabs
        value={activeSection}
        onChange={(_, value) => goToSection(value as PetSection)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={(theme) => ({
          borderBottom: 1,
          borderColor: 'divider',
          // primary.main (#2E7D5B) only reaches ~3.5:1 on the dark background,
          // below WCAG AA 4.5:1. Use the lighter tone for the selected tab and
          // the indicator in dark mode, where it clears the threshold.
          '& .MuiTab-root.Mui-selected': {
            color: theme.vars.palette.primary.main,
            ...theme.applyStyles('dark', { color: theme.vars.palette.primary.light }),
          },
          '& .MuiTabs-indicator': {
            ...theme.applyStyles('dark', { backgroundColor: theme.vars.palette.primary.light }),
          },
        })}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            icon={<Iconify icon={tab.icon} width={20} />}
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
        ))}
      </Tabs>
    </Box>
  );
}
