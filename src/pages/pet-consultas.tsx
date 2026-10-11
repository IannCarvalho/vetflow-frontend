import { useParams } from 'react-router-dom';
/**
 * Pet Consultations Page
 * Displays all consultations for a specific pet
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

import { useDeleteConsultation, useGetConsultationsByPetId } from 'src/hooks/useConsultationsQuery';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import RowActions from 'src/components/row-actions';

import PetHeader from 'src/sections/pets/pet-header';
import ConsultationFormDialog from 'src/sections/consultations/consultation-form-dialog';
import ConsultationReportDialog from 'src/sections/consultations/consultation-report-dialog';

// -----------------------------------------------------------------------

export default function PetConsultasPage() {
  const { petId } = useParams();
  const { data: petConsultations, isLoading } = useGetConsultationsByPetId(petId);
  const deleteConsultationMutation = useDeleteConsultation();

  const [openConsultationDialog, setOpenConsultationDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState<string | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleAddConsultation = useCallback(() => {
    setOpenConsultationDialog(true);
  }, []);

  const handleCloseConsultationDialog = useCallback(() => {
    setOpenConsultationDialog(false);
  }, []);

  const handleFormSuccess = useCallback(
    (message: string) => {
      setSnackbar({ open: true, message, severity: 'success' });
      handleCloseConsultationDialog();
    },
    [handleCloseConsultationDialog]
  );

  const handleDeleteClick = useCallback((consultationId: string) => {
    setConsultationToDelete(consultationId);
    setOpenDeleteDialog(true);
  }, []);

  const handleViewReport = useCallback((consultation: any) => {
    setSelectedConsultation(consultation);
    setOpenReportDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (consultationToDelete) {
      deleteConsultationMutation.mutate(consultationToDelete, {
        onSuccess: () => {
          setSnackbar({
            open: true,
            message: 'Consulta deletada com sucesso!',
            severity: 'success',
          });
          setOpenDeleteDialog(false);
          setConsultationToDelete(null);
        },
        onError: () => {
          setSnackbar({ open: true, message: 'Erro ao deletar consulta', severity: 'error' });
        },
      });
    }
  }, [consultationToDelete, deleteConsultationMutation]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <title>Consultas - VetFlow</title>
      <DashboardContent maxWidth="lg">
        <PetHeader
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleAddConsultation}
            >
              Nova Consulta
            </Button>
          }
        />

        <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          {isLoading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : petConsultations && petConsultations.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'background.neutral' }}>
                    <TableCell>Data</TableCell>
                    <TableCell>Queixa Principal</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {petConsultations.map((consultation) => (
                    <TableRow key={consultation.id} hover>
                      <TableCell>
                        {new Date(consultation.date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell
                        sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}
                      >
                        {consultation.anamnesis.main_complaint}
                      </TableCell>
                      <TableCell align="right">
                        <RowActions
                          actions={[
                            {
                              key: 'report',
                              label: 'Ver relatório',
                              icon: 'solar:eye-bold',
                              color: 'primary',
                              onClick: () => handleViewReport(consultation),
                            },
                            {
                              key: 'delete',
                              label: 'Deletar',
                              icon: 'solar:trash-bin-trash-bold',
                              destructive: true,
                              onClick: () => handleDeleteClick(consultation.id),
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
              Nenhuma consulta registrada
            </Box>
          )}
        </Card>

        {/* Consultation Form Dialog */}
        <ConsultationFormDialog
          open={openConsultationDialog}
          onClose={handleCloseConsultationDialog}
          onSuccess={handleFormSuccess}
          initialData={petId ? { pet_id: petId } : undefined}
        />

        {/* Consultation Report Dialog */}
        <ConsultationReportDialog
          open={openReportDialog}
          onClose={() => setOpenReportDialog(false)}
          consultation={selectedConsultation}
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
