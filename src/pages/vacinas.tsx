/**
 * VetFlow Vacinas Page
 * Consolidated list of every vaccine record across all pets, with upcoming-dose
 * highlighting, search and edit/delete actions.
 */
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useListPage } from 'src/hooks/useListPage';
import { useGetPets } from 'src/hooks/usePetsQuery';
import { useGetVaccines, useDeleteVaccine } from 'src/hooks/useVaccinesQuery';

import { getApiErrorMessage } from 'src/utils/api-error';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { ListTableShell, ConfirmDeleteDialog } from 'src/components/list';

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

  const {
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    paginate,
    snackbar,
    notify,
    closeSnackbar,
  } = useListPage();

  const [filter, setFilter] = useState<FilterOption>('Todas');
  const [openForm, setOpenForm] = useState(false);
  const [vaccineToEdit, setVaccineToEdit] = useState<Vaccine | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [vaccineToDelete, setVaccineToDelete] = useState<string | null>(null);

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

  // Current page slice of the already-filtered list (pagination is client-side)
  const paginatedVaccines = useMemo(
    () => paginate(visibleVaccines),
    [paginate, visibleVaccines]
  );

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
      notify(message, 'success');
      handleCloseForm();
    },
    [handleCloseForm, notify]
  );

  const handleDeleteClick = useCallback((id: string) => {
    setVaccineToDelete(id);
    setOpenDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!vaccineToDelete) return;
    deleteVaccineMutation.mutate(vaccineToDelete, {
      onSuccess: () => {
        notify('Vacinação deletada com sucesso!', 'success');
        setOpenDeleteDialog(false);
        setVaccineToDelete(null);
      },
      onError: (error) => {
        notify(getApiErrorMessage(error, 'Erro ao deletar vacinação'), 'error');
      },
    });
  }, [vaccineToDelete, deleteVaccineMutation, notify]);

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
          sx={{ mb: 3 }}
          slotProps={{
            input: {
              startAdornment: (
                <Iconify icon="eva:search-fill" sx={{ mr: 1, color: 'text.disabled' }} />
              ),
            },
          }}
        />

        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          {FILTER_OPTIONS.map((option) => (
            <Chip
              key={option}
              label={option}
              onClick={() => {
                setFilter(option);
                setPage(0);
              }}
              color={filter === option ? 'primary' : 'default'}
              variant={filter === option ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>

        <ListTableShell
          columns={[
            { label: 'Pet' },
            { label: 'Vacina' },
            { label: 'Fabricante' },
            { label: 'Lote' },
            { label: 'Data Aplicação' },
            { label: 'Próxima Dose' },
            { label: 'Ações', align: 'right' },
          ]}
          rows={visibleVaccines}
          pageRows={paginatedVaccines}
          isLoading={isLoading}
          emptyMessage={
            filter === 'A vencer (30 dias)'
              ? 'Nenhuma vacina a vencer nos próximos 30 dias'
              : 'Nenhuma vacinação registrada'
          }
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          renderRow={(v) => {
            const remaining = v.next_dose_date ? daysUntil(v.next_dose_date) : null;
            const upcoming = isUpcoming(v);
            const urgent = remaining !== null && remaining <= URGENT_THRESHOLD_DAYS;
            return (
              <TableRow key={v.id} hover>
                <TableCell>{getPetName(v.pet_id)}</TableCell>
                <TableCell>{v.vaccine_name}</TableCell>
                <TableCell>{v.manufacturer || '-'}</TableCell>
                <TableCell>{v.batch || '-'}</TableCell>
                <TableCell>{new Date(v.date_applied).toLocaleDateString('pt-BR')}</TableCell>
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
                    <IconButton size="small" onClick={() => handleDeleteClick(v.id)} color="error">
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          }}
        />

        {/* Edit dialog (creation happens from a specific pet's page) */}
        <VaccineFormDialog
          open={openForm}
          onClose={handleCloseForm}
          vaccine={vaccineToEdit}
          onSuccess={handleFormSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDeleteDialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          description="Essa ação não pode ser desfeita."
        />

        {/* Snackbar */}
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={closeSnackbar}>
          <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </DashboardContent>
    </>
  );
}
