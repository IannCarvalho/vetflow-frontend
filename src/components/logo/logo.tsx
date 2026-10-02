import type { LinkProps } from '@mui/material/Link';

import { mergeClasses } from 'minimal-shared/utils';

import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

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
      aria-label="Logo"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        (theme) => ({
          width: isSingle ? 'auto' : 640,
          height: isSingle ? 'auto' : 192,
          mt: isSingle ? 0 : -10,
          mb: isSingle ? 3 : 0,
          padding: isSingle ? '16px 20px' : 0,
          background: '#f9f9f6',
          borderRadius: isSingle ? '16px' : 0,
          border: isSingle ? '2px solid rgba(2, 132, 199, 0.1)' : 'none',
          backdropFilter: 'blur(4px)',
          ...theme.applyStyles('dark', {
            background: theme.vars.palette.background.paper,
          }),
          ...(disabled && { pointerEvents: 'none' }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <img
        src="/logo.png"
        alt="VetFlow"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </LogoRoot>
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
