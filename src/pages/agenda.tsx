/**
 * VetFlow Agenda Page
 * The veterinarian's scheduling agenda: upcoming appointments grouped by day,
 * with type/status chips, search, status filtering and create/edit/delete.
 */
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useGetPets } from 'src/hooks/usePetsQuery';
import {
  useGetAppointments,
  useUpdateAppointment,
  useDeleteAppointment,
} from 'src/hooks/useAppointmentsQuery';

import { getApiErrorMessage } from 'src/utils/api-error';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import RowActions from 'src/components/row-actions';
import { ConfirmDeleteDialog } from 'src/components/list';

import AppointmentFormDialog from 'src/sections/appointments/appointment-form-dialog';
import ConsultationFormDialog from 'src/sections/consultations/consultation-form-dialog';
import {
  APPOINTMENT_TYPE_LABELS,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
} from 'src/sections/appointments/appointment-constants';

import type { Appointment, AppointmentStatus } from '../types';

// -----------------------------------------------------------------------

const STATUS_FILTERS: Array<{ value: 'all' | 'upcoming' | AppointmentStatus; label: string }> = [
  { value: 'upcoming', label: 'Próximos' },
  { value: 'all', label: 'Todos' },
  { value: 'scheduled', label: 'Agendados' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'completed', label: 'Concluídos' },
  { value: 'cancelled', label: 'Cancelados' },
];

