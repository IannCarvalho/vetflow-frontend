/**
 * VetFlow Financeiro Dashboard
 * Revenue analytics from invoices: monthly revenue chart, average ticket,
 * overdue invoices and top-billed items.
 */
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useGetClients } from 'src/hooks/useClientsQuery';
import { useGetInvoices } from 'src/hooks/useInvoicesQuery';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { formatBRL } from 'src/sections/invoices/invoice-constants';
import MonthlyRevenueChart from 'src/sections/invoices/monthly-revenue-chart';

import type { Invoice } from '../types';
import type { IconifyName } from '../components/iconify/register-icons';
import type { MonthlyRevenuePoint } from '../sections/invoices/monthly-revenue-chart';

// -----------------------------------------------------------------------

const MONTHS_BACK = 6;
const MONTH_LABELS = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function StatCard({ icon, label, value, color }: { icon: IconifyName; label: string; value: string; color?: string }) {
  return (
    <Card sx={{ p: 2.5, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover',
          }}
        >
          <Iconify icon={icon} width={24} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ color: color ?? 'text.primary' }} noWrap>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}

export default function FinanceiroDashboardPage() {
  const { data: invoices, isLoading } = useGetInvoices();
  const { data: clients } = useGetClients();
  const navigate = useNavigate();

  const clientNameById = useMemo(() => {
    const map = new Map<string, string>();
    clients?.forEach((c) => map.set(c.id, c.full_name));
    return map;
  }, [clients]);

  const paidInvoices = useMemo(
    () => (invoices ?? []).filter((i) => i.status === 'paid'),
    [invoices]
  );

  // Revenue per month for the last MONTHS_BACK months (paid invoices only).
  const monthlyRevenue = useMemo<MonthlyRevenuePoint[]>(() => {
    const now = new Date();
    const buckets: { key: string; label: string; value: number }[] = [];
    for (let i = MONTHS_BACK - 1; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: monthKey(d),
        label: `${MONTH_LABELS[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
        value: 0,
      });
    }
    const byKey = new Map(buckets.map((b) => [b.key, b]));

    paidInvoices.forEach((inv) => {
      const ref = inv.paid_at || inv.issue_date;
      const d = new Date(ref);
      const bucket = byKey.get(monthKey(d));
      if (bucket) bucket.value += inv.total;
    });

    return buckets.map((b) => ({ label: b.label, value: b.value }));
  }, [paidInvoices]);

  const totals = useMemo(() => {
    const received = paidInvoices.reduce((acc, i) => acc + i.total, 0);
    const averageTicket = paidInvoices.length > 0 ? received / paidInvoices.length : 0;
    const pending = (invoices ?? [])
      .filter((i) => i.status === 'pending' || i.status === 'partial' || i.status === 'overdue')
      .reduce((acc, i) => acc + i.total, 0);
    return { received, averageTicket, pending };
  }, [paidInvoices, invoices]);

  // Overdue invoices: explicitly overdue, or pending/partial past due date.
  const overdue = useMemo(() => {
    const now = Date.now();
    return (invoices ?? [])
      .filter((i) => {
        if (i.status === 'overdue') return true;
        if ((i.status === 'pending' || i.status === 'partial') && i.due_date) {
          return new Date(i.due_date).getTime() < now;
        }
        return false;
      })
      .sort((a, b) => {
        const ad = a.due_date ? new Date(a.due_date).getTime() : 0;
        const bd = b.due_date ? new Date(b.due_date).getTime() : 0;
        return ad - bd;
      });
  }, [invoices]);

  // Top-billed items by summed total across all non-canceled invoices.
  const topItems = useMemo(() => {
    const totalsByDesc = new Map<string, { total: number; count: number }>();
    (invoices ?? [])
      .filter((i: Invoice) => i.status !== 'canceled')
      .forEach((inv) => {
        inv.items.forEach((it) => {
          const key = it.description.trim() || '(sem descrição)';
          const prev = totalsByDesc.get(key) ?? { total: 0, count: 0 };
          prev.total += it.total;
          prev.count += it.quantity;
          totalsByDesc.set(key, prev);
        });
      });
    return Array.from(totalsByDesc.entries())
      .map(([description, v]) => ({ description, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [invoices]);

  return (
    <>
      <title>Dashboard Financeiro - VetFlow</title>
      <DashboardContent maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h4">Dashboard Financeiro</Typography>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
            onClick={() => navigate('/financeiro')}
          >
            Ver faturas
          </Button>
        </Stack>

        {isLoading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard
                  icon="eva:trending-up-fill"
                  label="Total recebido"
                  value={formatBRL(totals.received)}
                  color="success.main"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard
                  icon="solar:cart-3-bold"
                  label="Ticket médio"
                  value={formatBRL(totals.averageTicket)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard
                  icon="eva:trending-down-fill"
                  label="A receber"
                  value={formatBRL(totals.pending)}
                  color="warning.main"
                />
              </Grid>
            </Grid>

            <Card sx={{ p: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Receita por mês (últimos {MONTHS_BACK} meses)
              </Typography>
              <MonthlyRevenueChart data={monthlyRevenue} />
            </Card>

            <Grid container spacing={3}>
              {/* Overdue invoices */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ p: 3, pb: 1 }}>
                    <Typography variant="h6">Faturas vencidas</Typography>
                  </Box>
                  {overdue.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: 'background.neutral' }}>
                            <TableCell>Cliente</TableCell>
                            <TableCell>Vencimento</TableCell>
                            <TableCell align="right">Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {overdue.slice(0, 6).map((inv) => (
                            <TableRow key={inv.id} hover>
                              <TableCell>
                                {clientNameById.get(inv.client_id) ?? 'Cliente removido'}
                              </TableCell>
                              <TableCell>
                                {inv.due_date
                                  ? new Date(inv.due_date).toLocaleDateString('pt-BR')
                                  : '-'}
                              </TableCell>
                              <TableCell align="right">{formatBRL(inv.total)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                      Nenhuma fatura vencida. 🎉
                    </Box>
                  )}
                </Card>
              </Grid>

              {/* Top billed items */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ p: 3, pb: 1 }}>
                    <Typography variant="h6">Itens mais faturados</Typography>
                  </Box>
                  {topItems.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: 'background.neutral' }}>
                            <TableCell>Descrição</TableCell>
                            <TableCell align="right">Qtd</TableCell>
                            <TableCell align="right">Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {topItems.map((item) => (
                            <TableRow key={item.description} hover>
                              <TableCell>{item.description}</TableCell>
                              <TableCell align="right">{item.count}</TableCell>
                              <TableCell align="right">{formatBRL(item.total)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                      Nenhum item faturado ainda.
                    </Box>
                  )}
                </Card>
              </Grid>
            </Grid>
          </Stack>
        )}
      </DashboardContent>
    </>
  );
}
