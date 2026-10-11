/**
 * VetFlow Financeiro Page
 * Lists all invoices with revenue summary (recebido/pendente), status filter,
 * search by client and create/edit/delete actions.
 */
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
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

import { useGetClients } from 'src/hooks/useClientsQuery';
import { useGetInvoices, useDeleteInvoice } from 'src/hooks/useInvoicesQuery';

import { getApiErrorMessage } from 'src/utils/api-error';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import RowActions from 'src/components/row-actions';

import InvoiceFormDialog from 'src/sections/invoices/invoice-form-dialog';
import {
  formatBRL,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from 'src/sections/invoices/invoice-constants';

import type { Invoice, PaymentStatus } from '../types';

// -----------------------------------------------------------------------

const STATUS_FILTERS: Array<{ value: 'all' | PaymentStatus; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'paid', label: 'Pagas' },
  { value: 'partial', label: 'Parciais' },
  { value: 'overdue', label: 'Vencidas' },
  { value: 'canceled', label: 'Canceladas' },
];

function SummaryCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Card sx={{ p: 2.5, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" sx={{ mt: 0.5, color: color ?? 'text.primary' }}>
        {value}
      </Typography>
    </Card>
  );
}

export default function FinanceiroPage() {
  const { data: invoices, isLoading } = useGetInvoices();
  const { data: clients } = useGetClients();
  const deleteMutation = useDeleteInvoice();

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | PaymentStatus>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openForm, setOpenForm] = useState(false);
  const [toEdit, setToEdit] = useState<Invoice | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const clientNameById = useMemo(() => {
    const map = new Map<string, string>();
    clients?.forEach((c) => map.set(c.id, c.full_name));
    return map;
  }, [clients]);

  const getClientName = useCallback(
    (id: string) => clientNameById.get(id) ?? 'Cliente removido',
    [clientNameById]
  );

  const summary = useMemo(() => {
    const list = invoices ?? [];
    const received = list
      .filter((i) => i.status === 'paid')
      .reduce((acc, i) => acc + i.total, 0);
    const pending = list
      .filter((i) => i.status === 'pending' || i.status === 'partial' || i.status === 'overdue')
      .reduce((acc, i) => acc + i.total, 0);
    return { received, pending, count: list.length };
  }, [invoices]);

  const visible = useMemo(() => {
    let result = invoices ?? [];

    if (filter !== 'all') {
      result = result.filter((i) => i.status === filter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((i) => getClientName(i.client_id).toLowerCase().includes(term));
    }

    return result;
  }, [invoices, filter, searchTerm, getClientName]);

  // Current page slice of the already-filtered list (pagination is client-side).
  // The summary cards above intentionally aggregate the full invoices list, not this slice.
  const paginatedInvoices = useMemo(
    () => visible.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [visible, page, rowsPerPage]
  );

  const handleNew = useCallback(() => {
    setToEdit(null);
    setOpenForm(true);
  }, []);

  const handleEdit = useCallback((invoice: Invoice) => {
    setToEdit(invoice);
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
        setSnackbar({ open: true, message: 'Fatura excluída com sucesso!', severity: 'success' });
        setOpenDeleteDialog(false);
        setToDelete(null);
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: getApiErrorMessage(error, 'Erro ao excluir fatura'),
          severity: 'error',
        });
      },
    });
  }, [toDelete, deleteMutation]);

  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  return (
    <>
      <title>Financeiro - VetFlow</title>
      <DashboardContent maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h4">Financeiro</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleNew}
          >
            Nova Fatura
          </Button>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <SummaryCard label="Recebido" value={formatBRL(summary.received)} color="success.main" />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <SummaryCard label="A receber" value={formatBRL(summary.pending)} color="warning.main" />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <SummaryCard label="Faturas" value={String(summary.count)} />
          </Grid>
        </Grid>

        <TextField
          placeholder="Buscar por cliente..."
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

        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
          {STATUS_FILTERS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              onClick={() => {
                setFilter(option.value);
                setPage(0);
              }}
              color={filter === option.value ? 'primary' : 'default'}
              variant={filter === option.value ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>

        <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          {isLoading ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'background.neutral' }}>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Emissão</TableCell>
                    <TableCell>Itens</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Status</TableCell>
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
          ) : visible.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'background.neutral' }}>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Emissão</TableCell>
                    <TableCell>Itens</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedInvoices.map((invoice) => (
                    <TableRow key={invoice.id} hover>
                      <TableCell>{getClientName(invoice.client_id)}</TableCell>
                      <TableCell>
                        {new Date(invoice.issue_date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {invoice.items.length}{' '}
                        {invoice.items.length === 1 ? 'item' : 'itens'}
                      </TableCell>
                      <TableCell align="right">{formatBRL(invoice.total)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={PAYMENT_STATUS_LABELS[invoice.status]}
                          color={PAYMENT_STATUS_COLORS[invoice.status]}
                          variant={invoice.status === 'canceled' ? 'outlined' : 'filled'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <RowActions
                          actions={[
                            {
                              key: 'edit',
                              label: 'Editar',
                              icon: 'solar:pen-bold',
                              onClick: () => handleEdit(invoice),
                            },
                            {
                              key: 'delete',
                              label: 'Excluir',
                              icon: 'solar:trash-bin-trash-bold',
                              destructive: true,
                              onClick: () => handleDeleteClick(invoice.id),
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
                count={visible.length}
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
              Nenhuma fatura encontrada
            </Box>
          )}
        </Card>

        <InvoiceFormDialog
          open={openForm}
          onClose={handleCloseForm}
          invoice={toEdit}
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