function formatDayHeading(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const label = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  if (date.getTime() === today.getTime()) return `Hoje · ${label}`;
  if (date.getTime() === tomorrow.getTime()) return `Amanhã · ${label}`;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function AgendaPage() {
  const { data: appointments, isLoading } = useGetAppointments();
  const { data: pets } = useGetPets();
  const deleteMutation = useDeleteAppointment();
  const updateMutation = useUpdateAppointment();

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | AppointmentStatus>('upcoming');
  const [openForm, setOpenForm] = useState(false);
  const [toEdit, setToEdit] = useState<Appointment | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [consultationFor, setConsultationFor] = useState<Appointment | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const petNameById = useMemo(() => {
    const map = new Map<string, string>();
    pets?.forEach((pet) => map.set(pet.id, pet.name));
    return map;
  }, [pets]);

  const getPetName = useCallback(
    (petId: string) => petNameById.get(petId) ?? 'Pet removido',
    [petNameById]
  );

  const appointmentPendingDeletion = useMemo(
    () => (appointments ?? []).find((a) => a.id === toDelete) ?? null,
    [appointments, toDelete]
  );

  const visible = useMemo(() => {
    let result = appointments ?? [];
    const now = Date.now();

    if (filter === 'upcoming') {
      result = result.filter(
        (a) =>
          new Date(a.start_time).getTime() >= now &&
          a.status !== 'cancelled' &&
          a.status !== 'completed'
      );
    } else if (filter !== 'all') {
      result = result.filter((a) => a.status === filter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          (a.title ?? '').toLowerCase().includes(term) ||
          getPetName(a.pet_id).toLowerCase().includes(term) ||
          APPOINTMENT_TYPE_LABELS[a.type].toLowerCase().includes(term)
      );
    }

    return [...result].sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  }, [appointments, filter, searchTerm, getPetName]);

  const grouped = useMemo(() => {
    const groups = new Map<string, Appointment[]>();
    visible.forEach((a) => {
      const key = new Date(a.start_time).toISOString().slice(0, 10);
      const list = groups.get(key) ?? [];
      list.push(a);
      groups.set(key, list);
    });
    return Array.from(groups.entries());
  }, [visible]);

  const handleNew = useCallback(() => {
    setToEdit(null);
    setOpenForm(true);
  }, []);

  const handleEdit = useCallback((appointment: Appointment) => {
    setToEdit(appointment);
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
        setSnackbar({ open: true, message: 'Agendamento excluído com sucesso!', severity: 'success' });
        setOpenDeleteDialog(false);
        setToDelete(null);
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: getApiErrorMessage(error, 'Erro ao excluir agendamento'),
          severity: 'error',
        });
      },
    });
  }, [toDelete, deleteMutation]);

  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  const handleRegisterConsultation = useCallback((appointment: Appointment) => {
    setConsultationFor(appointment);
  }, []);

  const handleCloseConsultation = useCallback(() => {
    setConsultationFor(null);
  }, []);

  const handleConsultationSuccess = useCallback(
    (message: string) => {
      const appointment = consultationFor;
      setSnackbar({ open: true, message, severity: 'success' });
      setConsultationFor(null);

      // Após registrar o atendimento, conclui o agendamento (se ainda não estiver
      // concluído). Fire-and-forget: a falha não bloqueia o sucesso da consulta,
      // apenas invalida silenciosamente — o atendimento clínico já foi criado.
      if (appointment && appointment.status !== 'completed') {
        updateMutation.mutate({ id: appointment.id, data: { status: 'completed' } });
      }
    },
    [consultationFor, updateMutation]
  );

  return (
    <>
      <title>Agenda - VetFlow</title>
      <DashboardContent maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h4">Agenda</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleNew}
          >
            Novo Agendamento
          </Button>
        </Stack>

        <TextField
          placeholder="Buscar por pet, título ou tipo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
              onClick={() => setFilter(option.value)}
              color={filter === option.value ? 'primary' : 'default'}
              variant={filter === option.value ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>

        {isLoading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress aria-label="Carregando" />
          </Box>
        ) : grouped.length > 0 ? (
          <Stack spacing={3}>
            {grouped.map(([dateKey, items]) => (
              <Box key={dateKey}>
                <Typography variant="subtitle1" sx={{ mb: 1.5, color: 'text.secondary' }}>
                  {formatDayHeading(dateKey)}
                </Typography>
                <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                  {items.map((a, index) => (
                    <Box key={a.id}>
                      {index > 0 && <Divider />}
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        sx={{ p: 2 }}
                      >
                        <Box sx={{ minWidth: 96 }}>
                          <Typography variant="subtitle2">{formatTime(a.start_time)}</Typography>
                          {a.end_time && (
                            <Typography variant="caption" color="text.secondary">
                              até {formatTime(a.end_time)}
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" noWrap>
                            {a.title?.trim() || APPOINTMENT_TYPE_LABELS[a.type]}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {getPetName(a.pet_id)} · {APPOINTMENT_TYPE_LABELS[a.type]}
                          </Typography>
                        </Box>

                        <Chip
                          size="small"
                          label={APPOINTMENT_STATUS_LABELS[a.status]}
                          color={APPOINTMENT_STATUS_COLORS[a.status]}
                          variant={a.status === 'cancelled' ? 'outlined' : 'filled'}
                        />

                        <RowActions
                          actions={[
                            ...(a.status !== 'cancelled'
                              ? [
                                  {
                                    key: 'consultation',
                                    label: 'Registrar atendimento',
                                    icon: 'solar:stethoscope-bold' as const,
                                    onClick: () => handleRegisterConsultation(a),
                                  },
                                ]
                              : []),
                            {
                              key: 'edit',
                              label: 'Editar',
                              icon: 'solar:pen-bold',
                              onClick: () => handleEdit(a),
                            },
                            {
                              key: 'delete',
                              label: 'Excluir',
                              icon: 'solar:trash-bin-trash-bold',
                              destructive: true,
                              onClick: () => handleDeleteClick(a.id),
                            },
                          ]}
                        />
                      </Stack>
                    </Box>
                  ))}
                </Card>
              </Box>
            ))}
          </Stack>
        ) : (
          <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              {filter === 'upcoming'
                ? 'Nenhum agendamento próximo. Clique em "Novo Agendamento" para começar.'
                : 'Nenhum agendamento encontrado para este filtro.'}
            </Box>
          </Card>
        )}

        <AppointmentFormDialog
          open={openForm}
          onClose={handleCloseForm}
          appointment={toEdit}
          onSuccess={handleFormSuccess}
        />

        <ConsultationFormDialog
          open={Boolean(consultationFor)}
          onClose={handleCloseConsultation}
          onSuccess={handleConsultationSuccess}
          initialData={consultationFor ? { pet_id: consultationFor.pet_id } : undefined}
        />

        <ConfirmDeleteDialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          isPending={deleteMutation.isPending}
          title="Excluir agendamento?"
          description={
            appointmentPendingDeletion && (
              <>
                Você está prestes a excluir o agendamento de{' '}
                <strong>{getPetName(appointmentPendingDeletion.pet_id)}</strong>.
              </>
            )
          }
          warning="Essa ação não pode ser desfeita."
        />

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </DashboardContent>
    </>
  );
}
