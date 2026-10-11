import type { TextFieldProps } from '@mui/material/TextField';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { get, Controller } from 'react-hook-form';

import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

export type RHFTextFieldProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label?: React.ReactNode;
} & Omit<TextFieldProps, 'name' | 'error' | 'helperText'> & {
    /** Mensagem de ajuda fixa, usada quando não há erro de validação. */
    helperText?: React.ReactNode;
  };

/**
 * Wrapper RHF em volta de `<TextField>` que absorve o `<Controller>` repetido
 * dezenas de vezes nos form-dialogs. Deriva `error`/`helperText` do estado de
 * validação do campo (`formState.errors[name]`) e repassa qualquer outra prop
 * do MUI TextField (`select`, `type`, `multiline`, `fullWidth`, `children`…).
 *
 * Comportamento idêntico ao padrão manual:
 *   <Controller name=.. control=.. render={({ field }) => (
 *     <TextField {...field} error={!!errors.x} helperText={errors.x?.message} />
 *   )} />
 */
export function RHFTextField<TFieldValues extends FieldValues>({
  name,
  control,
  helperText,
  ...other
}: RHFTextFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, formState: { errors } }) => {
        const error = get(errors, name);

        return (
          <TextField
            {...field}
            error={!!error}
            helperText={error ? (error.message as React.ReactNode) : helperText}
            {...other}
          />
        );
      }}
    />
  );
}
