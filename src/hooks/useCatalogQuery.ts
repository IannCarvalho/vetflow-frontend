/**
 * Catalog React Query Hooks
 *
 * Provides React Query hooks for catalog item (services/products) data.
 */
import { useQuery } from '@tanstack/react-query';

import * as catalogApi from '../api/catalogApi';
import { createEntityHooks } from './createEntityHooks';

import type { CatalogItem, CatalogItemType } from '../types';

const CATALOG_QUERY_KEY = ['catalog'] as const;

type CreateCatalogItemInput = Omit<CatalogItem, 'id' | 'created_at' | 'updated_at'>;

// As consultas do catálogo fogem do molde padrão (getAll aceita um filtro por
// tipo e usa chave própria), então apenas as mutations são geradas pela
// fábrica — com invalidação só da chave base, como no comportamento histórico.
const catalogHooks = createEntityHooks<CatalogItem, CreateCatalogItemInput>({
  queryKey: CATALOG_QUERY_KEY,
  detailKey: (id) => [...CATALOG_QUERY_KEY, id],
  invalidateDetailOnUpdate: false,
  api: {
    getAll: () => catalogApi.getCatalogItems(),
    getById: catalogApi.getCatalogItemById,
    create: catalogApi.createCatalogItem,
    update: catalogApi.updateCatalogItem,
    remove: catalogApi.deleteCatalogItem,
  },
});

/**
 * Hook to fetch all catalog items, optionally filtered by type
 */
export const useGetCatalogItems = (type?: CatalogItemType) =>
  useQuery({
    queryKey: [...CATALOG_QUERY_KEY, type ?? 'all'],
    queryFn: () => catalogApi.getCatalogItems(type),
  });

/**
 * Hook to fetch a single catalog item by ID
 */
export const useGetCatalogItemById = (id: string | undefined) =>
  useQuery({
    queryKey: [...CATALOG_QUERY_KEY, id],
    queryFn: () => catalogApi.getCatalogItemById(id!),
    enabled: !!id,
  });

/**
 * Hook to create a new catalog item
 */
export const useCreateCatalogItem = catalogHooks.useCreate;

/**
 * Hook to update an existing catalog item
 */
export const useUpdateCatalogItem = catalogHooks.useUpdate;

/**
 * Hook to delete a catalog item
 */
export const useDeleteCatalogItem = catalogHooks.useDelete;
