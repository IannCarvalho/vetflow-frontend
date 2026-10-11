import { useState, useCallback } from 'react';

import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { type IconifyName } from 'src/components/iconify/register-icons';

/**
 * Data-driven actions for a table row.
 *
 * Pass the full list of actions and the component decides the layout:
 * - When the number of actions is small (<= `maxInline`), every action is
 *   rendered inline as an icon button with a tooltip -- the right choice for
 *   2-3 legible actions, where a menu would only add a click.
 * - When there are more, the first `maxInline` non-destructive actions stay
 *   visible inline and the rest collapse into an overflow kebab menu with text
 *   labels (legible without a hover tooltip, which does not work on touch).
 * - Destructive actions (`destructive: true`) always go into the menu, below a
 *   divider and tinted red, to keep them away from accidental clicks -- unless
 *   everything fits inline, in which case they stay inline tinted red.
 *
 * An action can be `disabled` and/or `loading`; a loading action shows a
 * spinner in place of its icon and is implicitly disabled, so async actions
 * (e.g. a download) can show progress without the caller rebuilding the UI.
 */
export type RowAction = {
  /** Stable key for React. */
  key: string;
  /** Human-readable label (tooltip inline, text in the menu). */
  label: string;
  /** Iconify icon name. */
  icon: IconifyName;
  onClick: () => void;
  /** MUI palette color for the inline icon button. */
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'default';
  /** Destructive actions are isolated in the menu footer and tinted red. */
  destructive?: boolean;
  /** Disable the action (non-clickable, dimmed). */
  disabled?: boolean;
  /** Show a spinner in place of the icon; implies disabled. */
  loading?: boolean;
};

type RowActionsProps = {
  actions: RowAction[];
  /** Max non-destructive actions kept inline before overflowing to a menu. */
  maxInline?: number;
};

/** Icon or spinner, depending on the action's loading state. */
function actionGlyph(action: RowAction, sx?: object) {
  if (action.loading) {
    return <CircularProgress size={18} />;
  }
  return <Iconify icon={action.icon} sx={sx} />;
}

export default function RowActions({ actions, maxInline = 2 }: RowActionsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const runAndClose = useCallback(
    (fn: () => void) => () => {
      fn();
      setAnchorEl(null);
    },
    []
  );

  const renderInlineButton = (action: RowAction, color: RowAction['color']) => (
    <Tooltip key={action.key} title={action.label}>
      {/* span wrapper keeps the tooltip working while the button is disabled */}
      <span>
        <IconButton
          size="small"
          onClick={action.onClick}
          color={color}
          disabled={action.disabled || action.loading}
        >
          {actionGlyph(action)}
        </IconButton>
      </span>
    </Tooltip>
  );

  // Everything fits inline: render each action as an icon button, no menu.
  if (actions.length <= maxInline + 1) {
    return (
      <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
        {actions.map((action) =>
          renderInlineButton(action, action.destructive ? 'error' : action.color ?? 'default')
        )}
      </Stack>
    );
  }

  // Overflow: keep the first `maxInline` non-destructive actions inline, fold
  // the remaining non-destructive and ALL destructive actions into the menu.
  const nonDestructive = actions.filter((a) => !a.destructive);
  const destructive = actions.filter((a) => a.destructive);

  const inlineActions = nonDestructive.slice(0, maxInline);
  const overflowActions = nonDestructive.slice(maxInline);

  return (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
      {inlineActions.map((action) => renderInlineButton(action, action.color ?? 'default'))}

      <Tooltip title="Mais ações">
        <IconButton
          size="small"
          onClick={handleOpenMenu}
          aria-label="Mais ações"
          aria-haspopup="menu"
          aria-expanded={open ? 'true' : undefined}
        >
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 200 } } }}
      >
        {overflowActions.map((action) => (
          <MenuItem
            key={action.key}
            onClick={runAndClose(action.onClick)}
            disabled={action.disabled || action.loading}
          >
            <ListItemIcon>{actionGlyph(action)}</ListItemIcon>
            <ListItemText>{action.label}</ListItemText>
          </MenuItem>
        ))}

        {destructive.length > 0 && overflowActions.length > 0 && <Divider sx={{ my: 0.5 }} />}

        {destructive.map((action) => (
          <MenuItem
            key={action.key}
            onClick={runAndClose(action.onClick)}
            disabled={action.disabled || action.loading}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>{actionGlyph(action, { color: 'error.main' })}</ListItemIcon>
            <ListItemText>{action.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
}
