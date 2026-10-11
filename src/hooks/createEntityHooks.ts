/**
 * createEntityHooks — Fábrica genérica de hooks CRUD (React Query)
 *
 * Gera o molde padrão que os hooks de recurso repetem: `useGetAll`,
 * `useGetById`, `useCreate`, `useUpdate` e `useDelete`, já com as chaves de
 * cache e a invalidação pós-mutation.
 *
 * O objetivo é remover o boilerplate de `useQuery`/`useMutation`/
 * `useQueryClient` sem mudar NENHUMA assinatura pública: cada hook de recurso
 * continua exportando os mesmos nomes (`useGetPets`, `useCreatePet`, …), apenas
 * delegando a construção para esta fábrica.
 *
 * Compatibilidade de chaves de cache: historicamente alguns hooks montavam a
 * chave de detalhe como `[QUERY_KEY, id]` (array aninhado) e outros como
 * `[...QUERY_KEY, id]` (espalhado). São chaves de cache DIFERENTES, então a
 * fábrica não impõe uma convenção: `detailKey` é configurável por recurso e,
 * quando omitido, usa a forma espalhada `[...queryKey, id]`.
 */
import type { QueryKey, UseQueryResult, UseMutationResult } from '@tanstack/react-query';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Camada de API esperada por `createEntityHooks`. Espelha as funções que os
 * módulos de `src/api/*Api.ts` já expõem para um recurso CRUD.
 */
export interface EntityApi<TEntity, TCreateInput> {
  getAll: () => Promise<TEntity[]>;
  getById: (id: string) => Promise<TEntity>;
  create: (data: TCreateInput) => Promise<TEntity>;
  update: (id: string, data: Partial<TEntity>) => Promise<TEntity>;
  remove: (id: string) => Promise<void>;
}

export interface CreateEntityHooksOptions<TEntity, TCreateInput> {
  /** Chave de cache base do recurso, ex.: `['pets'] as const`. */
  queryKey: QueryKey;
  /** Funções de acesso ao recurso (normalmente de `src/api`). */
  api: EntityApi<TEntity, TCreateInput>;
  /**
   * Monta a chave de detalhe (`getById`). Permite preservar a forma histórica
   * de cada hook. Default: `[...queryKey, id]`.
   */
  detailKey?: (id: string) => QueryKey;
  /**
   * Chaves secundárias extras a invalidar após create/update, derivadas da
   * entidade afetada (ex.: listas "por pet"/"por tutor"/"por cliente").
   * Retorne `[]` quando não houver.
   */
  relatedKeys?: (entity: TEntity) => QueryKey[];
  /**
   * Quando `true`, `useUpdate` também invalida a chave de detalhe da entidade
   * atualizada. Default `true`. (Alguns hooks legados invalidavam apenas a
   * chave base no update — passe `false` para manter esse comportamento.)
   */
  invalidateDetailOnUpdate?: boolean;
}

/**
 * Formato dos hooks gerados pela fábrica.
 */
export interface EntityHooks<TEntity, TCreateInput> {
  useGetAll: () => UseQueryResult<TEntity[]>;
  useGetById: (id: string | undefined) => UseQueryResult<TEntity>;
  useCreate: () => UseMutationResult<TEntity, Error, TCreateInput>;
  useUpdate: () => UseMutationResult<TEntity, Error, { id: string; data: Partial<TEntity> }>;
  useDelete: () => UseMutationResult<void, Error, string>;
}

/**
 * Gera o conjunto padrão de hooks CRUD para um recurso.
 */
export function createEntityHooks<TEntity, TCreateInput>(
  options: CreateEntityHooksOptions<TEntity, TCreateInput>
): EntityHooks<TEntity, TCreateInput> {
  const {
    queryKey,
    api,
    detailKey = (id: string) => [...(queryKey as unknown[]), id] as QueryKey,
    relatedKeys,
    invalidateDetailOnUpdate = true,
  } = options;

  const useGetAll = () =>
    useQuery({
      queryKey,
      queryFn: api.getAll,
    });

  const useGetById = (id: string | undefined) =>
    useQuery({
      queryKey: detailKey(id ?? ''),
      queryFn: () => api.getById(id!),
      enabled: !!id,
    });

  const useCreate = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: TCreateInput) => api.create(data),
      onSuccess: (created) => {
        queryClient.invalidateQueries({ queryKey });
        relatedKeys?.(created).forEach((key) =>
          queryClient.invalidateQueries({ queryKey: key })
        );
      },
    });
  };

  const useUpdate = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<TEntity> }) => api.update(id, data),
      onSuccess: (updated, variables) => {
        queryClient.invalidateQueries({ queryKey });
        if (invalidateDetailOnUpdate) {
          queryClient.invalidateQueries({ queryKey: detailKey(variables.id) });
        }
        relatedKeys?.(updated).forEach((key) =>
          queryClient.invalidateQueries({ queryKey: key })
        );
      },
    });
  };

  const useDelete = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (id: string) => api.remove(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    });
  };

  return { useGetAll, useGetById, useCreate, useUpdate, useDelete };
}
