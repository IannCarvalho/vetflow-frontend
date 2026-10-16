import type { LinkProps } from '@mui/material/Link';

import { mergeClasses } from 'minimal-shared/utils';

import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export function Logo({
  sx,
  disabled,
  className,
  href = '/',
  isSingle = true,
  ...other
}: LogoProps) {
  return (
    <LogoRoot
      aria-label="VetFlow — página inicial"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        () => ({
          width: isSingle ? 'auto' : 640,
          height: isSingle ? 'auto' : 192,
          mt: isSingle ? 0 : -10,
          mb: isSingle ? 3 : 0,
          padding: isSingle ? '8px 12px' : 0,
          // The logo image is transparent, so no wrapper background is needed:
          // it floats cleanly over both the light and dark themes.
          ...(disabled && { pointerEvents: 'none' }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {/* Scheme-aware brand mark. The light logo keeps its navy "Vet"; the dark
          variant lightens the navy so it stays legible on the dark nav
          (#141A21). CSS toggles the two by colour scheme — no JS, no flash. */}
      <LogoImg data-scheme="light" src="/logo.png" alt="VetFlow" draggable={false} />
      <LogoImg data-scheme="dark" src="/logo-dark.png" alt="VetFlow" draggable={false} />
    </LogoRoot>
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  display: 'inline-flex',
  verticalAlign: 'middle',
}));

const LogoImg = styled('img')(({ theme }) => ({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  // Light scheme (default): show the light logo, hide the dark one.
  '&[data-scheme="dark"]': { display: 'none' },
  ...theme.applyStyles('dark', {
    '&[data-scheme="light"]': { display: 'none' },
    '&[data-scheme="dark"]': { display: 'inline-block' },
  }),
}));
