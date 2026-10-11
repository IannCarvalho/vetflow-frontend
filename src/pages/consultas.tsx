/**
 * VetFlow Consultas Page
 * Consolidated list of every consultation across all pets, with search,
 * report viewing and delete actions.
 */
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { useGetPets } from 'src/hooks/usePetsQuery';
import { useGetConsultations, useDeleteConsultation } from 'src/hooks/useConsultationsQuery';

import { getApiErrorMessage } from 'src/utils/api-error';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import RowActions from 'src/components/row-actions';
import { ConfirmDeleteDialog } from 'src/components/list';

import ConsultationFormDialog from 'src/sections/consultations/consultation-form-dialog';
import ConsultationReportDialog from 'src/sections/consultations/consultation-report-dialog';

import type { Consultation } from '../types';

// -----------------------------------------------------------------------

export default function ConsultasPage() {
  const { data: allConsultations, isLoading } = useGetConsultations();
  const { data: allPets } = useGetPets();
  const deleteConsultationMutation = useDeleteConsultation();

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  // The report dialog declares its own (narrower) Consultation shape, which is a
  // structural subset of the shared Consultation type, so this value is assignable.
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const petNameById = useMemo(() => {
    const map = new Map<string, string>();
    allPets?.forEach((pet) => map.set(pet.id, pet.name));
    return map;
  }, [allPets]);

  const getPetName = (petId: string) => petNameById.get(petId) ?? 'Pet removido';

  const consultationPendingDeletion = useMemo(
    () => (allConsultations ?? []).find((c) => c.id === consultationToDelete) ?? null,
    [allConsultations, consultationToDelete]
  );

  const visibleConsultations = useMemo(() => {
    let result = allConsultations ?? [];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.anamnesis.main_complaint.toLowerCase().includes(term) ||
          getPetName(c.pet_id).toLowerCase().includes(term)
      );
    }

    // Newest first
    return [...result].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    // getPetName depends on petNameById, covered by allPets.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allConsultations, searchTerm, petNameById]);

  // Current page slice of the already-filtered list (pagination is client-side)
  const paginatedConsultations = useMemo(
    () => visibleConsultations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [visibleConsultations, page, rowsPerPage]
  );

  const handleViewReport = useCallback((consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setOpenReportDialog(true);
  }, []);

  const handleAddConsultation = useCallback(() => {
    setOpenForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setOpenForm(false);
  }, []);

  const handleFormSuccess = useCallback((message: string) => {
    setSnackbar({ open: true, message, severity: 'success' });
    setOpenForm(false);
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    setConsultationToDelete(id);
    setOpenDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!consultationToDelete) return;
    deleteConsultationMutation.mutate(consultationToDelete, {
      onSuccess: () => {
        setSnackbar({ open: true, message: 'Consulta deletada com sucesso!', severity: 'success' });
        setOpenDeleteDialog(false);
        setConsultationToDelete(null);
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: getApiErrorMessage(error, 'Erro ao deletar consulta'),
          severity: 'error',
        });
      },
    });
  }, [consultationToDelete, deleteConsultationMutation]);

  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  return (
    <>
      <title>Consultas - VetFlow</title>
      <DashboardContent maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h4">Consultas</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleAddConsultation}
          >
            Nova Consulta
          </Button>
        </Stack>

        <TextField
          placeholder="Buscar por queixa ou pet..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          fullWidth
          sx={{ mb: 3 }}
          slotProps={{
            input: {
              startAdornment: (
                <Iconify icon="eva:search-fill" sx={{ mr: 1, color: 'text.disabled' }} />
              ),
            },
          }}
        />

        <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          {isLoading ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'background.neutral' }}>
                    <TableCell>Data</TableCell>
                    <TableCell>Pet</TableCell>
                    <TableCell>Queixa Principal</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton variant="text" />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" />
                      </TableCell>
                      <TableCell align="right">
                        <Skeleton variant="text" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : visibleConsultations.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'background.neutral' }}>
                    <TableCell>Data</TableCell>
                    <TableCell>Pet</TableCell>
                    <TableCell>Queixa Principal</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedConsultations.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>{new Date(c.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{getPetName(c.pet_id)}</TableCell>
                      <TableCell
                        sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}
                      >
                        {c.anamnesis.main_complaint}
                      </TableCell>
                      <TableCell align="right">
                        <RowActions
                          actions={[
                            {
                              key: 'report',
                              label: 'Ver relatório',
                              icon: 'solar:eye-bold',
                              color: 'primary',
                              onClick: () => handleViewReport(c),
                            },
                            {
                              key: 'delete',
                              label: 'Deletar',
                              icon: 'solar:trash-bin-trash-bold',
                              destructive: true,
                              onClick: () => handleDeleteClick(c.id),
                            },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={visibleConsultations.length}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                labelRowsPerPage="Linhas por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
              />
            </TableContainer>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              Nenhuma consulta registrada
            </Box>
          )}
        </Card>

        {/* Consultation Report Dialog */}
        <ConsultationReportDialog
          open={openReportDialog}
          onClose={() => setOpenReportDialog(false)}
          consultation={selectedConsultation}
        />

        {/* Consultation Form Dialog (create from the general list) */}
        <ConsultationFormDialog
          open={openForm}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDeleteDialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          isPending={deleteConsultationMutation.isPending}
          title="Excluir consulta?"
          description={
            consultationPendingDeletion && (
              <>
                Você está prestes a excluir a consulta de{' '}
                <strong>{getPetName(consultationPendingDeletion.pet_id)}</strong>.
              </>
            )
          }
          warning="Essa ação não pode ser desfeita."
        />

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
