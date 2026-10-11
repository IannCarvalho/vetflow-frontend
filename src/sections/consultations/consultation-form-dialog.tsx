/**
 * Consultation Form Dialog Component
 * Modal form for creating/editing consultation records with multi-step form
 */
import type { Consultation } from 'src/types';
import type { Control, FieldPath } from 'react-hook-form';

import * as yup from 'yup';
import { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Stepper from '@mui/material/Stepper';
import Checkbox from '@mui/material/Checkbox';
import StepLabel from '@mui/material/StepLabel';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { useEntityForm } from 'src/hooks/useEntityForm';
import { useCreateConsultation, useUpdateConsultation } from 'src/hooks/useConsultationsQuery';

import { RHFTextField } from 'src/components/form';

// -----------------------------------------------------------------------

const consultationSchema = yup.object({
  date: yup.string().required('Data é obrigatória'),
  return_date: yup.string(),
  // Summary
  summary_evolution_time: yup.string(),
  summary_feces_urine: yup.string(),
  summary_vaccines_and_deworming: yup.string(),
  summary_medications: yup.string(),
  summary_environment_and_contacts: yup.string(),
  // Anamnesis
  anamnesis_main_complaint: yup.string().required('Queixa principal é obrigatória'),
  anamnesis_evolution_time: yup.string(),
  anamnesis_symptoms_worsened: yup.boolean(),
  anamnesis_symptom_frequency: yup.string(),
  anamnesis_behavior_change: yup.boolean(),
  anamnesis_pain: yup.boolean(),
  anamnesis_happened_before: yup.boolean(),
  anamnesis_prior_vet_visit: yup.boolean(),
  // Diet
  diet_food_type: yup.string(),
  diet_amount_and_frequency: yup.string(),
  diet_changed_recently: yup.boolean(),
  diet_normal_water_intake: yup.boolean(),
  // Physiological
  physiological_normal_urine_feces: yup.boolean(),
  physiological_vomiting: yup.boolean(),
  physiological_respiratory_issues: yup.boolean(),
});

interface ConsultationFormValues {
  date: string;
  return_date: string;
  summary_evolution_time: string;
  summary_feces_urine: string;
  summary_vaccines_and_deworming: string;
  summary_medications: string;
  summary_environment_and_contacts: string;
  anamnesis_main_complaint: string;
  anamnesis_evolution_time: string;
  anamnesis_symptoms_worsened: boolean;
  anamnesis_symptom_frequency: string;
  anamnesis_behavior_change: boolean;
  anamnesis_pain: boolean;
  anamnesis_happened_before: boolean;
  anamnesis_prior_vet_visit: boolean;
  diet_food_type: string;
  diet_amount_and_frequency: string;
  diet_changed_recently: boolean;
  diet_normal_water_intake: boolean;
  physiological_normal_urine_feces: boolean;
  physiological_vomiting: boolean;
  physiological_respiratory_issues: boolean;
}

interface ConsultationFormDialogProps {
  open: boolean;
  onClose: () => void;
  consultation?: Consultation | null;
  onSuccess?: (message: string) => void;
  initialData?: { pet_id: string };
}

const steps = ['Resumo', 'Anamnese', 'Dieta', 'Fisiológico'];

const DEFAULTS: ConsultationFormValues = {
  date: new Date().toISOString().split('T')[0],
  return_date: '',
  summary_evolution_time: '',
  summary_feces_urine: '',
  summary_vaccines_and_deworming: '',
  summary_medications: '',
  summary_environment_and_contacts: '',
  anamnesis_main_complaint: '',
  anamnesis_evolution_time: '',
  anamnesis_symptoms_worsened: false,
  anamnesis_symptom_frequency: '',
  anamnesis_behavior_change: false,
  anamnesis_pain: false,
  anamnesis_happened_before: false,
  anamnesis_prior_vet_visit: false,
  diet_food_type: '',
  diet_amount_and_frequency: '',
  diet_changed_recently: false,
  diet_normal_water_intake: false,
  physiological_normal_urine_feces: false,
  physiological_vomiting: false,
  physiological_respiratory_issues: false,
};

export default function ConsultationFormDialog({
  open,
  onClose,
  consultation,
  onSuccess,
  initialData,
}: ConsultationFormDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const createMutation = useCreateConsultation();
  const updateMutation = useUpdateConsultation();

  const { control, isLoading, isEdit, submitError, clearError, onSubmit } = useEntityForm<
    ConsultationFormValues,
    ConsultationPayload,
    Consultation
  >({
    createMutation,
    updateMutation,
    schema: consultationSchema,
    defaultValues: DEFAULTS,
    entity: consultation,
    resetDeps: [initialData, open],
    toFormValues: (c) => ({
      date: c.date,
      return_date: c.return_date || '',
      summary_evolution_time: c.summary?.evolution_time || '',
      summary_feces_urine: c.summary?.feces_urine || '',
      summary_vaccines_and_deworming: c.summary?.vaccines_and_deworming || '',
      summary_medications: c.summary?.medications || '',
      summary_environment_and_contacts: c.summary?.environment_and_contacts || '',
      anamnesis_main_complaint: c.anamnesis?.main_complaint || '',
      anamnesis_evolution_time: c.anamnesis?.evolution_time || '',
      anamnesis_symptoms_worsened: c.anamnesis?.symptoms_worsened || false,
      anamnesis_symptom_frequency: c.anamnesis?.symptom_frequency || '',
      anamnesis_behavior_change: c.anamnesis?.behavior_change || false,
      anamnesis_pain: c.anamnesis?.pain || false,
      anamnesis_happened_before: c.anamnesis?.happened_before || false,
      anamnesis_prior_vet_visit: c.anamnesis?.prior_vet_visit || false,
      diet_food_type: c.diet?.food_type || '',
      diet_amount_and_frequency: c.diet?.amount_and_frequency || '',
      diet_changed_recently: c.diet?.diet_changed_recently || false,
      diet_normal_water_intake: c.diet?.normal_water_intake || false,
      physiological_normal_urine_feces: c.physiological?.normal_urine_feces || false,
      physiological_vomiting: c.physiological?.vomiting || false,
      physiological_respiratory_issues: c.physiological?.respiratory_issues || false,
    }),
    beforeSubmit: () => {
      const petId = consultation?.pet_id || initialData?.pet_id;
      return petId ? undefined : 'Não foi possível identificar o pet desta consulta.';
    },
    toPayload: (data) => buildPayload(data, consultation, initialData),
    messages: {
      createSuccess: 'Consulta criada com sucesso!',
      updateSuccess: 'Consulta atualizada com sucesso!',
      createError: 'Erro ao criar consulta',
      updateError: 'Erro ao atualizar consulta',
    },
    onSuccess: (message) => {
      onSuccess?.(message);
      setActiveStep(0);
    },
  });

  // O chassi reseta os valores do formulário; aqui mantemos apenas o reset do
  // passo ativo do wizard, espelhando o `setActiveStep(0)` do efeito original.
  useEffect(() => {
    setActiveStep(0);
  }, [consultation, open]);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Resumo
        return (
          <Stack spacing={2}>
            <RHFTextField
              name="date"
              control={control}
              label="Data da Consulta"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <RHFTextField
              name="return_date"
              control={control}
              label="Data de Retorno (Recomendado)"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <RHFTextField
              name="summary_evolution_time"
              control={control}
              label="Tempo de Evolução"
              fullWidth
              placeholder="Ex: 3 dias"
            />

            <RHFTextField
              name="summary_feces_urine"
              control={control}
              label="Fezes/Urina"
              fullWidth
              multiline
              rows={2}
            />

            <RHFTextField
              name="summary_vaccines_and_deworming"
              control={control}
              label="Vacinas e Vermífugo"
              fullWidth
              multiline
              rows={2}
            />

            <RHFTextField
              name="summary_medications"
              control={control}
              label="Medicações"
              fullWidth
              multiline
              rows={2}
            />

            <RHFTextField
              name="summary_environment_and_contacts"
              control={control}
              label="Ambiente e Contatos"
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        );

      case 1: // Anamnese
        return (
          <Stack spacing={2}>
            <RHFTextField
              name="anamnesis_main_complaint"
              control={control}
              label="Queixa Principal"
              fullWidth
              multiline
              rows={3}
            />

            <RHFTextField
              name="anamnesis_evolution_time"
              control={control}
              label="Tempo de Evolução"
              fullWidth
              placeholder="Ex: 5 dias"
            />

            <RHFTextField
              name="anamnesis_symptom_frequency"
              control={control}
              label="Frequência dos Sintomas"
              fullWidth
              placeholder="Ex: Intermitente, contínuo"
            />

            <CheckboxField
              name="anamnesis_symptoms_worsened"
              control={control}
              label="Sintomas Pioraram"
            />
            <CheckboxField
              name="anamnesis_behavior_change"
              control={control}
              label="Mudança de Comportamento"
            />
            <CheckboxField name="anamnesis_pain" control={control} label="Dor" />
            <CheckboxField
              name="anamnesis_happened_before"
              control={control}
              label="Já Aconteceu Antes"
            />
            <CheckboxField
              name="anamnesis_prior_vet_visit"
              control={control}
              label="Visitou Veterinário Antes por Isso"
            />
          </Stack>
        );

      case 2: // Dieta
        return (
          <Stack spacing={2}>
            <RHFTextField
              name="diet_food_type"
              control={control}
              label="Tipo de Alimento"
              fullWidth
              placeholder="Ex: Ração, comida caseira"
            />

            <RHFTextField
              name="diet_amount_and_frequency"
              control={control}
              label="Quantidade e Frequência"
              fullWidth
              multiline
              rows={2}
              placeholder="Ex: 2 xícaras, 2x por dia"
            />

            <CheckboxField
              name="diet_changed_recently"
              control={control}
              label="Dieta Mudou Recentemente"
            />
            <CheckboxField
              name="diet_normal_water_intake"
              control={control}
              label="Ingestão de Água Normal"
            />
          </Stack>
        );

      case 3: // Fisiológico
        return (
          <Stack spacing={2}>
            <CheckboxField
              name="physiological_normal_urine_feces"
              control={control}
              label="Urina e Fezes Normais"
            />
            <CheckboxField name="physiological_vomiting" control={control} label="Vômito" />
            <CheckboxField
              name="physiological_respiratory_issues"
              control={control}
              label="Problemas Respiratórios"
            />
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Editar Consulta' : 'Nova Consulta'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent()}

          {submitError && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={clearError}>
              {submitError}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={isLoading}>
            Voltar
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button onClick={handleNext} variant="contained" disabled={isLoading}>
            Próximo
          </Button>
        ) : (
          <Button onClick={onSubmit} variant="contained" disabled={isLoading}>
            {isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
            {isEdit ? 'Atualizar' : 'Criar'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// -----------------------------------------------------------------------

/** Checkbox controlado — o chassi RHF cobre apenas text/select. */
function CheckboxField({
  name,
  control,
  label,
}: {
  name: FieldPath<ConsultationFormValues>;
  control: Control<ConsultationFormValues>;
  label: string;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={
            <Checkbox
              {...field}
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          }
          label={label}
        />
      )}
    />
  );
}

/**
 * Payload de criação/edição da consulta. Igual ao `CreateConsultationInput` do
 * hook (`Omit<Consultation, 'id' | 'created_at'>`). O `return_date` em runtime
 * é `null` quando vazio — como no dialog original (que usava `as any`); por isso
 * o retorno de `buildPayload` é afirmado para este tipo.
 */
type ConsultationPayload = Omit<Consultation, 'id' | 'created_at'>;

function buildPayload(
  data: ConsultationFormValues,
  consultation: Consultation | null | undefined,
  initialData?: { pet_id: string }
): ConsultationPayload {
  const petId = (consultation?.pet_id || initialData?.pet_id) as string;

  return {
    pet_id: petId,
    date: new Date(data.date).toISOString(),
    // runtime permanece `null` quando vazio (idêntico ao original); o cast cobre
    // o tipo `string | undefined` de `Consultation.return_date`.
    return_date: data.return_date
      ? new Date(data.return_date).toISOString()
      : (null as unknown as undefined),
    anamnesis: {
      main_complaint: data.anamnesis_main_complaint,
      evolution_time: data.anamnesis_evolution_time,
      symptoms_worsened: data.anamnesis_symptoms_worsened,
      symptom_frequency: data.anamnesis_symptom_frequency,
      behavior_change: data.anamnesis_behavior_change,
      pain: data.anamnesis_pain,
      happened_before: data.anamnesis_happened_before,
      prior_vet_visit: data.anamnesis_prior_vet_visit,
    },
    diet: {
      food_type: data.diet_food_type,
      amount_and_frequency: data.diet_amount_and_frequency,
      diet_changed_recently: data.diet_changed_recently,
      normal_water_intake: data.diet_normal_water_intake,
    },
    physiological: {
      normal_urine_feces: data.physiological_normal_urine_feces,
      vomiting: data.physiological_vomiting,
      respiratory_issues: data.physiological_respiratory_issues,
    },
    summary: {
      main_complaint: data.anamnesis_main_complaint,
      evolution_time: data.summary_evolution_time,
      feeding: '',
      feces_urine: data.summary_feces_urine,
      vaccines_and_deworming: data.summary_vaccines_and_deworming,
      medications: data.summary_medications,
      environment_and_contacts: data.summary_environment_and_contacts,
    },
  };
}
