import type { Pet } from 'src/types';

import { useNavigate } from 'react-router-dom';
/**
 * VetFlow Pets Page
 * Displays a table of pets with filtering, search, and quick actions for consultations and vaccines
 */
import { useMemo, useState, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useListPage } from 'src/hooks/useListPage';
import { useGetClients } from 'src/hooks/useClientsQuery';
import { useGetPets, useDeletePet } from 'src/hooks/usePetsQuery';

import { getApiErrorMessage } from 'src/utils/api-error';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { ListTableShell, ConfirmDeleteDialog } from 'src/components/list';

import PetFormDialog from 'src/sections/pets/pet-form-dialog';
import PetRowActions from 'src/sections/pets/pet-row-actions';

const SPECIES_OPTIONS = ['Todos', 'Cachorro', 'Gato', 'Outros'];

export default function PetsPage() {
  const { data: allPets, isLoading } = useGetPets();
  const { data: allClients } = useGetClients();
  const deletePetMutation = useDeletePet();
  const navigate = useNavigate();

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

  const handleEditPet = useCallback((pet: Pet) => {
    setSelectedPetForEdit(pet);
    setOpenPetForm(true);
  }, []);

  const handleClosePetForm = useCallback(() => {
    setOpenPetForm(false);
    setSelectedPetForEdit(null);
  }, []);

  // Map de owner_id para nome do cliente
  const clientNameMap = useMemo(() => {
    if (!allClients) return {};
    return allClients.reduce(
      (map, client) => {
        map[client.id] = client.full_name;
        return map;
      },
      {} as Record<string, string>
    );
  }, [allClients]);

  const [selectedSpecies, setSelectedSpecies] = useState('Todos');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [petToDelete, setPetToDelete] = useState<string | null>(null);
  const [openPetForm, setOpenPetForm] = useState(false);
  const [selectedPetForEdit, setSelectedPetForEdit] = useState<Pet | null>(null);

  const filteredPets = useMemo(() => {
    if (!allPets) return [];

    let result =
      selectedSpecies === 'Todos' ? allPets : allPets.filter((p) => p.species === selectedSpecies);

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerSearchTerm) ||
          p.breed?.toLowerCase().includes(lowerSearchTerm) ||
          p.species?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    return result;
  }, [allPets, selectedSpecies, searchTerm]);

  // Current page slice of the already-filtered list (pagination is client-side)
  const paginatedPets = useMemo(() => paginate(filteredPets), [paginate, filteredPets]);

  const handleViewVaccines = useCallback(
    (petId: string) => {
      navigate(`/pets/${petId}/vacinas`);
    },
    [navigate]
  );

  const handleViewConsultations = useCallback(
    (petId: string) => {
      navigate(`/pets/${petId}/consultas`);
    },
    [navigate]
  );

  const handleViewPrescriptions = useCallback(
    (petId: string) => {
      navigate(`/pets/${petId}/receitas`);
    },
    [navigate]
  );

  const handleViewAttachments = useCallback(
    (petId: string) => {
      navigate(`/pets/${petId}/anexos`);
    },
    [navigate]
  );

  const handleViewProntuario = useCallback(
    (petId: string) => {
      navigate(`/pets/${petId}/prontuario`);
    },
    [navigate]
  );

  const handleDeleteClick = useCallback((petId: string) => {
    setPetToDelete(petId);
    setOpenDeleteDialog(true);
  }, []);

  const petPendingDeletion = useMemo(
    () => allPets?.find((p) => p.id === petToDelete) ?? null,
    [allPets, petToDelete]
  );

  const handleConfirmDelete = useCallback(() => {
    if (petToDelete) {
      deletePetMutation.mutate(petToDelete, {
        onSuccess: () => {
          notify('Pet deletado com sucesso!', 'success');
          setOpenDeleteDialog(false);
          setPetToDelete(null);
        },
        onError: (error) => {
          notify(getApiErrorMessage(error, 'Erro ao deletar pet'), 'error');
        },
      });
    }
  }, [petToDelete, deletePetMutation, notify]);

  const handleFormSuccess = useCallback(
    (message: string) => {
      notify(message, 'success');
      handleClosePetForm();
    },
    [handleClosePetForm, notify]
  );

  return (
    <>
      <title>Pets - VetFlow</title>
      <DashboardContent maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h4">Pets</Typography>
        </Stack>

        {/* Search Bar */}
        <TextField
          placeholder="Buscar por nome, raça ou espécie..."
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

        {/* Species Filter */}
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          {SPECIES_OPTIONS.map((species) => (
            <Chip
              key={species}
              label={species}
              onClick={() => {
                setSelectedSpecies(species);
                setPage(0);
              }}
              color={selectedSpecies === species ? 'primary' : 'default'}
              variant={selectedSpecies === species ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>

        <ListTableShell
          columns={[
            { label: 'Nome' },
            { label: 'Espécie' },
            { label: 'Raça' },
            { label: 'Idade' },
            { label: 'Sexo' },
            { label: 'Tutor' },
            { label: 'Ações', align: 'right' },
          ]}
          rows={filteredPets}
          pageRows={paginatedPets}
          isLoading={isLoading}
          emptyMessage="Nenhum pet registrado"
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          renderRow={(pet) => (
            <TableRow key={pet.id} hover>
              <TableCell>{pet.name}</TableCell>
              <TableCell>{pet.species}</TableCell>
              <TableCell>{pet.breed || '-'}</TableCell>
              <TableCell>
                {pet.age} {pet.age_unit === 'months' ? 'mês(es)' : 'ano(s)'}
              </TableCell>
              <TableCell>{pet.sex === 'male' ? 'Macho' : 'Fêmea'}</TableCell>
              <TableCell>{clientNameMap[pet.owner_id] || 'N/A'}</TableCell>
              <TableCell align="right">
                <PetRowActions
                  petId={pet.id}
                  onViewProntuario={handleViewProntuario}
                  onEdit={() => handleEditPet(pet)}
                  onViewConsultations={handleViewConsultations}
                  onViewVaccines={handleViewVaccines}
                  onViewPrescriptions={handleViewPrescriptions}
                  onViewAttachments={handleViewAttachments}
                  onDelete={handleDeleteClick}
                />
              </TableCell>
            </TableRow>
          )}
        />

        {/* Pet Form Dialog */}
        <PetFormDialog
          open={openPetForm}
          onClose={handleClosePetForm}
          pet={selectedPetForEdit}
          onSuccess={handleFormSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDeleteDialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          isPending={deletePetMutation.isPending}
          title="Excluir pet?"
          description={
            <>
              Você está prestes a excluir{' '}
              <strong>{petPendingDeletion?.name ?? 'este pet'}</strong>.
            </>
          }
          warning={
            <>
              Todas as <strong>consultas</strong>, <strong>vacinas</strong> e{' '}
              <strong>receitas</strong> e <strong>anexos</strong> deste pet também serão excluídas.
              Essa ação não pode ser desfeita.
            </>
          }
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
