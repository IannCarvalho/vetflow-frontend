/**
 * Consultation Form Dialog Component
 * Modal form for creating/editing consultation records with multi-step form
 */
import type { Consultation } from 'src/types';

import * as yup from 'yup';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Stepper from '@mui/material/Stepper';
import Checkbox from '@mui/material/Checkbox';
import StepLabel from '@mui/material/StepLabel';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { useCreateConsultation, useUpdateConsultation } from 'src/hooks/useConsultationsQuery';

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

interface ConsultationFormDialogProps {
  open: boolean;
  onClose: () => void;
  consultation?: Consultation | null;
  onSuccess?: (message: string) => void;
  initialData?: { pet_id: string };
}

const steps = ['Resumo', 'Anamnese', 'Dieta', 'Fisiológico'];

export default function ConsultationFormDialog({
  open,
  onClose,
  consultation,
  onSuccess,
  initialData,
}: ConsultationFormDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const createConsultationMutation = useCreateConsultation();
  const updateConsultationMutation = useUpdateConsultation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(consultationSchema),
    defaultValues: {
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
    },
  });

  useEffect(() => {
    if (consultation) {
      reset({
        date: consultation.date,
        return_date: consultation.return_date || '',
        summary_evolution_time: consultation.summary?.evolution_time || '',
        summary_feces_urine: consultation.summary?.feces_urine || '',
        summary_vaccines_and_deworming: consultation.summary?.vaccines_and_deworming || '',
        summary_medications: consultation.summary?.medications || '',
        summary_environment_and_contacts: consultation.summary?.environment_and_contacts || '',
        anamnesis_main_complaint: consultation.anamnesis?.main_complaint || '',
        anamnesis_evolution_time: consultation.anamnesis?.evolution_time || '',
        anamnesis_symptoms_worsened: consultation.anamnesis?.symptoms_worsened || false,
        anamnesis_symptom_frequency: consultation.anamnesis?.symptom_frequency || '',
        anamnesis_behavior_change: consultation.anamnesis?.behavior_change || false,
        anamnesis_pain: consultation.anamnesis?.pain || false,
        anamnesis_happened_before: consultation.anamnesis?.happened_before || false,
        anamnesis_prior_vet_visit: consultation.anamnesis?.prior_vet_visit || false,
        diet_food_type: consultation.diet?.food_type || '',
        diet_amount_and_frequency: consultation.diet?.amount_and_frequency || '',
        diet_changed_recently: consultation.diet?.diet_changed_recently || false,
        diet_normal_water_intake: consultation.diet?.normal_water_intake || false,
        physiological_normal_urine_feces: consultation.physiological?.normal_urine_feces || false,
        physiological_vomiting: consultation.physiological?.vomiting || false,
        physiological_respiratory_issues: consultation.physiological?.respiratory_issues || false,
      });
    } else {
      reset({
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
      });
    }
    setActiveStep(0);
  }, [consultation, initialData, reset, open]);

  const isLoading = createConsultationMutation.isPending || updateConsultationMutation.isPending;

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

  const onSubmit = handleSubmit((data: any) => {
    const petId = consultation?.pet_id || initialData?.pet_id;

    if (!petId) {
      console.error('Pet ID is required');
      return;
    }

    const consultationData = {
      pet_id: petId,
      date: new Date(data.date).toISOString(),
      return_date: data.return_date ? new Date(data.return_date).toISOString() : null,
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

    if (consultation) {
      updateConsultationMutation.mutate(
        { id: consultation.id, data: consultationData as any },
        {
          onSuccess: () => {
            onSuccess?.('Consulta atualizada com sucesso!');
            reset();
            setActiveStep(0);
          },
        }
      );
    } else {
      createConsultationMutation.mutate(consultationData as any, {
        onSuccess: () => {
          onSuccess?.('Consulta criada com sucesso!');
          reset();
          setActiveStep(0);
        },
      });
    }
  });

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Resumo
        return (
          <Stack spacing={2}>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Data da Consulta"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.date}
                  helperText={errors.date?.message}
                />
              )}
            />

            <Controller
              name="return_date"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Data de Retorno (Recomendado)"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.return_date}
                  helperText={errors.return_date?.message}
                />
              )}
            />

            <Controller
              name="summary_evolution_time"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tempo de Evolução"
                  fullWidth
                  placeholder="Ex: 3 dias"
                />
              )}
            />

            <Controller
              name="summary_feces_urine"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Fezes/Urina" fullWidth multiline rows={2} />
              )}
            />

            <Controller
              name="summary_vaccines_and_deworming"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Vacinas e Vermífugo" fullWidth multiline rows={2} />
              )}
            />

            <Controller
              name="summary_medications"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Medicações" fullWidth multiline rows={2} />
              )}
            />

            <Controller
              name="summary_environment_and_contacts"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Ambiente e Contatos" fullWidth multiline rows={2} />
              )}
            />
          </Stack>
        );

      case 1: // Anamnese
        return (
          <Stack spacing={2}>
            <Controller
              name="anamnesis_main_complaint"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Queixa Principal"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.anamnesis_main_complaint}
                  helperText={errors.anamnesis_main_complaint?.message}
                />
              )}
            />

            <Controller
              name="anamnesis_evolution_time"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tempo de Evolução"
                  fullWidth
                  placeholder="Ex: 5 dias"
                />
              )}
            />

            <Controller
              name="anamnesis_symptom_frequency"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Frequência dos Sintomas"
                  fullWidth
                  placeholder="Ex: Intermitente, contínuo"
                />
              )}
            />

            <Controller
              name="anamnesis_symptoms_worsened"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Sintomas Pioraram"
                />
              )}
            />

            <Controller
              name="anamnesis_behavior_change"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Mudança de Comportamento"
                />
              )}
            />

            <Controller
              name="anamnesis_pain"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Dor"
                />
              )}
            />

            <Controller
              name="anamnesis_happened_before"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Já Aconteceu Antes"
                />
              )}
            />

            <Controller
              name="anamnesis_prior_vet_visit"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Visitou Veterinário Antes por Isso"
                />
              )}
            />
          </Stack>
        );

      case 2: // Dieta
        return (
          <Stack spacing={2}>
            <Controller
              name="diet_food_type"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tipo de Alimento"
                  fullWidth
                  placeholder="Ex: Ração, comida caseira"
                />
              )}
            />

            <Controller
              name="diet_amount_and_frequency"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Quantidade e Frequência"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Ex: 2 xícaras, 2x por dia"
                />
              )}
            />

            <Controller
              name="diet_changed_recently"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Dieta Mudou Recentemente"
                />
              )}
            />

            <Controller
              name="diet_normal_water_intake"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Ingestão de Água Normal"
                />
              )}
            />
          </Stack>
        );

      case 3: // Fisiológico
        return (
          <Stack spacing={2}>
            <Controller
              name="physiological_normal_urine_feces"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Urina e Fezes Normais"
                />
              )}
            />

            <Controller
              name="physiological_vomiting"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Vômito"
                />
              )}
            />

            <Controller
              name="physiological_respiratory_issues"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Problemas Respiratórios"
                />
              )}
            />
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{consultation ? 'Editar Consulta' : 'Nova Consulta'}</DialogTitle>
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
            {consultation ? 'Atualizar' : 'Criar'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
