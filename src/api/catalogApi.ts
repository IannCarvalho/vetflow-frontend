/**
 * Catalog API
 *
 * Provides typed functions for catalog item (services/products) CRUD
 * operations. getById/create/update/remove are delegated to createEntityApi;
 * getCatalogItems is hand-written because it takes an optional `type` filter.
 */
import axiosInstance from './axios';
import { createEntityApi } from './createEntityApi';

import type { CatalogItem, CatalogItemType } from '../types';

type CreateCatalogItemInput = Omit<CatalogItem, 'id' | 'created_at' | 'updated_at'>;

const base = createEntityApi<CatalogItem, CreateCatalogItemInput>('/catalog');

/** Fetch a single catalog item by ID */
export const getCatalogItemById = base.getById;
/** Create a new catalog item */
export const createCatalogItem = base.create;
/** Update an existing catalog item */
export const updateCatalogItem = base.update;
/** Delete a catalog item */
export const deleteCatalogItem = base.remove;

/**
 * Fetch all catalog items for the authenticated veterinarian, optionally
 * filtered by type (service / product).
 */
export const getCatalogItems = async (type?: CatalogItemType): Promise<CatalogItem[]> => {
  const response = await axiosInstance.get<CatalogItem[]>('/catalog', {
    params: type ? { type } : undefined,
  });
  return response.data;
};
