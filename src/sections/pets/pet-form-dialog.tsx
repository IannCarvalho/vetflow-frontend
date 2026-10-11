import type { Pet } from 'src/types';

import * as yup from 'yup';
/**
 * Pet Form Dialog Component
 * Modal form for creating/editing pets
 */
import { Controller } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useEntityForm } from 'src/hooks/useEntityForm';
import { useCreatePet, useUpdatePet } from 'src/hooks/usePetsQuery';

import { RHFSelect, RHFTextField, FormDialogShell } from 'src/components/form';

// -----------------------------------------------------------------------

const petSchema = yup.object({
  name: yup.string().trim().required('Nome do pet é obrigatório'),
  species: yup.string().required('Espécie é obrigatória'),
  breed: yup.string(),
  age: yup
    .number()
    .typeError('Idade deve ser um número')
    .required('Idade é obrigatória')
    .integer('Idade deve ser um número inteiro')
    .min(0, 'Idade não pode ser negativa')
    .max(600, 'Idade inválida'),
  age_unit: yup.string().oneOf(['months', 'years']),
  sex: yup.string().oneOf(['male', 'female']).required('Sexo é obrigatório'),
  neutered: yup.boolean(),
  weight: yup
    .number()
    .typeError('Peso deve ser um número')
    .required('Peso é obrigatório')
    .positive('Peso deve ser positivo')
    .max(200, 'Peso inválido'),
});

interface PetFormValues {
  name: string;
  species: string;
  breed: string;
  age: number;
  age_unit: 'months' | 'years';
  sex: 'male' | 'female';
  neutered: boolean;
  weight: number;
}

interface PetFormDialogProps {
  open: boolean;
  onClose: () => void;
  pet?: Pet | null;
  onSuccess?: (message: string) => void;
  initialData?: { owner_id: string };
}

const DEFAULTS: PetFormValues = {
  name: '',
  species: '',
  breed: '',
  age: 1,
  age_unit: 'years',
  sex: 'male',
  neutered: false,
  weight: 0,
};

export default function PetFormDialog({
  open,
  onClose,
  pet,
  onSuccess,
  initialData,
}: PetFormDialogProps) {
  const createMutation = useCreatePet();
  const updateMutation = useUpdatePet();

  const { control, isLoading, isEdit, submitError, clearError, onSubmit } = useEntityForm<
    PetFormValues,
    ReturnType<typeof buildPayload>,
    Pet
  >({
    createMutation,
    updateMutation,
    schema: petSchema,
    defaultValues: DEFAULTS,
    entity: pet,
    resetDeps: [initialData],
    toFormValues: (p) => ({
      name: p.name,
      species: p.species,
      breed: p.breed ?? '',
      age: p.age,
      age_unit: p.age_unit,
      sex: p.sex,
      neutered: p.neutered ?? false,
      weight: p.weight,
    }),
    toPayload: (data) => buildPayload(data, pet),
    messages: {
      createSuccess: 'Pet criado com sucesso!',
      updateSuccess: 'Pet atualizado com sucesso!',
      createError: 'Erro ao criar pet',
      updateError: 'Erro ao atualizar pet',
    },
    onSuccess,
  });

  return (
    <FormDialogShell
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Pet' : 'Novo Pet'}
      isLoading={isLoading}
      submitError={submitError}
      onClearError={clearError}
      onSubmit={onSubmit}
      isEdit={isEdit}
    >
      <RHFTextField name="name" control={control} label="Nome" fullWidth />

      <RHFSelect
        name="species"
        control={control}
        label="Espécie"
        fullWidth
        options={[
          { value: 'Cachorro', label: 'Cachorro' },
          { value: 'Gato', label: 'Gato' },
          { value: 'Outros', label: 'Outros' },
        ]}
      />

      <RHFTextField name="breed" control={control} label="Raça" fullWidth />

      <Stack direction="row" spacing={2}>
        <RHFTextField name="age" control={control} label="Idade" type="number" fullWidth />
        <RHFSelect
          name="age_unit"
          control={control}
          label="Unidade"
          fullWidth
          options={[
            { value: 'months', label: 'Meses' },
            { value: 'years', label: 'Anos' },
          ]}
        />
      </Stack>

      <RHFSelect
        name="sex"
        control={control}
        label="Sexo"
        fullWidth
        options={[
          { value: 'male', label: 'Macho' },
          { value: 'female', label: 'Fêmea' },
        ]}
      />

      <Controller
        name="neutered"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Checkbox {...field} checked={field.value || false} />}
            label="Castrado/Esterilizado"
          />
        )}
      />

      <RHFTextField name="weight" control={control} label="Peso (kg)" type="number" fullWidth />
    </FormDialogShell>
  );
}

// -----------------------------------------------------------------------

/**
 * Reconstrói o payload idêntico ao do dialog original:
 * - CRIAÇÃO: enviava apenas os campos do formulário (sem `owner_id`).
 * - EDIÇÃO: `reset(pet)` carregava a entidade inteira e o submit reenviava
 *   `owner_id`. Reaproveitamos o `owner_id` da entidade em edição.
 */
function buildPayload(data: PetFormValues, pet: Pet | null | undefined) {
  const base = {
    name: data.name,
    species: data.species,
    breed: data.breed,
    age: data.age,
    age_unit: data.age_unit,
    sex: data.sex,
    neutered: data.neutered,
    weight: data.weight,
  };

  return pet ? { ...base, owner_id: pet.owner_id } : (base as any);
}
