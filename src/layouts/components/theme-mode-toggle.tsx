import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
/**
 * Theme Mode Toggle
 * Switches between light and dark color schemes using MUI's useColorScheme.
 * The choice is persisted by MUI (localStorage) via the CSS-variables theme.
 */
import { useColorScheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

export function ThemeModeToggle() {
  const { mode, setMode } = useColorScheme();

  // During SSR/first paint mode can be undefined; treat it as light.
  const isDark = mode === 'dark';

  const handleToggle = () => {
    setMode(isDark ? 'light' : 'dark');
  };

  return (
    <Tooltip title={isDark ? 'Modo claro' : 'Modo escuro'}>
      <IconButton onClick={handleToggle} color="inherit">
        <Iconify icon={isDark ? 'solar:sun-bold' : 'solar:moon-bold'} width={22} />
      </IconButton>
    </Tooltip>
  );
}
