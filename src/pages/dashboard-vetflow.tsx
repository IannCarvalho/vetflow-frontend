/**
 * VetFlow Dashboard
 * Painel de triagem da recepção: abre pelo que exige ação agora
 * (agenda do dia, vacinas vencendo), não por totais de vaidade.
 * Fase 2 do plano de design: hero, hierarquia por urgência clínica,
 * sistema de cards por nível, big numbers tabulares e A11y.
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

type SemanticColor = 'primary' | 'info' | 'success' | 'warning' | 'error';

// -----------------------------------------------------------------------
// KPI acionável (nível 1): big number tabular + ícone + rótulo.
// Sinal redundante (A11y): cor sempre acompanhada de ícone + rótulo textual.
// -----------------------------------------------------------------------

interface ActionStatProps {
  title: string;
  value: number | string;
  color: SemanticColor;
  icon: IconifyName;
  loading?: boolean;
  onClick?: () => void;
  /** Texto curto de contexto da urgência (ex.: "nos próximos 7 dias"). */
  hint?: string;
}

function ActionStat({ title, value, color, icon, loading, onClick, hint }: ActionStatProps) {
  const content = (
    <Stack spacing={1.5} sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1.5,
            color: `${color}.main`,
            bgcolor: (theme) => varAlpha(theme.vars.palette[color].mainChannel, 0.12),
          }}
        >
          <Iconify icon={icon} width={26} />
        </Box>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.4 }}
        >
          {title}
        </Typography>
      </Stack>

      {loading ? (
        <Skeleton width="50%" height={40} />
      ) : (
        <Typography sx={(theme) => ({ ...theme.typography.bigNumber, color: `${color}.main` })}>
          {value}
        </Typography>
      )}

      {hint && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {hint}
        </Typography>
      )}
    </Stack>
  );

  return (
    <Card variant="elevated" sx={{ height: '100%' }}>
      {onClick ? (
        <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
}

// -----------------------------------------------------------------------
// Total de contexto (nível 2): subordinado, card flat, denso.
// -----------------------------------------------------------------------

interface ContextStatProps {
  title: string;
  value: number | string;
  icon: IconifyName;
  loading?: boolean;
  onClick?: () => void;
}

function ContextStat({ title, value, icon, loading, onClick }: ContextStatProps) {
  const content = (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 2.5 }}>
      <Iconify icon={icon} width={24} sx={{ color: 'text.secondary', flexShrink: 0 }} />
      <Box sx={{ minWidth: 0 }}>
        {loading ? (
          <Skeleton width={48} height={28} />
        ) : (
          <Typography variant="h5" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {value}
          </Typography>
        )}
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {title}
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <Card variant="flat" sx={{ height: '100%' }}>
      {onClick ? (
        <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
}

// -----------------------------------------------------------------------

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

  // Resumo acionável do dia para o hero.
  const appointmentsToday = stats?.appointments_today ?? 0;
  const upcomingVaccinations = stats?.upcoming_vaccinations ?? 0;
  const heroSummary = statsLoading
    ? 'Carregando o resumo do dia…'
    : `${appointmentsToday} ${appointmentsToday === 1 ? 'consulta agendada' : 'consultas agendadas'} hoje · ${upcomingVaccinations} ${upcomingVaccinations === 1 ? 'vacina a vencer' : 'vacinas a vencer'}`;

  return (
    <>
      <title>Dashboard - VetFlow</title>
      <DashboardContent maxWidth="xl">
        {/* Hero — âncora de marca + triagem do dia */}
        <Card variant="anchor" sx={{ mb: 4 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2.5}
            sx={{ p: { xs: 3, md: 4 } }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                color: 'primary.main',
                bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
              }}
            >
              <Iconify icon="solar:stethoscope-bold" width={32} />
            </Box>
            <Box>
              <Typography sx={(theme) => ({ ...theme.typography.heroDisplay, color: 'text.primary' })}>
                Bem-vindo ao VetFlow
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {heroSummary}
              </Typography>
            </Box>
          </Stack>
        </Card>

        {/* Faixa de ação — KPIs acionáveis (nível 1) */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <ActionStat
              title="Vacinas a vencer"
              value={upcomingVaccinations}
              color="warning"
              icon="mdi:needle"
              loading={statsLoading}
              hint={`Nos próximos ${UPCOMING_WINDOW_DAYS} dias`}
              onClick={() => navigate('/vacinas')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <ActionStat
              title="Agendamentos hoje"
              value={appointmentsToday}
              color="info"
              icon="solar:calendar-mark-bold"
              loading={statsLoading}
              hint="Consultas do dia"
              onClick={() => navigate('/agenda')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <ActionStat
              title="Faturas pendentes"
              value={stats?.pending_invoices ?? 0}
              color="error"
              icon="solar:bill-list-bold"
              loading={statsLoading}
              hint="Aguardando pagamento"
              onClick={() => navigate('/financeiro')}
            />
          </Grid>
        </Grid>

        {/* Totais de contexto (nível 2) + Consultas do mês, subordinados */}
        <Grid container spacing={2} sx={{ mb: 5 }}>
          <Grid size={{ xs: 6, sm: 4 }}>
            <ContextStat
              title="Clientes"
              value={stats?.total_clients ?? 0}
              icon="solar:users-group-rounded-bold"
              loading={statsLoading}
              onClick={() => navigate('/clientes')}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <ContextStat
              title="Pets"
              value={stats?.total_pets ?? 0}
              icon="solar:paw-bold"
              loading={statsLoading}
              onClick={() => navigate('/pets')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <ContextStat
              title="Consultas este mês"
              value={stats?.consultations_this_month ?? 0}
              icon="solar:stethoscope-bold"
              loading={statsLoading}
              onClick={() => navigate('/consultas')}
            />
          </Grid>
        </Grid>

        {/* Operacional do dia: Consultas recentes + Vacinas a vencer */}
        <Grid container spacing={3}>
          {/* Recent Consultations */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="flat">
              <Box
                sx={{
                  p: 3,
                  pb: 2,
                  backgroundColor: 'background.neutral',
                  borderRadius: '12px 12px 0 0',
                }}
              >
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
                          tabIndex={0}
                          role="link"
                          aria-label={`Abrir prontuário de ${getPetName(c.pet_id)}`}
                          onClick={() => navigate(`/pets/${c.pet_id}/prontuario`)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              navigate(`/pets/${c.pet_id}/prontuario`);
                            }
                          }}
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
                <Stack spacing={1} sx={{ p: 4, textAlign: 'center', alignItems: 'center' }}>
                  <Iconify
                    icon="solar:stethoscope-bold"
                    width={32}
                    sx={{ color: 'text.disabled' }}
                  />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Nenhuma consulta registrada ainda
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    As consultas aparecem aqui assim que forem lançadas no prontuário.
                  </Typography>
                </Stack>
              )}
            </Card>
          </Grid>

          {/* Upcoming Vaccinations */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="flat">
              <Box
                sx={{
                  p: 3,
                  pb: 2,
                  backgroundColor: 'background.neutral',
                  borderRadius: '12px 12px 0 0',
                }}
              >
                <Typography variant="h6">
                  Vacinas a Vencer
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ color: 'text.secondary', ml: 1 }}
                  >
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
                        const remainingLabel =
                          remaining <= 0
                            ? 'Hoje'
                            : `${remaining} ${remaining === 1 ? 'dia' : 'dias'}`;
                        return (
                          <TableRow
                            key={v.id}
                            hover
                            tabIndex={0}
                            role="link"
                            aria-label={`Vacina ${v.vaccine_name} de ${getPetName(v.pet_id)}, ${
                              isUrgent ? 'urgente, ' : ''
                            }vence em ${remainingLabel}`}
                            onClick={() => navigate(`/pets/${v.pet_id}/vacinas`)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                navigate(`/pets/${v.pet_id}/vacinas`);
                              }
                            }}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell>{getPetName(v.pet_id)}</TableCell>
                            <TableCell>{v.vaccine_name}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {new Date(v.next_dose_date!).toLocaleDateString('pt-BR')}
                                {/* Sinal redundante: cor + ícone + rótulo (A11y) */}
                                <Chip
                                  size="small"
                                  icon={
                                    isUrgent ? (
                                      <Iconify icon="solar:bell-bing-bold" width={14} />
                                    ) : undefined
                                  }
                                  label={remainingLabel}
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
                <Stack spacing={1} sx={{ p: 4, textAlign: 'center', alignItems: 'center' }}>
                  <Iconify icon="mdi:needle" width={32} sx={{ color: 'text.disabled' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Nenhuma vacinação pendente nos próximos {UPCOMING_WINDOW_DAYS} dias
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    Tudo em dia por aqui. Novas doses agendadas aparecem nesta lista.
                  </Typography>
                </Stack>
              )}
            </Card>
          </Grid>
        </Grid>
      </DashboardContent>
    </>
  );
}
