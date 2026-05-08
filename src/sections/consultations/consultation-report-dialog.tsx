import {
  Box,
  Chip,
  Stack,
  Dialog,
  Button,
  Divider,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

interface Consultation {
  id: string;
  pet_id: string;
  date: string;
  anamnesis: {
    main_complaint: string;
    evolution_time: string;
    symptoms_worsened: boolean;
    symptom_frequency: string;
    behavior_change: boolean;
    pain: boolean;
    happened_before: boolean;
    prior_vet_visit: boolean;
  };
  diet: {
    food_type: string;
    amount_and_frequency: string;
    diet_changed_recently: boolean;
    normal_water_intake: boolean;
  };
  physiological: {
    normal_urine_feces: boolean;
    vomiting: boolean;
    respiratory_issues: boolean;
  };
  summary: {
    evolution_time: string;
    feces_urine: string;
    vaccines_and_deworming: string;
    medications: string;
    environment_and_contacts: string;
  };
}

interface ConsultationReportDialogProps {
  open: boolean;
  onClose: () => void;
  consultation: Consultation | null;
}

const YesNoChip = ({ value }: { value: boolean }) => (
  <Chip label={value ? 'Sim' : 'Não'} color={value ? 'success' : 'error'} size="small" />
);

export default function ConsultationReportDialog({
  open,
  onClose,
  consultation,
}: ConsultationReportDialogProps) {
  if (!consultation) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack>
          <Typography variant="h6">Relatório Completo da Consulta</Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(consultation.date).toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <Stack spacing={3}>
          {/* Anamnesis Section */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
              Anamnese
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Queixa Principal
                </Typography>
                <Typography variant="body2">{consultation.anamnesis.main_complaint}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Tempo de Evolução
                </Typography>
                <Typography variant="body2">{consultation.anamnesis.evolution_time}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Frequência de Sintomas
                </Typography>
                <Typography variant="body2">{consultation.anamnesis.symptom_frequency}</Typography>
              </Box>

              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 12px)' } }}>
                  <Typography variant="caption" color="text.secondary">
                    Sintomas Pioraram
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <YesNoChip value={consultation.anamnesis.symptoms_worsened} />
                  </Box>
                </Box>
                <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 12px)' } }}>
                  <Typography variant="caption" color="text.secondary">
                    Mudança de Comportamento
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <YesNoChip value={consultation.anamnesis.behavior_change} />
                  </Box>
                </Box>
                <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 12px)' } }}>
                  <Typography variant="caption" color="text.secondary">
                    Dor
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <YesNoChip value={consultation.anamnesis.pain} />
                  </Box>
                </Box>
                <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 12px)' } }}>
                  <Typography variant="caption" color="text.secondary">
                    Ocorreu Antes
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <YesNoChip value={consultation.anamnesis.happened_before} />
                  </Box>
                </Box>
              </Stack>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Visita Veterinária Anterior
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <YesNoChip value={consultation.anamnesis.prior_vet_visit} />
                </Box>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Diet Section */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
              Dieta
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Tipo de Alimento
                </Typography>
                <Typography variant="body2">{consultation.diet.food_type}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Quantidade e Frequência
                </Typography>
                <Typography variant="body2">{consultation.diet.amount_and_frequency}</Typography>
              </Box>

              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 12px)' } }}>
                  <Typography variant="caption" color="text.secondary">
                    Mudou Recentemente
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <YesNoChip value={consultation.diet.diet_changed_recently} />
                  </Box>
                </Box>
                <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 12px)' } }}>
                  <Typography variant="caption" color="text.secondary">
                    Ingestão Normal de Água
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <YesNoChip value={consultation.diet.normal_water_intake} />
                  </Box>
                </Box>
              </Stack>
            </Stack>
          </Box>

          <Divider />

          {/* Physiological Section */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
              Fisiológico
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
                  <Typography variant="caption" color="text.secondary">
                    Eliminações Normais
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <YesNoChip value={consultation.physiological.normal_urine_feces} />
                  </Box>
                </Box>
                <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
                  <Typography variant="caption" color="text.secondary">
                    Vômito
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <YesNoChip value={consultation.physiological.vomiting} />
                  </Box>
                </Box>
                <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
                  <Typography variant="caption" color="text.secondary">
                    Problemas Respiratórios
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <YesNoChip value={consultation.physiological.respiratory_issues} />
                  </Box>
                </Box>
              </Stack>
            </Stack>
          </Box>

          <Divider />

          {/* Summary Section */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
              Resumo
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Tempo de Evolução
                </Typography>
                <Typography variant="body2">{consultation.summary.evolution_time}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Fezes e Urina
                </Typography>
                <Typography variant="body2">{consultation.summary.feces_urine}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Vacinas e Vermífugos
                </Typography>
                <Typography variant="body2">
                  {consultation.summary.vaccines_and_deworming}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Medicações
                </Typography>
                <Typography variant="body2">{consultation.summary.medications}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Ambiente e Contatos
                </Typography>
                <Typography variant="body2">
                  {consultation.summary.environment_and_contacts}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
