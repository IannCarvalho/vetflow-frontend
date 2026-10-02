/**
 * VetFlow Dashboard
 * Shows summary statistics and recent consultations/vaccinations
 */

import type { IconifyName } from 'src/components/iconify';

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import TableContainer from '@mui/material/TableContainer';

import { useGetPets } from 'src/hooks/usePetsQuery';
import { useGetVaccines } from 'src/hooks/useVaccinesQuery';
import { useGetDashboardStats } from 'src/hooks/useDashboardQuery';
import { useGetConsultations } from 'src/hooks/useConsultationsQuery';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

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
  icon?: IconifyName;
  /** Draws a subtle colored ring to flag an actionable metric. */
  emphasized?: boolean;
}

function StatCard({
  title,
  value,
  color = 'primary',
  loading,
  onClick,
  icon,
  emphasized,
}: StatCardProps) {
  const content = (
    <Stack direction="row" alignItems="center" spacing={2}>
      {icon && (
        <Box
          sx={{
            width: 48,
            height: 48,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1.5,
            bgcolor: (theme) => varAlpha(theme.vars.palette[color].mainChannel, 0.12),
          }}
        >
          <Iconify icon={icon} width={28} sx={{ color: `${color}.main` }} />
        </Box>
      )}
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          {title}
        </Typography>
        {loading ? (
          <Skeleton width="60%" height={32} />
        ) : (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="h4" sx={{ color: `${color}.main` }}>
              {value}
            </Typography>
            {emphasized && (
              <Iconify
                icon="solar:bell-bing-bold"
                width={20}
                sx={{ color: `${color}.main` }}
                aria-label="Atenção necessária"
              />
            )}
          </Stack>
        )}
      </Box>
    </Stack>
  );

  return (
    <Card
      sx={{
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        ...(emphasized && {
          borderColor: (theme) => varAlpha(theme.vars.palette[color].mainChannel, 0.48),
          boxShadow: (theme) => `0 0 0 1px ${varAlpha(theme.vars.palette[color].mainChannel, 0.24)}`,
        }),
      }}
    >
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

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: pets } = useGetPets();
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
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title="Total de Clientes"
              value={stats?.total_clients ?? 0}
              color="primary"
              icon="solar:users-group-rounded-bold"
              loading={statsLoading}
              onClick={() => navigate('/clientes')}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title="Total de Pets"
              value={stats?.total_pets ?? 0}
              color="success"
              icon="solar:paw-bold"
              loading={statsLoading}
              onClick={() => navigate('/pets')}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title="Consultas este mês"
              value={stats?.consultations_this_month ?? 0}
              color="warning"
              icon="solar:stethoscope-bold"
              loading={statsLoading}
              onClick={() => navigate('/consultas')}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title="Vacinas a vencer"
              value={stats?.upcoming_vaccinations ?? 0}
              color="error"
              icon="mdi:needle"
              loading={statsLoading}
              emphasized={(stats?.upcoming_vaccinations ?? 0) > 0}
              onClick={() => navigate('/vacinas')}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title="Faturas pendentes"
              value={stats?.pending_invoices ?? 0}
              color="warning"
              icon="solar:bill-list-bold"
              loading={statsLoading}
              onClick={() => navigate('/financeiro')}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title="Agendamentos hoje"
              value={stats?.appointments_today ?? 0}
              color="primary"
              icon="solar:calendar-mark-bold"
              loading={statsLoading}
              onClick={() => navigate('/agenda')}
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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
                        <TableRow
                          key={c.id}
                          hover
                          onClick={() => navigate(`/pets/${c.pet_id}/prontuario`)}
                          sx={{ cursor: 'pointer' }}
                        >
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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
                          <TableRow
                            key={v.id}
                            hover
                            onClick={() => navigate(`/pets/${v.pet_id}/vacinas`)}
                            sx={{ cursor: 'pointer' }}
                          >
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
