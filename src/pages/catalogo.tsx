/**
 * VetFlow Catálogo Page
 * Manages the clinic's services and products, with price, stock and low-stock
 * highlighting, type filter, search and create/edit/delete.
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

import { useGetCatalogItems, useDeleteCatalogItem } from 'src/hooks/useCatalogQuery';

import { getApiErrorMessage } from 'src/utils/api-error';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import CatalogFormDialog from 'src/sections/catalog/catalog-form-dialog';

import type { CatalogItem } from '../types';

// -----------------------------------------------------------------------

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'service', label: 'Serviços' },
  { value: 'product', label: 'Produtos' },
] as const;

type FilterValue = (typeof FILTERS)[number]['value'];

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CatalogoPage() {
  const { data: items, isLoading } = useGetCatalogItems();
  const deleteMutation = useDeleteCatalogItem();

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterValue>('all');
  const [openForm, setOpenForm] = useState(false);
  const [toEdit, setToEdit] = useState<CatalogItem | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const visible = useMemo(() => {
    let result = items ?? [];

    if (filter !== 'all') {
      result = result.filter((i) => i.type === filter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(term) || i.description?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [items, filter, searchTerm]);

  const handleNew = useCallback(() => {
    setToEdit(null);
    setOpenForm(true);
  }, []);

  const handleEdit = useCallback((item: CatalogItem) => {
    setToEdit(item);
    setOpenForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setOpenForm(false);
    setToEdit(null);
  }, []);

  const handleFormSuccess = useCallback(
    (message: string) => {
      setSnackbar({ open: true, message, severity: 'success' });
      handleCloseForm();
    },
    [handleCloseForm]
  );

  const handleDeleteClick = useCallback((id: string) => {
    setToDelete(id);
    setOpenDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!toDelete) return;
    deleteMutation.mutate(toDelete, {
      onSuccess: () => {
        setSnackbar({ open: true, message: 'Item excluído com sucesso!', severity: 'success' });
        setOpenDeleteDialog(false);
        setToDelete(null);
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: getApiErrorMessage(error, 'Erro ao excluir item'),
          severity: 'error',
        });
      },
    });
  }, [toDelete, deleteMutation]);

  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  return (
    <>
      <title>Catálogo - VetFlow</title>
      <DashboardContent maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h4">Catálogo</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleNew}
          >
            Novo Item
          </Button>
        </Stack>

        <TextField
          placeholder="Buscar por nome ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <Iconify icon="eva:search-fill" sx={{ mr: 1, color: 'text.disabled' }} />
            ),
          }}
        />

        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          {FILTERS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              onClick={() => setFilter(option.value)}
              color={filter === option.value ? 'primary' : 'default'}
              variant={filter === option.value ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>

        <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          {isLoading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : visible.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'background.neutral' }}>
                    <TableCell>Nome</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="right">Preço</TableCell>
                    <TableCell align="right">Estoque</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visible.map((item) => {
                    const lowStock =
                      item.type === 'product' &&
                      item.min_stock > 0 &&
                      item.stock_quantity <= item.min_stock;
                    return (
                      <TableRow key={item.id} hover>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={item.type === 'product' ? 'Produto' : 'Serviço'}
                            color={item.type === 'product' ? 'info' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">{formatBRL(item.price)}</TableCell>
                        <TableCell align="right">
                          {item.type === 'product' ? (
                            <Box
                              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}
                            >
                              {item.stock_quantity} {item.unit || 'un'}
                              {lowStock && (
                                <Chip size="small" label="Baixo" color="warning" />
                              )}
                            </Box>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={item.active ? 'Ativo' : 'Inativo'}
                            color={item.active ? 'success' : 'default'}
                            variant={item.active ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleEdit(item)}>
                              <Iconify icon="solar:pen-bold" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(item.id)}
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
              Nenhum item no catálogo
            </Box>
          )}
        </Card>

        <CatalogFormDialog
          open={openForm}
          onClose={handleCloseForm}
          item={toEdit}
          onSuccess={handleFormSuccess}
        />

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

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </DashboardContent>
    </>
  );
}
