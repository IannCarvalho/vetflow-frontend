/**
 * Pet Prescriptions Page
 * Displays all prescriptions (receituários) for a specific pet, with create,
 * edit, delete and a printable report.
 */
import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import Snackbar from '@mui/material/Snackbar';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useGetPets } from 'src/hooks/usePetsQuery';
import { useGetClients } from 'src/hooks/useClientsQuery';
import { useDeletePrescription, useGetPrescriptionsByPetId } from 'src/hooks/usePrescriptionsQuery';

import { getApiErrorMessage } from 'src/utils/api-error';

import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import RowActions from 'src/components/row-actions';

import PrescriptionFormDialog from 'src/sections/prescriptions/prescription-form-dialog';
import PrescriptionReportDialog from 'src/sections/prescriptions/prescription-report-dialog';

import type { Prescription } from '../types';

// -----------------------------------------------------------------------

export default function PetReceitasPage() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: allPets } = useGetPets();
  const { data: allClients } = useGetClients();
  const { data: prescriptions, isLoading } = useGetPrescriptionsByPetId(petId);
  const deleteMutation = useDeletePrescription();

  const [openForm, setOpenForm] = useState(false);
  const [toEdit, setToEdit] = useState<Prescription | null>(null);
  const [openReport, setOpenReport] = useState(false);
  const [toView, setToView] = useState<Prescription | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const currentPet = allPets?.find((p) => p.id === petId);
  const ownerName = allClients?.find((c) => c.id === currentPet?.owner_id)?.full_name;

  const handleNew = useCallback(() => {
    setToEdit(null);
    setOpenForm(true);
  }, []);

  const handleEdit = useCallback((prescription: Prescription) => {
    setToEdit(prescription);
    setOpenForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setOpenForm(false);
    setToEdit(null);
  }, []);

  const handleFormSuccess = useCallback(
    (message: string) => {
      setSnackbar({ open: true, message, severity: 'success' });
      handleCloseForm();
    },
    [handleCloseForm]
  );

  const handleView = useCallback((prescription: Prescription) => {
    setToView(prescription);
    setOpenReport(true);
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    setToDelete(id);
    setOpenDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!toDelete) return;
    deleteMutation.mutate(toDelete, {
      onSuccess: () => {
        setSnackbar({ open: true, message: 'Receituário excluído com sucesso!', severity: 'success' });
        setOpenDeleteDialog(false);
        setToDelete(null);
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: getApiErrorMessage(error, 'Erro ao excluir receituário'),
          severity: 'error',
        });
      },
    });
  }, [toDelete, deleteMutation]);

  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  return (
    <>
      <title>Receitas - VetFlow</title>
      <DashboardContent maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button color="inherit" variant="text" onClick={() => navigate('/pets')}>
              ← Voltar
            </Button>
            <Typography variant="h4">Receitas de {currentPet?.name || 'Carregando...'}</Typography>
          </Stack>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleNew}
          >
            Novo Receituário
          </Button>
        </Stack>

        <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          {isLoading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : prescriptions && prescriptions.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'background.neutral' }}>
                    <TableCell>Data</TableCell>
                    <TableCell>Medicamentos</TableCell>
                    <TableCell>Observações</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prescriptions.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>{new Date(p.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        {p.items.length}{' '}
                        {p.items.length === 1 ? 'medicamento' : 'medicamentos'}
                        {p.items[0] ? ` · ${p.items[0].medication}` : ''}
                        {p.items.length > 1 ? '...' : ''}
                      </TableCell>
                      <TableCell>{p.general_notes ? p.general_notes.slice(0, 40) : '-'}</TableCell>
                      <TableCell align="right">
                        <RowActions
                          maxInline={3}
                          actions={[
                            {
                              key: 'view',
                              label: 'Visualizar / Imprimir',
                              icon: 'solar:document-text-bold',
                              color: 'info',
                              onClick: () => handleView(p),
                            },
                            {
                              key: 'edit',
                              label: 'Editar',
                              icon: 'solar:pen-bold',
                              onClick: () => handleEdit(p),
                            },
                            {
                              key: 'delete',
                              label: 'Excluir',
                              icon: 'solar:trash-bin-trash-bold',
                              destructive: true,
                              onClick: () => handleDeleteClick(p.id),
                            },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              Nenhum receituário registrado
            </Box>
          )}
        </Card>

        <PrescriptionFormDialog
          open={openForm}
          onClose={handleCloseForm}
          prescription={toEdit}
          onSuccess={handleFormSuccess}
          initialData={petId ? { pet_id: petId } : undefined}
        />

        <PrescriptionReportDialog
          open={openReport}
          onClose={() => setOpenReport(false)}
          prescription={toView}
          petName={currentPet?.name}
          ownerName={ownerName}
          vetName={user?.name}
        />

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
