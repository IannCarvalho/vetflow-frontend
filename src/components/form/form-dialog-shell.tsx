import type { ReactNode } from 'react';
import type { DialogProps } from '@mui/material/Dialog';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

// ----------------------------------------------------------------------

export interface FormDialogShellProps {
  open: boolean;
  onClose: () => void;
  /** Título do dialog (ex.: "Novo Agendamento" / "Editar Agendamento"). */
  title: ReactNode;
  /** `true` enquanto uma mutation create/update está em andamento. */
  isLoading?: boolean;
  /** Mensagem de erro de submit; renderiza o `<Alert>` quando preenchida. */
  submitError?: string;
  /** Limpa a mensagem de erro (fecha o `<Alert>`). */
  onClearError?: () => void;
  /** Handler do submit (normalmente o `onSubmit` do `useEntityForm`). */
  onSubmit: () => void;
  /** Rótulo do botão de submit; default deriva de create/edit via `isEdit`. */
  submitLabel?: ReactNode;
  /** Quando `submitLabel` é omitido, escolhe entre "Atualizar"/"Criar". */
  isEdit?: boolean;
  /** Campos do formulário, renderizados dentro do Stack padrão. */
  children: ReactNode;
  maxWidth?: DialogProps['maxWidth'];
}

/**
 * Chassi compartilhado dos form-dialogs do VetFlow.
 *
 * Renderiza o invólucro idêntico que os 8 dialogs repetiam — `<Dialog>` +
 * `<DialogTitle>` + `<DialogContent>` (com `Box pt:2` + `Stack spacing:2` + o
 * `<Alert>` de erro) + `<DialogActions>` (botão Cancelar + botão submit com
 * `<CircularProgress>` e rótulo Criar/Atualizar). Os campos entram como
 * `children`; toda a moldura e o botão de submit ficam aqui.
 */
export function FormDialogShell({
  open,
  onClose,
  title,
  isLoading = false,
  submitError,
  onClearError,
  onSubmit,
  submitLabel,
  isEdit = false,
  children,
  maxWidth = 'sm',
}: FormDialogShellProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Stack spacing={2}>
            {submitError && (
              <Alert severity="error" onClose={onClearError}>
                {submitError}
              </Alert>
            )}
            {children}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onSubmit} variant="contained" disabled={isLoading}>
          {isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
          {submitLabel ?? (isEdit ? 'Atualizar' : 'Criar')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
