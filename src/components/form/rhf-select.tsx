import type { FieldValues } from 'react-hook-form';

import MenuItem from '@mui/material/MenuItem';

import { RHFTextField } from './rhf-text-field';

import type { RHFTextFieldProps } from './rhf-text-field';

// ----------------------------------------------------------------------

export interface RHFSelectOption {
  value: string;
  label: React.ReactNode;
}

export type RHFSelectProps<TFieldValues extends FieldValues> = RHFTextFieldProps<TFieldValues> & {
  /**
   * Opções do select. Quando informado, cada entrada vira um `<MenuItem>`;
   * `emptyLabel` cobre o caso de lista vazia (ex.: "Nenhum pet cadastrado").
   * Alternativamente, passe `children` para controlar os itens manualmente.
   */
  options?: RHFSelectOption[];
  emptyLabel?: React.ReactNode;
};

/**
 * Wrapper RHF em volta de um `<TextField select>`. Encapsula o mesmo
 * `<Controller>` do `RHFTextField` e, por conveniência, monta os `<MenuItem>`
 * a partir de `options`. É o par do `RHFTextField` para os muitos selects
 * (`type`/`status`/`método`/`pet`/`cliente`) repetidos nos dialogs.
 */
export function RHFSelect<TFieldValues extends FieldValues>({
  options,
  emptyLabel,
  children,
  ...other
}: RHFSelectProps<TFieldValues>) {
  const renderedChildren =
    children ??
    (options && options.length === 0 && emptyLabel ? (
      <MenuItem value="" disabled>
        {emptyLabel}
      </MenuItem>
    ) : (
      options?.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))
    ));

  return (
    <RHFTextField select {...other}>
      {renderedChildren}
    </RHFTextField>
  );
}
