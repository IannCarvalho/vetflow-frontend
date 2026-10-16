import type { BoxProps } from '@mui/material/Box';

import { mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';

import { Logo } from 'src/components/logo';

import { layoutClasses } from '../core/classes';

// ----------------------------------------------------------------------

export type AuthContentProps = BoxProps;

export function AuthContent({ sx, children, className, ...other }: AuthContentProps) {
  return (
    <Box
      className={mergeClasses([layoutClasses.content, className])}
      sx={[
        (theme) => ({
          py: 5,
          px: 3,
          width: 1,
          zIndex: 2,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 'var(--layout-auth-content-width)',
          bgcolor: theme.vars.palette.background.default,
          boxShadow: theme.vars.customShadows.card,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {/* Brand mark at the top of the auth card so the sign-in screen carries
          the VetFlow identity (was blank on main). Scheme-aware via Logo. */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <Logo sx={{ width: 160, mb: 0 }} />
      </Box>
      {children}
    </Box>
  );
}
