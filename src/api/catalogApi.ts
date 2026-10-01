/**
 * Catalog API
 *
 * Provides typed functions for catalog item (services/products) CRUD operations.
 */
import axiosInstance from './axios';

import type { CatalogItem, CatalogItemType } from '../types';

/**
 * Fetch all catalog items for the authenticated veterinarian
 */
export const getCatalogItems = async (type?: CatalogItemType): Promise<CatalogItem[]> => {
  const response = await axiosInstance.get<CatalogItem[]>('/catalog', {
    params: type ? { type } : undefined,
  });
  return response.data;
};

/**
 * Fetch a single catalog item by ID
 */
export const getCatalogItemById = async (id: string): Promise<CatalogItem> => {
  const response = await axiosInstance.get<CatalogItem>(`/catalog/${id}`);
  return response.data;
};

type CreateCatalogItemInput = Omit<CatalogItem, 'id' | 'created_at' | 'updated_at'>;

/**
 * Create a new catalog item
 */
export const createCatalogItem = async (data: CreateCatalogItemInput): Promise<CatalogItem> => {
  const response = await axiosInstance.post<CatalogItem>('/catalog', data);
  return response.data;
};

/**
 * Update an existing catalog item
 */
export const updateCatalogItem = async (
  id: string,
  data: Partial<CatalogItem>
): Promise<CatalogItem> => {
  const response = await axiosInstance.put<CatalogItem>(`/catalog/${id}`, data);
  return response.data;
};

/**
 * Delete a catalog item
 */
export const deleteCatalogItem = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/catalog/${id}`);
};
