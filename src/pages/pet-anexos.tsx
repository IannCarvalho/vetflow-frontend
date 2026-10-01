/**
 * Pet Attachments Page
 * Lists a pet's exams/images/reports with upload, download/preview and delete.
 */
import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Snackbar from '@mui/material/Snackbar';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useGetPets } from 'src/hooks/usePetsQuery';
import { useDeleteAttachment, useGetAttachmentsByPetId } from 'src/hooks/useAttachmentsQuery';

import { getApiErrorMessage } from 'src/utils/api-error';

import { DashboardContent } from 'src/layouts/dashboard';
import { getAttachmentContent } from 'src/api/attachmentsApi';

import { Iconify } from 'src/components/iconify';

import AttachmentUploadDialog from 'src/sections/attachments/attachment-upload-dialog';

import type { AttachmentCategory } from '../types';

// -----------------------------------------------------------------------

const CATEGORY_LABELS: Record<AttachmentCategory, string> = {
  exam: 'Exame',
  report: 'Laudo',
  image: 'Imagem',
  document: 'Documento',
};

/** Open a base64 attachment in a new browser tab. */
function openBase64InNewTab(mimeType: string, base64: string) {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i += 1) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  // Revoke a bit later so the new tab has time to load it.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export default function PetAnexosPage() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { data: allPets } = useGetPets();
  const { data: attachments, isLoading } = useGetAttachmentsByPetId(petId);
  const deleteMutation = useDeleteAttachment(petId);

  const [openUpload, setOpenUpload] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const currentPet = allPets?.find((p) => p.id === petId);

  const handleView = useCallback(async (id: string) => {
    setDownloadingId(id);
    try {
      const full = await getAttachmentContent(id);
      openBase64InNewTab(full.mime_type, full.content);
    } catch (error) {
      setSnackbar({
        open: true,
        message: getApiErrorMessage(error, 'Erro ao abrir anexo'),
        severity: 'error',
      });
    } finally {
      setDownloadingId(null);
    }
  }, []);

  const handleUploadSuccess = useCallback((message: string) => {
    setSnackbar({ open: true, message, severity: 'success' });
    setOpenUpload(false);
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    setToDelete(id);
    setOpenDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!toDelete) return;
    deleteMutation.mutate(toDelete, {
      onSuccess: () => {
        setSnackbar({ open: true, message: 'Anexo excluído com sucesso!', severity: 'success' });
        setOpenDeleteDialog(false);
        setToDelete(null);
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: getApiErrorMessage(error, 'Erro ao excluir anexo'),
          severity: 'error',
        });
      },
    });
  }, [toDelete, deleteMutation]);

  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  return (
    <>
      <title>Anexos - VetFlow</title>
      <DashboardContent maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button color="inherit" variant="text" onClick={() => navigate('/pets')}>
              ← Voltar
            </Button>
            <Typography variant="h4">Anexos de {currentPet?.name || 'Carregando...'}</Typography>
          </Stack>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:upload-bold" />}
            onClick={() => setOpenUpload(true)}
          >
            Novo Anexo
          </Button>
        </Stack>

        <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          {isLoading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : attachments && attachments.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'background.neutral' }}>
                    <TableCell>Nome</TableCell>
                    <TableCell>Categoria</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell>Notas</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attachments.map((att) => (
                    <TableRow key={att.id} hover>
                      <TableCell>{att.name}</TableCell>
                      <TableCell>
                        <Chip size="small" label={CATEGORY_LABELS[att.category]} variant="outlined" />
                      </TableCell>
                      <TableCell>{new Date(att.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{att.notes ? att.notes.slice(0, 40) : '-'}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Abrir / Baixar">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleView(att.id)}
                            disabled={downloadingId === att.id}
                          >
                            {downloadingId === att.id ? (
                              <CircularProgress size={18} />
                            ) : (
                              <Iconify icon="solar:download-bold" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(att.id)}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              Nenhum anexo registrado
            </Box>
          )}
        </Card>

        {petId && (
          <AttachmentUploadDialog
            open={openUpload}
            onClose={() => setOpenUpload(false)}
            petId={petId}
            onSuccess={handleUploadSuccess}
          />
        )}

        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Tem certeza?</DialogTitle>
          <DialogContent>
            <Alert severity="warning">Essa ação não pode ser desfeita.</Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">
              Excluir
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </DashboardContent>
    </>
  );
}
