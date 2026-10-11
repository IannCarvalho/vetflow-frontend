import type { ReactNode } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

// ----------------------------------------------------------------------

export interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** `true` enquanto a mutation de delete está em andamento. */
  isPending?: boolean;
  /** Título do dialog. Default `"Tem certeza?"`. */
  title?: ReactNode;
  /**
   * Texto principal (ex.: "Você está prestes a excluir <strong>X</strong>.").
   * Renderiza um `<DialogContentText>` quando preenchido.
   */
  description?: ReactNode;
  /**
   * Conteúdo do `<Alert severity="warning">` (ex.: "Essa ação não pode ser
   * desfeita."). Omita para não renderizar o alerta.
   */
  warning?: ReactNode;
  /** Rótulo do botão de cancelar. Default `"Cancelar"`. */
  cancelLabel?: ReactNode;
  /** Rótulo do botão de confirmar. Default `"Excluir"`. */
  confirmLabel?: ReactNode;
  /** Rótulo exibido enquanto `isPending`. Default `"Excluindo..."`. */
  pendingLabel?: ReactNode;
}

/**
 * Dialog de confirmação de exclusão reutilizável das páginas-lista do VetFlow.
 *
 * Absorve o invólucro repetido (`<Dialog>` + `<DialogTitle>` +
 * `<DialogContent>` com texto/`<Alert>` + `<DialogActions>` com Cancelar +
 * botão de confirmar vermelho que troca o rótulo quando `isPending`). O texto
 * e o alerta são por página, então entram como `description`/`warning`; ambos
 * são opcionais para cobrir tanto os dialogs ricos (pets/clientes) quanto os
 * mínimos (vacinas/catálogo).
 */
export function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  isPending = false,
  title = 'Tem certeza?',
  description,
  warning,
  cancelLabel = 'Cancelar',
  confirmLabel = 'Excluir',
  pendingLabel = 'Excluindo...',
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {description && <DialogContentText sx={{ mb: 2 }}>{description}</DialogContentText>}
        {warning && <Alert severity="warning">{warning}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{cancelLabel}</Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={isPending}>
          {isPending ? pendingLabel : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
