/**
 * VetFlow Dashboard
 * Shows summary statistics and recent consultations/vaccinations
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useGetPets } from 'src/hooks/usePetsQuery';
import { useGetClients } from 'src/hooks/useClientsQuery';
import { useGetVaccines } from 'src/hooks/useVaccinesQuery';
import { useGetConsultations } from 'src/hooks/useConsultationsQuery';

import { DashboardContent } from 'src/layouts/dashboard';

// -----------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;
const UPCOMING_WINDOW_DAYS = 30;
const URGENT_THRESHOLD_DAYS = 7;

interface StatCardProps {
  title: string;
  value: number | string;
  color?: 'primary' | 'success' | 'warning' | 'error';
  loading?: boolean;
  onClick?: () => void;
}

function StatCard({ title, value, color = 'primary', loading, onClick }: StatCardProps) {
  const content = (
    <>
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
    </>
  );

  return (
    <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
      {onClick ? (
        <CardActionArea onClick={onClick} sx={{ p: 3 }}>
          {content}
        </CardActionArea>
      ) : (
        <Box sx={{ p: 3 }}>{content}</Box>
      )}
    </Card>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data: clients, isLoading: clientsLoading } = useGetClients();
  const { data: pets, isLoading: petsLoading } = useGetPets();
  const { data: consultations, isLoading: consultationsLoading } = useGetConsultations();
  const { data: vaccines, isLoading: vaccinesLoading } = useGetVaccines();

  // Map pet id -> name so we can show readable names instead of raw ObjectIDs.
  const petNameById = useMemo(() => {
    const map = new Map<string, string>();
    pets?.forEach((pet) => map.set(pet.id, pet.name));
    return map;
  }, [pets]);

  const getPetName = (petId: string) => petNameById.get(petId) ?? 'Pet removido';

  // Single "now" reference per render so the memoized lists stay stable.
  const now = useMemo(() => new Date(), []);

  // Consultations this month
  const consultationsThisMonth = useMemo(
    () =>
      consultations?.filter((c) => {
        const date = new Date(c.date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length ?? 0,
    [consultations, now]
  );

  // Most recent consultations, newest first
  const recentConsultations = useMemo(
    () =>
      [...(consultations ?? [])]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [consultations]
  );

  // Vaccines whose next dose falls within the upcoming window, soonest first
  const upcomingVaccines = useMemo(() => {
    const windowEnd = new Date(now.getTime() + UPCOMING_WINDOW_DAYS * DAY_MS);
    return (vaccines ?? [])
      .filter((v) => {
        if (!v.next_dose_date) return false;
        const next = new Date(v.next_dose_date);
        return next >= now && next <= windowEnd;
      })
      .sort(
        (a, b) => new Date(a.next_dose_date!).getTime() - new Date(b.next_dose_date!).getTime()
      );
  }, [vaccines, now]);

  const daysUntil = (dateStr: string) =>
    Math.ceil((new Date(dateStr).getTime() - now.getTime()) / DAY_MS);

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
              value={clients?.length ?? 0}
              color="primary"
              loading={clientsLoading}
              onClick={() => navigate('/clientes')}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total de Pets"
              value={pets?.length ?? 0}
              color="success"
              loading={petsLoading}
              onClick={() => navigate('/pets')}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Consultas este mês"
              value={consultationsThisMonth}
              color="warning"
              loading={consultationsLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Vacinas a vencer"
              value={upcomingVaccines.length}
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
              <Box sx={{ p: 3, pb: 2, backgroundColor: 'background.neutral', borderRadius: '4px 4px 0 0' }}>
                <Typography variant="h6">Consultas Recentes</Typography>
              </Box>
              {consultationsLoading ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <CircularProgress size={32} />
                </Box>
              ) : recentConsultations.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Data</TableCell>
                        <TableCell>Pet</TableCell>
                        <TableCell>Queixa Principal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentConsultations.map((c) => (
                        <TableRow key={c.id} hover>
                          <TableCell>{new Date(c.date).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>{getPetName(c.pet_id)}</TableCell>
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
              <Box sx={{ p: 3, pb: 2, backgroundColor: 'background.neutral', borderRadius: '4px 4px 0 0' }}>
                <Typography variant="h6">
                  Vacinas a Vencer
                  <Typography component="span" variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>
                    (próximos {UPCOMING_WINDOW_DAYS} dias)
                  </Typography>
                </Typography>
              </Box>
              {vaccinesLoading ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <CircularProgress size={32} />
                </Box>
              ) : upcomingVaccines.length > 0 ? (
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
                      {upcomingVaccines.slice(0, 5).map((v) => {
                        const remaining = daysUntil(v.next_dose_date!);
                        const isUrgent = remaining <= URGENT_THRESHOLD_DAYS;
                        return (
                          <TableRow key={v.id} hover>
                            <TableCell>{getPetName(v.pet_id)}</TableCell>
                            <TableCell>{v.vaccine_name}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {new Date(v.next_dose_date!).toLocaleDateString('pt-BR')}
                                <Chip
                                  size="small"
                                  label={
                                    remaining <= 0
                                      ? 'Hoje'
                                      : `${remaining} ${remaining === 1 ? 'dia' : 'dias'}`
                                  }
                                  color={isUrgent ? 'error' : 'default'}
                                  variant={isUrgent ? 'filled' : 'outlined'}
                                />
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                  Nenhuma vacinação pendente nos próximos {UPCOMING_WINDOW_DAYS} dias
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </DashboardContent>
    </>
  );
}
