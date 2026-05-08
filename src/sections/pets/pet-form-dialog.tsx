import type { Pet } from 'src/types';

import * as yup from 'yup';
/**
 * Pet Form Dialog Component
 * Modal form for creating/editing pets
 */
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useCreatePet, useUpdatePet } from 'src/hooks/usePetsQuery';

// -----------------------------------------------------------------------

const petSchema = yup.object({
  name: yup.string().required('Nome do pet é obrigatório'),
  species: yup.string().required('Espécie é obrigatória'),
  breed: yup.string(),
  age: yup.number().required('Idade é obrigatória').positive('Idade deve ser positiva'),
  age_unit: yup.string().oneOf(['months', 'years']),
  sex: yup.string().oneOf(['male', 'female']).required('Sexo é obrigatório'),
  neutered: yup.boolean(),
  weight: yup.number().required('Peso é obrigatório').positive('Peso deve ser positivo'),
});

interface PetFormDialogProps {
  open: boolean;
  onClose: () => void;
  pet?: Pet | null;
  onSuccess?: (message: string) => void;
  initialData?: { owner_id: string };
}

export default function PetFormDialog({
  open,
  onClose,
  pet,
  onSuccess,
  initialData,
}: PetFormDialogProps) {
  const createPetMutation = useCreatePet();
  const updatePetMutation = useUpdatePet();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(petSchema),
    defaultValues: {
      name: '',
      species: '',
      breed: '',
      age: 1,
      age_unit: 'years',
      sex: 'male',
      neutered: false,
      weight: 0,
    },
  });

  useEffect(() => {
    if (pet) {
      reset(pet);
    } else {
      reset({
        name: '',
        species: '',
        breed: '',
        age: 1,
        age_unit: 'years',
        sex: 'male',
        neutered: false,
        weight: 0,
      });
    }
  }, [pet, initialData, reset]);

  const isLoading = createPetMutation.isPending || updatePetMutation.isPending;

  const onSubmit = handleSubmit((data: any) => {
    if (pet) {
      updatePetMutation.mutate(
        { id: pet.id, data },
        {
          onSuccess: () => {
            onSuccess?.('Pet atualizado com sucesso!');
            reset();
          },
        }
      );
    } else {
      createPetMutation.mutate(data, {
        onSuccess: () => {
          onSuccess?.('Pet criado com sucesso!');
          reset();
        },
      });
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{pet ? 'Editar Pet' : 'Novo Pet'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nome"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

            <Controller
              name="species"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.species}>
                  <InputLabel>Espécie</InputLabel>
                  <Select {...field} label="Espécie">
                    <MenuItem value="Cachorro">Cachorro</MenuItem>
                    <MenuItem value="Gato">Gato</MenuItem>
                    <MenuItem value="Outros">Outros</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="breed"
              control={control}
              render={({ field }) => <TextField {...field} label="Raça" fullWidth />}
            />

            <Stack direction="row" spacing={2}>
              <Controller
                name="age"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Idade"
                    type="number"
                    fullWidth
                    error={!!errors.age}
                    helperText={errors.age?.message}
                  />
                )}
              />

              <Controller
                name="age_unit"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Unidade</InputLabel>
                    <Select {...field} label="Unidade">
                      <MenuItem value="months">Meses</MenuItem>
                      <MenuItem value="years">Anos</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Stack>

            <Controller
              name="sex"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.sex}>
                  <InputLabel>Sexo</InputLabel>
                  <Select {...field} label="Sexo">
                    <MenuItem value="male">Macho</MenuItem>
                    <MenuItem value="female">Fêmea</MenuItem>
                  </Select>
                </FormControl>
              )}
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

            <Controller
              name="weight"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Peso (kg)"
                  type="number"
                  fullWidth
                  error={!!errors.weight}
                  helperText={errors.weight?.message}
                />
              )}
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onSubmit} variant="contained" disabled={isLoading}>
          {isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
          {pet ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
