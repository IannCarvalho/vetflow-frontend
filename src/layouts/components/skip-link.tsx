import Link from '@mui/material/Link';

/**
 * Accessibility skip link (WCAG 2.4.1 "Bypass Blocks").
 *
 * Visually hidden until it receives keyboard focus, then it appears at the
 * top-left and lets a keyboard/screen-reader user jump straight to the main
 * content, skipping the header and navigation. Targets the `#main-content`
 * landmark rendered by MainSection.
 */
export function SkipLink() {
  return (
    <Link
      href="#main-content"
      sx={{
        position: 'absolute',
        left: 8,
        top: 8,
        zIndex: (theme) => theme.zIndex.modal + 1,
        px: 2,
        py: 1,
        borderRadius: 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: 3,
        fontWeight: 'fontWeightMedium',
        textDecoration: 'none',
        // Hidden off-screen until focused.
        transform: 'translateY(-200%)',
        transition: (theme) =>
          theme.transitions.create('transform', { duration: theme.transitions.duration.shorter }),
        '&:focus-visible, &:focus': {
          transform: 'translateY(0)',
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
    >
      Pular para o conteúdo
    </Link>
  );
}
