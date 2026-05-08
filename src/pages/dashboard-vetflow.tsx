/**
 * VetFlow Dashboard
 * Shows summary statistics and recent consultations/vaccinations
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useGetPets } from 'src/hooks/usePetsQuery';
import { useGetClients } from 'src/hooks/useClientsQuery';
import { useGetVaccines } from 'src/hooks/useVaccinesQuery';
import { useGetConsultations } from 'src/hooks/useConsultationsQuery';

import { DashboardContent } from 'src/layouts/dashboard';

// -----------------------------------------------------------------------

interface StatCard {
  title: string;
  value: number | string;
  color?: 'primary' | 'success' | 'warning' | 'error';
  loading?: boolean;
}

function StatCard({ title, value, color = 'primary', loading }: StatCard) {
  return (
    <Card sx={{ p: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
        {title}
      </Typography>
      {loading ? (
        <Skeleton width="60%" height={32} />
      ) : (
        <Typography variant="h4" sx={{ color: `${color}.main` }}>
          {value}
        </Typography>
      )}
    </Card>
  );
}

export default function DashboardPage() {
  const { data: clients, isLoading: clientsLoading } = useGetClients();
  const { data: pets, isLoading: petsLoading } = useGetPets();
  const { data: consultations, isLoading: consultationsLoading } = useGetConsultations();
  const { data: vaccines, isLoading: vaccinesLoading } = useGetVaccines();

  // Calculate consultations this month
  const now = new Date();
  const currentMonth =
    consultations?.filter((c) => {
      const consultDate = new Date(c.date);
      return (
        consultDate.getMonth() === now.getMonth() && consultDate.getFullYear() === now.getFullYear()
      );
    }).length || 0;

  // Calculate upcoming vaccinations (within 30 days)
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const upcomingVaccinations =
    vaccines?.filter((v) => {
      if (!v.next_dose_date) return false;
      const nextDoseDate = new Date(v.next_dose_date);
      return nextDoseDate >= now && nextDoseDate <= thirtyDaysFromNow;
    }).length || 0;

  return (
    <>
      <title>Dashboard - VetFlow</title>
      <DashboardContent maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Bem-vindo ao VetFlow
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total de Clientes"
              value={clients?.length || 0}
              color="primary"
              loading={clientsLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total de Pets"
              value={pets?.length || 0}
              color="success"
              loading={petsLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Consultas este mês"
              value={currentMonth}
              color="warning"
              loading={consultationsLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Vacinas a vencer"
              value={upcomingVaccinations}
              color="error"
              loading={vaccinesLoading}
            />
          </Grid>
        </Grid>

        {/* Recent Consultations and Upcoming Vaccinations */}
        <Grid container spacing={3}>
          {/* Recent Consultations */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 3, pb: 0, backgroundColor: '#E0F2FE', borderRadius: '4px 4px 0 0' }}>
                <Typography variant="h6">Consultas Recentes</Typography>
              </Box>
              {consultationsLoading ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <CircularProgress size={32} />
                </Box>
              ) : consultations && consultations.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Data</TableCell>
                        <TableCell>Queixa Principal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {consultations.slice(0, 5).map((c) => (
                        <TableRow key={c.id} hover>
                          <TableCell>{new Date(c.date).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell
                            sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {c.anamnesis.main_complaint}
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
          </Grid>

          {/* Upcoming Vaccinations */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 3, pb: 0, backgroundColor: '#E0F2FE', borderRadius: '4px 4px 0 0' }}>
                <Typography variant="h6">Vacinas a Vencer</Typography>
              </Box>
              {vaccinesLoading ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <CircularProgress size={32} />
                </Box>
              ) : vaccines && vaccines.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Pet</TableCell>
                        <TableCell>Vacina</TableCell>
                        <TableCell>Próxima Dose</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vaccines
                        .filter((v) => v.next_dose_date)
                        .slice(0, 5)
                        .map((v) => (
                          <TableRow key={v.id} hover>
                            <TableCell>{v.pet_id}</TableCell>
                            <TableCell>{v.vaccine_name}</TableCell>
                            <TableCell>
                              {v.next_dose_date
                                ? new Date(v.next_dose_date).toLocaleDateString('pt-BR')
                                : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                  Nenhuma vacinação pendente
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </DashboardContent>
    </>
  );
}
