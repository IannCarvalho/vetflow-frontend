import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import { useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import Drawer, { drawerClasses } from '@mui/material/Drawer';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';

import { getActiveNavPath } from './nav-utils';

import type { NavSection } from '../nav-config-dashboard';

// ----------------------------------------------------------------------

export type NavContentProps = {
  data: NavSection[];
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  sx?: SxProps<Theme>;
};

export function NavDesktop({
  sx,
  data,
  slots,
  layoutQuery,
}: NavContentProps & { layoutQuery: Breakpoint }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        pt: 2.5,
        px: 2.5,
        top: 0,
        left: 0,
        height: 1,
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        zIndex: 'var(--layout-nav-zIndex)',
        width: 'var(--layout-nav-vertical-width)',
        // Scheme-aware nav backdrop from theme tokens (was a hardcoded cool
        // gradient #F0F9FE→#F5FDF8 that matched no brand colour). Light: a soft
        // warm→brand wash; dark: the flat dark background.
        background: `linear-gradient(135deg, ${theme.vars.palette.background.default} 0%, ${varAlpha(theme.vars.palette.primary.lighterChannel, 0.5)} 100%)`,
        borderRight: `1px solid ${varAlpha(theme.vars.palette.primary.lightChannel, 0.3)}`,
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex',
        },
        ...theme.applyStyles('dark', {
          background: theme.vars.palette.background.default,
          borderRight: `1px solid ${theme.vars.palette.divider}`,
        }),
        ...sx,
      }}
    >
      <NavContent data={data} slots={slots} />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function NavMobile({
  sx,
  data,
  open,
  slots,
  onClose,
}: NavContentProps & { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          pt: 2.5,
          px: 2.5,
          overflow: 'unset',
          width: 'var(--layout-nav-mobile-width)',
          ...sx,
        },
      }}
    >
      <NavContent data={data} slots={slots} />
    </Drawer>
  );
}

// ----------------------------------------------------------------------

export function NavContent({ data, slots, sx }: NavContentProps) {
  const pathname = usePathname();

  const allPaths = data.flatMap((section) => section.items.map((item) => item.path));
  const activePath = getActiveNavPath(pathname, allPaths);

  return (
    <>
      <Logo />

      {slots?.topArea}

      <Scrollbar fillContent>
        <Box
          component="nav"
          sx={[
            {
              display: 'flex',
              flex: '1 1 auto',
              flexDirection: 'column',
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          <Box
            component="ul"
            sx={{
              gap: 0.5,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {data.map((section, sectionIndex) => (
              <Box
                component="li"
                key={section.subheader ?? sectionIndex}
                sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
              >
                {section.subheader && (
                  <Typography
                    component="span"
                    variant="caption"
                    sx={[
                      (theme) => ({
                        px: 2,
                        mb: 0.5,
                        mt: sectionIndex === 0 ? 0 : 2,
                        display: 'block',
                        lineHeight: 1.5,
                        // text.disabled (grey.600 #637381) only reaches 3.58:1 on
                        // the dark nav (#141A21) — below AA. grey.500 (#919EAB)
                        // passes (>= 4.6:1) while staying a muted subheader; light
                        // mode keeps the original text.disabled tone.
                        color: 'text.disabled',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        fontWeight: 'fontWeightSemiBold',
                        ...theme.applyStyles('dark', {
                          color: theme.vars.palette.grey[500],
                        }),
                      }),
                    ]}
                  >
                    {section.subheader}
                  </Typography>
                )}

                <Box
                  component="ul"
                  sx={{
                    gap: 0.5,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {section.items.map((item) => {
                    const isActived = item.path === activePath;

                    return (
                      <ListItem disableGutters disablePadding key={item.title}>
                        <ListItemButton
                          disableGutters
                          component={RouterLink}
                          href={item.path}
                          sx={[
                            (theme) => ({
                              pl: 2,
                              py: 1,
                              gap: 2,
                              pr: 1.5,
                              position: 'relative',
                              borderRadius: 0.75,
                              typography: 'body2',
                              fontWeight: 'fontWeightMedium',
                              color: theme.vars.palette.text.secondary,
                              minHeight: 44,
                              ...(isActived && {
                                fontWeight: 'fontWeightSemiBold',
                                color: theme.vars.palette.primary.main,
                                bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
                                '&:hover': {
                                  bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
                                },
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  left: 0,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  width: 3,
                                  height: '60%',
                                  borderRadius: 1,
                                  backgroundColor: theme.vars.palette.primary.main,
                                },
                                // primary.main (#2E7D5B) only reaches ~3.25:1 as
                                // text on the dark active chip — below AA. Use the
                                // lighter primary tint for the label + accent bar
                                // in dark; light mode is unchanged.
                                ...theme.applyStyles('dark', {
                                  color: theme.vars.palette.primary.light,
                                  '&::before': {
                                    backgroundColor: theme.vars.palette.primary.light,
                                  },
                                }),
                              }),
                            }),
                          ]}
                        >
                          <Box component="span" sx={{ width: 24, height: 24 }}>
                            {item.icon}
                          </Box>

                          <Box component="span" sx={{ flexGrow: 1 }}>
                            {item.title}
                          </Box>

                          {item.info && item.info}
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Scrollbar>

      {slots?.bottomArea}
    </>
  );
}
