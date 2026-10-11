import { useMemo, useState, useCallback } from 'react';
/**
 * VetFlow Client Pets Page
 * Displays all pets for a specific client with CRUD operations
 */
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Snackbar from '@mui/material/Snackbar';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { useGetClients } from 'src/hooks/useClientsQuery';
import { useGetPets, useDeletePet } from 'src/hooks/usePetsQuery';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import PetFormDialog from 'src/sections/pets/pet-form-dialog';

// -----------------------------------------------------------------------

export default function ClientPetsPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { data: clients, isLoading: clientsLoading } = useGetClients();
  const { data: pets, isLoading: petsLoading } = useGetPets();
  const deleteClientMutation = useDeletePet();

  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [petToDelete, setPetToDelete] = useState<string | null>(null);
  const [selectedPetForEdit, setSelectedPetForEdit] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Get current client
  const currentClient = useMemo(() => clients?.find((c) => c.id === clientId), [clients, clientId]);

  // Filter pets for this client
  const clientPets = useMemo(
    () => pets?.filter((pet) => pet.owner_id === clientId) || [],
    [pets, clientId]
  );

  const handleAddPet = useCallback(() => {
    setOpenForm(true);
  }, []);

  const handleEditPet = useCallback((pet: any) => {
    setSelectedPetForEdit(pet);
    setOpenForm(true);
  }, []);

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

  const handleCloseForm = useCallback(() => {
    setOpenForm(false);
  }, []);

  const handleFormSuccess = useCallback(
    (message: string) => {
      setSnackbar({ open: true, message, severity: 'success' });
      handleCloseForm();
    },
    [handleCloseForm]
  );

  const handleDeleteClick = useCallback((petId: string) => {
    setPetToDelete(petId);
    setOpenDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (petToDelete) {
      deleteClientMutation.mutate(petToDelete, {
        onSuccess: () => {
          setSnackbar({ open: true, message: 'Pet deletado com sucesso!', severity: 'success' });
          setOpenDeleteDialog(false);
          setPetToDelete(null);
        },
        onError: () => {
          setSnackbar({ open: true, message: 'Erro ao deletar pet', severity: 'error' });
        },
      });
    }
  }, [petToDelete, deleteClientMutation]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleBackToClients = () => {
    navigate('/clientes');
  };

  const isLoading = clientsLoading || petsLoading;

  return (
    <>
      <title>Pets do Cliente - VetFlow</title>
      <DashboardContent maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button color="inherit" variant="text" onClick={handleBackToClients}>
              ← Voltar
            </Button>
            <Typography variant="h4">
              Pets de {currentClient?.full_name || 'Carregando...'}
            </Typography>
          </Stack>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleAddPet}
          >
            Novo Pet
          </Button>
        </Stack>

        <Card variant="flat">
          {isLoading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : clientPets && clientPets.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'background.neutral' }}>
                    <TableCell>Nome</TableCell>
                    <TableCell>Espécie</TableCell>
                    <TableCell>Raça</TableCell>
                    <TableCell>Sexo</TableCell>
                    <TableCell>Peso (kg)</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientPets.map((pet) => (
                    <TableRow key={pet.id} hover>
                      <TableCell>{pet.name}</TableCell>
                      <TableCell>{pet.species}</TableCell>
                      <TableCell>{pet.breed || '-'}</TableCell>
                      <TableCell>{pet.sex === 'male' ? 'Macho' : 'Fêmea'}</TableCell>
                      <TableCell>{pet.weight}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleEditPet(pet)}>
                            <Iconify icon="solar:pen-bold" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ver Consultas">
                          <IconButton
                            size="small"
                            onClick={() => handleViewConsultations(pet.id)}
                            color="warning"
                          >
                            <Iconify icon="solar:medical-visit-bold" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ver Vacinas">
                          <IconButton
                            size="small"
                            onClick={() => handleViewVaccines(pet.id)}
                            color="warning"
                          >
                            <Iconify icon="solar:vaccine-bold" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Deletar">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(pet.id)}
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
              Nenhum pet registrado para este cliente
            </Box>
          )}
        </Card>

        {/* Pet Form Dialog */}
        <PetFormDialog
          open={openForm}
          onClose={handleCloseForm}
          pet={selectedPetForEdit}
          onSuccess={handleFormSuccess}
          initialData={!selectedPetForEdit && clientId ? { owner_id: clientId } : undefined}
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
