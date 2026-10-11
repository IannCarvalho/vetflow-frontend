import { useParams } from 'react-router-dom';
/**
 * Pet Medical Record (Prontuário) Page
 * A unified chronological view of a pet's clinical history: consultations and
 * vaccines merged into a single timeline, plus pet/owner summary.
 */
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useGetPets } from 'src/hooks/usePetsQuery';
import { useGetClients } from 'src/hooks/useClientsQuery';
import { useGetVaccinesByPetId } from 'src/hooks/useVaccinesQuery';
import { useGetConsultationsByPetId } from 'src/hooks/useConsultationsQuery';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import PetHeader from 'src/sections/pets/pet-header';
import PetTimeline from 'src/sections/timeline/pet-timeline';
import ConsultationReportDialog from 'src/sections/consultations/consultation-report-dialog';

import type { Consultation } from '../types';
import type { IconifyName } from '../components/iconify/register-icons';

// -----------------------------------------------------------------------

function StatCard({ icon, label, value }: { icon: IconifyName; label: string; value: number }) {
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
        <Box>
          <Typography variant="h5">{value}</Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ textAlign: 'right' }}>
        {value ?? '-'}
      </Typography>
    </Stack>
  );
}

export default function PetProntuarioPage() {
  const { petId } = useParams();

  const { data: allPets, isLoading: loadingPets } = useGetPets();
  const { data: allClients } = useGetClients();
  const { data: consultations, isLoading: loadingConsultations } =
    useGetConsultationsByPetId(petId);
  const { data: vaccines, isLoading: loadingVaccines } = useGetVaccinesByPetId(petId);

  const [openReport, setOpenReport] = useState(false);
  const [selected, setSelected] = useState<Consultation | null>(null);

  const currentPet = allPets?.find((p) => p.id === petId);
  const owner = allClients?.find((c) => c.id === currentPet?.owner_id);

  const handleViewConsultation = useCallback((consultation: Consultation) => {
    setSelected(consultation);
    setOpenReport(true);
  }, []);

  const isLoading = loadingPets || loadingConsultations || loadingVaccines;

  const ageLabel = currentPet
    ? `${currentPet.age} ${currentPet.age_unit === 'months' ? 'mês(es)' : 'ano(s)'}`
    : '-';

  return (
    <>
      <title>Prontuário - VetFlow</title>
      <DashboardContent maxWidth="lg">
        <PetHeader />

        {isLoading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress aria-label="Carregando" />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Left column: pet + owner info and stats */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={3}>
                <StatCard
                  icon="solar:medical-visit-bold"
                  label="Consultas"
                  value={consultations?.length ?? 0}
                />
                <StatCard
                  icon="solar:vaccine-bold"
                  label="Vacinas"
                  value={vaccines?.length ?? 0}
                />

                <Card sx={{ p: 2.5, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Dados do paciente
                  </Typography>
                  <Stack spacing={1.5}>
                    <InfoRow label="Espécie" value={currentPet?.species} />
                    <InfoRow label="Raça" value={currentPet?.breed || '-'} />
                    <InfoRow label="Idade" value={ageLabel} />
                    <InfoRow
                      label="Sexo"
                      value={currentPet ? (currentPet.sex === 'male' ? 'Macho' : 'Fêmea') : '-'}
                    />
                    <InfoRow
                      label="Castrado"
                      value={currentPet ? (currentPet.neutered ? 'Sim' : 'Não') : '-'}
                    />
                    <InfoRow
                      label="Peso"
                      value={currentPet?.weight ? `${currentPet.weight} kg` : '-'}
                    />
                    <Divider />
                    <InfoRow label="Tutor" value={owner?.full_name} />
                    <InfoRow label="Telefone" value={owner?.phone} />
                  </Stack>
                </Card>
              </Stack>
            </Grid>

            {/* Right column: unified timeline */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ p: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Histórico
                </Typography>
                <PetTimeline
                  consultations={consultations}
                  vaccines={vaccines}
                  onViewConsultation={handleViewConsultation}
                />
              </Card>
            </Grid>
          </Grid>
        )}

        <ConsultationReportDialog
          open={openReport}
          onClose={() => setOpenReport(false)}
          consultation={selected}
        />
      </DashboardContent>
    </>
  );
}
