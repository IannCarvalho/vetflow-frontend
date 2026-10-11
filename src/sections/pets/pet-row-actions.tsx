import { useState, useCallback } from 'react';

import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { Iconify } from 'src/components/iconify';

/**
 * Row actions for the pets table.
 *
 * Keeps the two most-used actions (Prontuário, Editar) visible inline and
 * folds the remaining navigation (Consultas, Vacinas, Receitas, Anexos) plus
 * the destructive Delete into an overflow kebab menu. Each menu item carries a
 * text label so the action is legible without relying on a hover tooltip
 * (which does not work on touch).
 */
type PetRowActionsProps = {
  petId: string;
  onViewProntuario: (petId: string) => void;
  onEdit: () => void;
  onViewConsultations: (petId: string) => void;
  onViewVaccines: (petId: string) => void;
  onViewPrescriptions: (petId: string) => void;
  onViewAttachments: (petId: string) => void;
  onDelete: (petId: string) => void;
};

export default function PetRowActions({
  petId,
  onViewProntuario,
  onEdit,
  onViewConsultations,
  onViewVaccines,
  onViewPrescriptions,
  onViewAttachments,
  onDelete,
}: PetRowActionsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Run a menu action and then close the menu.
  const runAndClose = useCallback(
    (fn: () => void) => () => {
      fn();
      setAnchorEl(null);
    },
    []
  );

  return (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
      <Tooltip title="Prontuário">
        <IconButton size="small" color="primary" onClick={() => onViewProntuario(petId)}>
          <Iconify icon="solar:clipboard-heart-bold" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Editar">
        <IconButton size="small" onClick={onEdit}>
          <Iconify icon="solar:pen-bold" />
        </IconButton>
      </Tooltip>

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
        <MenuItem onClick={runAndClose(() => onViewConsultations(petId))}>
          <ListItemIcon>
            <Iconify icon="solar:medical-visit-bold" />
          </ListItemIcon>
          <ListItemText>Ver consultas</ListItemText>
        </MenuItem>

        <MenuItem onClick={runAndClose(() => onViewVaccines(petId))}>
          <ListItemIcon>
            <Iconify icon="solar:vaccine-bold" />
          </ListItemIcon>
          <ListItemText>Ver vacinas</ListItemText>
        </MenuItem>

        <MenuItem onClick={runAndClose(() => onViewPrescriptions(petId))}>
          <ListItemIcon>
            <Iconify icon="solar:document-text-bold" />
          </ListItemIcon>
          <ListItemText>Ver receitas</ListItemText>
        </MenuItem>

        <MenuItem onClick={runAndClose(() => onViewAttachments(petId))}>
          <ListItemIcon>
            <Iconify icon="solar:paperclip-bold" />
          </ListItemIcon>
          <ListItemText>Ver anexos</ListItemText>
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={runAndClose(() => onDelete(petId))} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Iconify icon="solar:trash-bin-trash-bold" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Deletar</ListItemText>
        </MenuItem>
      </Menu>
    </Stack>
  );
}
