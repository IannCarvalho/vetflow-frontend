import type {
  Control,
  FieldValues,
  UseFormReset,
  DefaultValues,
  UseFormHandleSubmit,
} from 'react-hook-form';

import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import { getApiErrorMessage } from 'src/utils/api-error';

// ----------------------------------------------------------------------

/**
 * Subconjunto de uma mutation do React Query que o `useEntityForm` consome.
 * Compatível com o retorno de `useCreate()`/`useUpdate()` da fábrica
 * `createEntityHooks` (que expõem `mutate` e `isPending`).
 */
interface MutationLike<TVariables> {
  isPending: boolean;
  mutate: (
    variables: TVariables,
    options?: { onSuccess?: () => void; onError?: (error: unknown) => void }
  ) => void;
}

export interface UseEntityFormOptions<
  TFieldValues extends FieldValues,
  TPayload,
  TEntity,
> {
  /** Mutation de criação (`useCreateX()`), recebe o payload. */
  createMutation: MutationLike<TPayload>;
  /** Mutation de edição (`useUpdateX()`), recebe `{ id, data }`. */
  updateMutation: MutationLike<{ id: string; data: TPayload }>;
  /** Schema yup de validação do formulário. */
  schema: object;
  /** Valores padrão para o modo criação. */
  defaultValues: DefaultValues<TFieldValues>;
  /**
   * Entidade sendo editada (ou `null`/`undefined` no modo criação). Define o
   * título, o rótulo do botão e qual reset aplicar.
   */
  entity?: TEntity | null;
  /** Mapeia a entidade em edição para os valores do formulário (reset). */
  toFormValues: (entity: TEntity) => TFieldValues;
  /** Mapeia os valores validados do formulário para o payload da API. */
  toPayload: (values: TFieldValues) => TPayload;
  /**
   * Validação extra executada antes de montar o payload. Retorne uma string
   * para ABORTAR o submit exibindo-a como erro (ex.: "não foi possível
   * identificar o pet"); retorne `undefined`/`null` para prosseguir.
   */
  beforeSubmit?: (values: TFieldValues) => string | null | undefined;
  /** Mensagens de sucesso. */
  messages: {
    createSuccess: string;
    updateSuccess: string;
    createError: string;
    updateError: string;
  };
  /** Chamado após sucesso de create/update com a mensagem apropriada. */
  onSuccess?: (message: string) => void;
  /** Resetar o formulário após sucesso? Default `true`. */
  resetOnSuccess?: boolean;
  /** Dependências extras do efeito de reset (ex.: `open`, `initialData`). */
  resetDeps?: unknown[];
}

export interface UseEntityFormReturn<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  handleSubmit: UseFormHandleSubmit<TFieldValues>;
  reset: UseFormReset<TFieldValues>;
  isLoading: boolean;
  isEdit: boolean;
  submitError: string;
  clearError: () => void;
  /** Handler pronto para o botão/`onSubmit` do `FormDialogShell`. */
  onSubmit: () => void;
}

/**
 * Encapsula o fluxo repetido pelos form-dialogs: o par create/update, o estado
 * `submitError`, o `useEffect` de reset (create vs edit) e o `onSubmit` que
 * chama a mutation certa com `onSuccess`/`onError` + `getApiErrorMessage`.
 *
 * NÃO muda schema, payload nem defaults — apenas realoca o boilerplate. O
 * componente continua declarando seu schema yup, seus defaults e seus
 * mapeadores (`toFormValues`/`toPayload`), e renderiza os campos como preferir.
 */
export function useEntityForm<
  TFieldValues extends FieldValues,
  TPayload,
  TEntity extends { id: string },
>(
  options: UseEntityFormOptions<TFieldValues, TPayload, TEntity>
): UseEntityFormReturn<TFieldValues> & {
  getValues: ReturnType<typeof useForm<TFieldValues>>['getValues'];
  watch: ReturnType<typeof useForm<TFieldValues>>['watch'];
  setValue: ReturnType<typeof useForm<TFieldValues>>['setValue'];
  formState: ReturnType<typeof useForm<TFieldValues>>['formState'];
} {
  const {
    createMutation,
    updateMutation,
    schema,
    defaultValues,
    entity,
    toFormValues,
    toPayload,
    beforeSubmit,
    messages,
    onSuccess,
    resetOnSuccess = true,
    resetDeps = [],
  } = options;

  const [submitError, setSubmitError] = useState('');
  const clearError = () => setSubmitError('');

  const form = useForm<TFieldValues>({
    resolver: yupResolver(schema as any) as any,
    defaultValues,
  });

  const { control, handleSubmit, reset, getValues, watch, setValue, formState } = form;

  const isEdit = !!entity;

  // Reset create-vs-edit, espelhando o `useEffect` manual dos dialogs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const resetSignature = useMemo(() => resetDeps, resetDeps);

  useEffect(() => {
    setSubmitError('');
    if (entity) {
      reset(toFormValues(entity));
    } else {
      reset(defaultValues as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, reset, resetSignature]);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const onSubmit = handleSubmit((values) => {
    setSubmitError('');

    const guardError = beforeSubmit?.(values);
    if (guardError) {
      setSubmitError(guardError);
      return;
    }

    const payload = toPayload(values);

    if (entity) {
      updateMutation.mutate(
        { id: entity.id, data: payload },
        {
          onSuccess: () => {
            onSuccess?.(messages.updateSuccess);
            if (resetOnSuccess) reset(defaultValues as any);
          },
          onError: (error) => setSubmitError(getApiErrorMessage(error, messages.updateError)),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onSuccess?.(messages.createSuccess);
          if (resetOnSuccess) reset(defaultValues as any);
        },
        onError: (error) => setSubmitError(getApiErrorMessage(error, messages.createError)),
      });
    }
  });

  return {
    control,
    handleSubmit,
    reset,
    getValues,
    watch,
    setValue,
    formState,
    isLoading,
    isEdit,
    submitError,
    clearError,
    onSubmit,
  };
}
