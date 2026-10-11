/**
 * Pets React Query Hooks
 *
 * Provides React Query hooks for pet data fetching and mutations.
 */
import { useQuery } from '@tanstack/react-query';

import * as petsApi from '../api/petsApi';
import { createEntityHooks } from './createEntityHooks';

import type { Pet } from '../types';

const PETS_QUERY_KEY = ['pets'] as const;

type CreatePetInput = Omit<Pet, 'id' | 'created_at' | 'updated_at'>;

const petHooks = createEntityHooks<Pet, CreatePetInput>({
  queryKey: PETS_QUERY_KEY,
  // Forma histórica da chave de detalhe: [QUERY_KEY, id] (array aninhado).
  detailKey: (id) => [PETS_QUERY_KEY, id],
  // Invalida também a lista "por tutor" na criação/atualização.
  relatedKeys: (pet) => [[PETS_QUERY_KEY, 'owner', pet.owner_id]],
  api: {
    getAll: petsApi.getPets,
    getById: petsApi.getPetById,
    create: petsApi.createPet,
    update: petsApi.updatePet,
    remove: petsApi.deletePet,
  },
});

/**
 * Hook to fetch all pets
 */
export const useGetPets = petHooks.useGetAll;

/**
 * Hook to fetch a single pet by ID
 */
export const useGetPetById = petHooks.useGetById;

/**
 * Hook to fetch all pets owned by a specific client
 */
export const useGetPetsByOwnerId = (ownerId: string | undefined) =>
  useQuery({
    queryKey: [PETS_QUERY_KEY, 'owner', ownerId],
    queryFn: () => petsApi.getPetsByOwnerId(ownerId!),
    enabled: !!ownerId,
  });

/**
 * Hook to create a new pet
 */
export const useCreatePet = petHooks.useCreate;

/**
 * Hook to update an existing pet
 */
export const useUpdatePet = petHooks.useUpdate;

/**
 * Hook to delete a pet
 */
export const useDeletePet = petHooks.useDelete;
