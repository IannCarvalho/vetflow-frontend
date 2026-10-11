import { useParams } from 'react-router-dom';
/**
 * Pet Vaccines Page
 * Displays all vaccines for a specific pet
 */
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import Snackbar from '@mui/material/Snackbar';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useDeleteVaccine, useGetVaccinesByPetId } from 'src/hooks/useVaccinesQuery';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import RowActions from 'src/components/row-actions';

import PetHeader from 'src/sections/pets/pet-header';
import VaccineFormDialog from 'src/sections/vaccines/vaccine-form-dialog';

// -----------------------------------------------------------------------

export default function PetVacinasPage() {
  const { petId } = useParams();
  const { data: petVaccines, isLoading } = useGetVaccinesByPetId(petId);
  const deleteVaccineMutation = useDeleteVaccine();

  const [openVaccineDialog, setOpenVaccineDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [vaccineToDelete, setVaccineToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleAddVaccine = useCallback(() => {
    setOpenVaccineDialog(true);
  }, []);

  const handleCloseVaccineDialog = useCallback(() => {
    setOpenVaccineDialog(false);
  }, []);

  const handleFormSuccess = useCallback(
    (message: string) => {
      setSnackbar({ open: true, message, severity: 'success' });
      handleCloseVaccineDialog();
    },
    [handleCloseVaccineDialog]
  );

  const handleDeleteClick = useCallback((vaccineId: string) => {
    setVaccineToDelete(vaccineId);
    setOpenDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (vaccineToDelete) {
      deleteVaccineMutation.mutate(vaccineToDelete, {
        onSuccess: () => {
          setSnackbar({
            open: true,
            message: 'Vacinação deletada com sucesso!',
            severity: 'success',
          });
          setOpenDeleteDialog(false);
          setVaccineToDelete(null);
        },
        onError: () => {
          setSnackbar({ open: true, message: 'Erro ao deletar vacinação', severity: 'error' });
        },
      });
    }
  }, [vaccineToDelete, deleteVaccineMutation]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <title>Vacinas - VetFlow</title>
      <DashboardContent maxWidth="lg">
        <PetHeader
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleAddVaccine}
            >
              Nova Vacinação
            </Button>
          }
        />

        <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          {isLoading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : petVaccines && petVaccines.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'background.neutral' }}>
                    <TableCell>Vacina</TableCell>
                    <TableCell>Fabricante</TableCell>
                    <TableCell>Lote</TableCell>
                    <TableCell>Data Aplicação</TableCell>
                    <TableCell>Próxima Dose</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {petVaccines.map((vaccine) => (
                    <TableRow key={vaccine.id} hover>
                      <TableCell>{vaccine.vaccine_name}</TableCell>
                      <TableCell>{vaccine.manufacturer || '-'}</TableCell>
                      <TableCell>{vaccine.batch || '-'}</TableCell>
                      <TableCell>
                        {new Date(vaccine.date_applied).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {vaccine.next_dose_date
                          ? new Date(vaccine.next_dose_date).toLocaleDateString('pt-BR')
                          : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <RowActions
                          actions={[
                            {
                              key: 'delete',
                              label: 'Deletar',
                              icon: 'solar:trash-bin-trash-bold',
                              destructive: true,
                              onClick: () => handleDeleteClick(vaccine.id),
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
              Nenhuma vacinação registrada
            </Box>
          )}
        </Card>

        {/* Vaccine Form Dialog */}
        <VaccineFormDialog
          open={openVaccineDialog}
          onClose={handleCloseVaccineDialog}
          onSuccess={handleFormSuccess}
          initialData={petId ? { pet_id: petId } : undefined}
        />

        {/* Delete Confirmation Dialog */}
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

        {/* Snackbar */}
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </DashboardContent>
    </>
  );
}
