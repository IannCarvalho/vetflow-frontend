import type { Client } from 'src/types';

import { useNavigate } from 'react-router-dom';
/**
 * VetFlow Clientes Page
 * Displays a table of clients (pet owners) with CRUD operations
 */
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
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

import { useGetClients, useDeleteClient } from 'src/hooks/useClientsQuery';

import { maskCPF, maskPhone } from 'src/utils/masks';
import { getApiErrorMessage } from 'src/utils/api-error';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import RowActions from 'src/components/row-actions';

import ClientFormDialog from 'src/sections/clients/client-form-dialog';

// -----------------------------------------------------------------------

export default function ClientesPage() {
  const navigate = useNavigate();
  const { data: clients, isLoading } = useGetClients();
  const deleteClientMutation = useDeleteClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openForm, setOpenForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Filter clients by search term
  const filteredClients = useMemo(() => {
    if (!clients || !searchTerm.trim()) return clients || [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    return clients.filter(
      (client) =>
        client.full_name.toLowerCase().includes(lowerSearchTerm) ||
        client.cpf.includes(searchTerm) ||
        client.phone.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  // Current page slice of the already-filtered list (pagination is client-side)
  const paginatedClients = useMemo(
    () => filteredClients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredClients, page, rowsPerPage]
  );

  const handleAddClient = useCallback(() => {
    setSelectedClient(null);
    setOpenForm(true);
  }, []);

  const handleEditClient = useCallback((client: Client) => {
    setSelectedClient(client);
    setOpenForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setOpenForm(false);
    setSelectedClient(null);
  }, []);

  const handleFormSuccess = useCallback(
    (message: string) => {
      setSnackbar({ open: true, message, severity: 'success' });
      handleCloseForm();
    },
    [handleCloseForm]
  );

  const handleDeleteClick = useCallback((clientId: string) => {
    setClientToDelete(clientId);
    setOpenDeleteDialog(true);
  }, []);

  const clientPendingDeletion = useMemo(
    () => clients?.find((c) => c.id === clientToDelete) ?? null,
    [clients, clientToDelete]
  );

  const handleConfirmDelete = useCallback(() => {
    if (clientToDelete) {
      deleteClientMutation.mutate(clientToDelete, {
        onSuccess: () => {
          setSnackbar({
            open: true,
            message: 'Cliente deletado com sucesso!',
            severity: 'success',
          });
          setOpenDeleteDialog(false);
          setClientToDelete(null);
        },
        onError: (error) => {
          setSnackbar({
            open: true,
            message: getApiErrorMessage(error, 'Erro ao deletar cliente'),
            severity: 'error',
          });
        },
      });
    }
  }, [clientToDelete, deleteClientMutation]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleViewPets = useCallback(
    (client: Client) => {
      navigate(`/clientes/${client.id}/pets`);
    },
    [navigate]
  );

  return (
    <>
      <title>Clientes - VetFlow</title>
      <DashboardContent maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h4">Clientes</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleAddClient}
          >
            Novo Cliente
          </Button>
        </Stack>

        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Pesquisar por nome, CPF ou telefone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <Iconify icon="eva:search-fill" sx={{ mr: 1, color: 'text.secondary' }} />
                ),
              },
            }}
          />
        </Box>

        <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          {isLoading ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'background.neutral' }}>
                    <TableCell>Nome Completo</TableCell>
                    <TableCell>CPF</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>Endereço</TableCell>
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
                      <TableCell align="right">
                        <Skeleton variant="text" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : filteredClients && filteredClients.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'background.neutral' }}>
                    <TableCell>Nome Completo</TableCell>
                    <TableCell>CPF</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>Endereço</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedClients.map((client) => (
                    <TableRow key={client.id} hover>
                      <TableCell>{client.full_name}</TableCell>
                      <TableCell>{maskCPF(client.cpf)}</TableCell>
                      <TableCell>{maskPhone(client.phone)}</TableCell>
                      <TableCell>
                        {client.address.street}, {client.address.number}
                      </TableCell>
                      <TableCell align="right">
                        <RowActions
                          maxInline={3}
                          actions={[
                            {
                              key: 'edit',
                              label: 'Editar',
                              icon: 'solar:pen-bold',
                              onClick: () => handleEditClient(client),
                            },
                            {
                              key: 'pets',
                              label: 'Ver pets',
                              icon: 'solar:paw-bold',
                              color: 'warning',
                              onClick: () => handleViewPets(client),
                            },
                            {
                              key: 'delete',
                              label: 'Deletar',
                              icon: 'solar:trash-bin-trash-bold',
                              destructive: true,
                              onClick: () => handleDeleteClick(client.id),
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
                count={filteredClients.length}
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
              {searchTerm
                ? 'Nenhum cliente encontrado com essa busca'
                : 'Nenhum cliente registrado'}
            </Box>
          )}
        </Card>

        {/* Form Dialog */}
        <ClientFormDialog
          open={openForm}
          onClose={handleCloseForm}
          client={selectedClient}
          onSuccess={handleFormSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Excluir cliente?</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Você está prestes a excluir{' '}
              <strong>{clientPendingDeletion?.full_name ?? 'este cliente'}</strong>.
            </DialogContentText>
            <Alert severity="warning">
              Todos os <strong>pets</strong>, <strong>consultas</strong> e <strong>vacinas</strong>{' '}
              vinculados a este cliente também serão excluídos. Essa ação não pode ser desfeita.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={deleteClientMutation.isPending}
            >
              {deleteClientMutation.isPending ? 'Excluindo...' : 'Excluir'}
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
