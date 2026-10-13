/**
 * Pets API
 *
 * Provides typed functions for pet CRUD operations and filtering.
 * The CRUD core is delegated to createEntityApi; only the by-owner filter is
 * hand-written here.
 */
import axiosInstance from './axios';
import { createEntityApi } from './createEntityApi';

import type { Pet } from '../types';

type CreatePetInput = Omit<Pet, 'id' | 'created_at' | 'updated_at'>;

const base = createEntityApi<Pet, CreatePetInput>('/pets');

/** Fetch all pets */
export const getPets = base.getAll;
/** Fetch a single pet by ID */
export const getPetById = base.getById;
/** Create a new pet */
export const createPet = base.create;
/** Update an existing pet */
export const updatePet = base.update;
/** Delete a pet */
export const deletePet = base.remove;

/**
 * Fetch all pets owned by a specific client
 */
export const getPetsByOwnerId = async (ownerId: string): Promise<Pet[]> => {
  const response = await axiosInstance.get<Pet[]>('/pets', {
    params: { owner_id: ownerId },
  });
  return response.data;
};
