/**
 * VetFlow Vacinas Page
 * Consolidated list of every vaccine record across all pets, with upcoming-dose
 * highlighting, search and edit/delete actions.
 */
import { useMemo, useState, useCallback } from 'react';

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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { useGetPets } from 'src/hooks/usePetsQuery';
import { useGetVaccines, useDeleteVaccine } from 'src/hooks/useVaccinesQuery';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import VaccineFormDialog from 'src/sections/vaccines/vaccine-form-dialog';

import type { Vaccine } from '../types';

// -----------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;
const UPCOMING_WINDOW_DAYS = 30;
const URGENT_THRESHOLD_DAYS = 7;

const FILTER_OPTIONS = ['Todas', 'A vencer (30 dias)'] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

export default function VacinasPage() {
  const { data: allVaccines, isLoading } = useGetVaccines();
  const { data: allPets } = useGetPets();
  const deleteVaccineMutation = useDeleteVaccine();

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterOption>('Todas');
  const [openForm, setOpenForm] = useState(false);
  const [vaccineToEdit, setVaccineToEdit] = useState<Vaccine | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [vaccineToDelete, setVaccineToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const now = useMemo(() => new Date(), []);

  const petNameById = useMemo(() => {
    const map = new Map<string, string>();
    allPets?.forEach((pet) => map.set(pet.id, pet.name));
    return map;
  }, [allPets]);

  const getPetName = (petId: string) => petNameById.get(petId) ?? 'Pet removido';

  const daysUntil = (dateStr: string) =>
    Math.ceil((new Date(dateStr).getTime() - now.getTime()) / DAY_MS);

  const isUpcoming = useCallback(
    (v: Vaccine) => {
      if (!v.next_dose_date) return false;
      const next = new Date(v.next_dose_date);
      const windowEnd = new Date(now.getTime() + UPCOMING_WINDOW_DAYS * DAY_MS);
      return next >= now && next <= windowEnd;
    },
    [now]
  );

  const visibleVaccines = useMemo(() => {
    let result = allVaccines ?? [];

    if (filter === 'A vencer (30 dias)') {
      result = result.filter(isUpcoming);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          v.vaccine_name.toLowerCase().includes(term) ||
          v.manufacturer?.toLowerCase().includes(term) ||
          getPetName(v.pet_id).toLowerCase().includes(term)
      );
    }

    // Sort by next dose (soonest first); records without a next dose go last.
    return [...result].sort((a, b) => {
      const aDate = a.next_dose_date ? new Date(a.next_dose_date).getTime() : Infinity;
      const bDate = b.next_dose_date ? new Date(b.next_dose_date).getTime() : Infinity;
      return aDate - bDate;
    });
    // getPetName depends on petNameById, which is covered by allPets.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allVaccines, filter, searchTerm, isUpcoming, petNameById]);

  const handleEdit = useCallback((vaccine: Vaccine) => {
    setVaccineToEdit(vaccine);
    setOpenForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setOpenForm(false);
    setVaccineToEdit(null);
  }, []);

  const handleFormSuccess = useCallback(
    (message: string) => {
      setSnackbar({ open: true, message, severity: 'success' });
      handleCloseForm();
    },
    [handleCloseForm]
  );

  const handleDeleteClick = useCallback((id: string) => {
    setVaccineToDelete(id);
    setOpenDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!vaccineToDelete) return;
    deleteVaccineMutation.mutate(vaccineToDelete, {
      onSuccess: () => {
        setSnackbar({ open: true, message: 'Vacinação deletada com sucesso!', severity: 'success' });
        setOpenDeleteDialog(false);
        setVaccineToDelete(null);
      },
      onError: () => {
        setSnackbar({ open: true, message: 'Erro ao deletar vacinação', severity: 'error' });
      },
    });
  }, [vaccineToDelete, deleteVaccineMutation]);

  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  return (
    <>
      <title>Vacinas - VetFlow</title>
      <DashboardContent maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h4">Vacinas</Typography>
        </Stack>

        <TextField
          placeholder="Buscar por vacina, fabricante ou pet..."
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

        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          {FILTER_OPTIONS.map((option) => (
            <Chip
              key={option}
              label={option}
              onClick={() => setFilter(option)}
              color={filter === option ? 'primary' : 'default'}
              variant={filter === option ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>

        <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          {isLoading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : visibleVaccines.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'background.neutral' }}>
                    <TableCell>Pet</TableCell>
                    <TableCell>Vacina</TableCell>
                    <TableCell>Fabricante</TableCell>
                    <TableCell>Lote</TableCell>
                    <TableCell>Data Aplicação</TableCell>
                    <TableCell>Próxima Dose</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleVaccines.map((v) => {
                    const remaining = v.next_dose_date ? daysUntil(v.next_dose_date) : null;
                    const upcoming = isUpcoming(v);
                    const urgent = remaining !== null && remaining <= URGENT_THRESHOLD_DAYS;
                    return (
                      <TableRow key={v.id} hover>
                        <TableCell>{getPetName(v.pet_id)}</TableCell>
                        <TableCell>{v.vaccine_name}</TableCell>
                        <TableCell>{v.manufacturer || '-'}</TableCell>
                        <TableCell>{v.batch || '-'}</TableCell>
                        <TableCell>
                          {new Date(v.date_applied).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {v.next_dose_date ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {new Date(v.next_dose_date).toLocaleDateString('pt-BR')}
                              {upcoming && (
                                <Chip
                                  size="small"
                                  label={
                                    remaining !== null && remaining <= 0
                                      ? 'Hoje'
                                      : `${remaining} ${remaining === 1 ? 'dia' : 'dias'}`
                                  }
                                  color={urgent ? 'error' : 'warning'}
                                  variant={urgent ? 'filled' : 'outlined'}
                                />
                              )}
                            </Box>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleEdit(v)}>
                              <Iconify icon="solar:pen-bold" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Deletar">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(v.id)}
                              color="error"
                            >
                              <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              {filter === 'A vencer (30 dias)'
                ? 'Nenhuma vacina a vencer nos próximos 30 dias'
                : 'Nenhuma vacinação registrada'}
            </Box>
          )}
        </Card>

        {/* Edit dialog (creation happens from a specific pet's page) */}
        <VaccineFormDialog
          open={openForm}
          onClose={handleCloseForm}
          vaccine={vaccineToEdit}
          onSuccess={handleFormSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Tem certeza?</DialogTitle>
          <DialogContent>
            <DialogContentText>Essa ação não pode ser desfeita.</DialogContentText>
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
