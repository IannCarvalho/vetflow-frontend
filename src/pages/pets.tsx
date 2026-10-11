import type { Pet } from 'src/types';

import { useNavigate } from 'react-router-dom';
/**
 * VetFlow Pets Page
 * Displays a table of pets with filtering, search, and quick actions for consultations and vaccines
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
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import DialogContentText from '@mui/material/DialogContentText';

import { useGetClients } from 'src/hooks/useClientsQuery';
import { useGetPets, useDeletePet } from 'src/hooks/usePetsQuery';

import { getApiErrorMessage } from 'src/utils/api-error';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import PetFormDialog from 'src/sections/pets/pet-form-dialog';
import PetRowActions from 'src/sections/pets/pet-row-actions';

const SPECIES_OPTIONS = ['Todos', 'Cachorro', 'Gato', 'Outros'];

export default function PetsPage() {
  const { data: allPets, isLoading } = useGetPets();
  const { data: allClients } = useGetClients();
  const deletePetMutation = useDeletePet();
  const navigate = useNavigate();

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

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('Todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [petToDelete, setPetToDelete] = useState<string | null>(null);
  const [openPetForm, setOpenPetForm] = useState(false);
  const [selectedPetForEdit, setSelectedPetForEdit] = useState<Pet | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

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
  const paginatedPets = useMemo(
    () => filteredPets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredPets, page, rowsPerPage]
  );

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
          setSnackbar({ open: true, message: 'Pet deletado com sucesso!', severity: 'success' });
          setOpenDeleteDialog(false);
          setPetToDelete(null);
        },
        onError: (error) => {
          setSnackbar({
            open: true,
            message: getApiErrorMessage(error, 'Erro ao deletar pet'),
            severity: 'error',
          });
        },
      });
    }
  }, [petToDelete, deletePetMutation]);

  const handleFormSuccess = useCallback(
    (message: string) => {
      setSnackbar({ open: true, message, severity: 'success' });
      handleClosePetForm();
    },
    [handleClosePetForm]
  );

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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

        <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          {isLoading ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'background.neutral' }}>
                    <TableCell>Nome</TableCell>
                    <TableCell>Espécie</TableCell>
                    <TableCell>Raça</TableCell>
                    <TableCell>Idade</TableCell>
                    <TableCell>Sexo</TableCell>
                    <TableCell>Tutor</TableCell>
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
          ) : filteredPets && filteredPets.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'background.neutral' }}>
                    <TableCell>Nome</TableCell>
                    <TableCell>Espécie</TableCell>
                    <TableCell>Raça</TableCell>
                    <TableCell>Idade</TableCell>
                    <TableCell>Sexo</TableCell>
                    <TableCell>Tutor</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPets.map((pet) => (
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
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={filteredPets.length}
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
              Nenhum pet registrado
            </Box>
          )}
        </Card>

        {/* Pet Form Dialog */}
        <PetFormDialog
          open={openPetForm}
          onClose={handleClosePetForm}
          pet={selectedPetForEdit}
          onSuccess={handleFormSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Excluir pet?</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Você está prestes a excluir{' '}
              <strong>{petPendingDeletion?.name ?? 'este pet'}</strong>.
            </DialogContentText>
            <Alert severity="warning">
              Todas as <strong>consultas</strong>, <strong>vacinas</strong> e{' '}
              <strong>receitas</strong> e <strong>anexos</strong> deste pet também serão excluídas.
              Essa ação não pode ser desfeita.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={deletePetMutation.isPending}
            >
              {deletePetMutation.isPending ? 'Excluindo...' : 'Excluir'}
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
