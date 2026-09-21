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
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Snackbar from '@mui/material/Snackbar';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useGetPets } from 'src/hooks/usePetsQuery';
import { useGetConsultations, useDeleteConsultation } from 'src/hooks/useConsultationsQuery';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import ConsultationReportDialog from 'src/sections/consultations/consultation-report-dialog';

import type { Consultation } from '../types';

// -----------------------------------------------------------------------

export default function ConsultasPage() {
  const { data: allConsultations, isLoading } = useGetConsultations();
  const { data: allPets } = useGetPets();
  const deleteConsultationMutation = useDeleteConsultation();

  const [searchTerm, setSearchTerm] = useState('');
  const [openReportDialog, setOpenReportDialog] = useState(false);
  // Report dialog defines its own Consultation shape; use a loose type to match
  // the existing pet-consultas page and avoid structural type friction.
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
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

  const handleViewReport = useCallback((consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setOpenReportDialog(true);
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
      onError: () => {
        setSnackbar({ open: true, message: 'Erro ao deletar consulta', severity: 'error' });
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
        </Stack>

        <TextField
          placeholder="Buscar por queixa ou pet..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          sx={{ mb: 3, '& .MuiOutlinedInput-root': { backgroundColor: '#FFFFFF' } }}
          InputProps={{
            startAdornment: (
              <Iconify icon="eva:search-fill" sx={{ mr: 1, color: 'text.disabled' }} />
            ),
          }}
        />

        <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          {isLoading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
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
                  {visibleConsultations.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>{new Date(c.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{getPetName(c.pet_id)}</TableCell>
                      <TableCell
                        sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}
                      >
                        {c.anamnesis.main_complaint}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Ver Relatório">
                          <IconButton
                            size="small"
                            onClick={() => handleViewReport(c)}
                            color="primary"
                          >
                            <Iconify icon="solar:eye-bold" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Deletar">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(c.id)}
                            color="error"
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
