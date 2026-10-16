import type { Breakpoint } from '@mui/material/styles';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';

import { AuthContent } from './content';
import { MainSection } from '../core/main-section';
import { LayoutSection } from '../core/layout-section';
import { ThemeModeToggle } from '../components/theme-mode-toggle';

import type { AuthContentProps } from './content';
import type { MainSectionProps } from '../core/main-section';
import type { HeaderSectionProps } from '../core/header-section';
import type { LayoutSectionProps } from '../core/layout-section';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type AuthLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    main?: MainSectionProps;
    content?: AuthContentProps;
  };
};

export function AuthLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'md',
}: AuthLayoutProps) {
  const renderFooter = () => null;

  const renderMain = () => (
    <MainSection
      {...slotProps?.main}
      sx={[
        (theme) => ({
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          p: theme.spacing(3, 2),
          [theme.breakpoints.up(layoutQuery)]: {
            p: theme.spacing(5, 0),
          },
        }),
        ...(Array.isArray(slotProps?.main?.sx)
          ? (slotProps?.main?.sx ?? [])
          : [slotProps?.main?.sx]),
      ]}
    >
      <AuthContent {...slotProps?.content}>{children}</AuthContent>
    </MainSection>
  );

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={null}
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={{ '--layout-auth-content-width': '420px', ...cssVars }}
      sx={[
        (theme) => ({
          position: 'relative',
          // Brand-tinted backdrop built from theme tokens (no template jpg):
          // a soft primary→secondary wash on light, deep neutral on dark.
          background: `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.lighterChannel, 0.6)} 0%, ${theme.vars.palette.background.default} 55%, ${varAlpha(theme.vars.palette.secondary.lighterChannel, 0.5)} 100%)`,
          ...theme.applyStyles('dark', {
            background: `linear-gradient(135deg, ${theme.vars.palette.background.default} 0%, ${theme.vars.palette.background.neutral} 100%)`,
          }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 3 }}>
        <ThemeModeToggle />
      </Box>
      {renderMain()}
    </LayoutSection>
  );
}
