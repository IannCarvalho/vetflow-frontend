/**
 * Catalog React Query Hooks
 *
 * Provides React Query hooks for catalog item (services/products) data.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as catalogApi from '../api/catalogApi';

import type { CatalogItem, CatalogItemType } from '../types';

const CATALOG_QUERY_KEY = ['catalog'] as const;

type CreateCatalogItemInput = Omit<CatalogItem, 'id' | 'created_at' | 'updated_at'>;

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
export const useCreateCatalogItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCatalogItemInput) => catalogApi.createCatalogItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY });
    },
  });
};

/**
 * Hook to update an existing catalog item
 */
export const useUpdateCatalogItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CatalogItem> }) =>
      catalogApi.updateCatalogItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY });
    },
  });
};

/**
 * Hook to delete a catalog item
 */
export const useDeleteCatalogItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => catalogApi.deleteCatalogItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY });
    },
  });
};
