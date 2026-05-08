/**
 * Pets React Query Hooks
 *
 * Provides React Query hooks for pet data fetching and mutations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as petsApi from '../api/petsApi';

import type { Pet } from '../types';

const PETS_QUERY_KEY = ['pets'] as const;

/**
 * Hook to fetch all pets
 */
export const useGetPets = () =>
  useQuery({
    queryKey: PETS_QUERY_KEY,
    queryFn: petsApi.getPets,
  });

/**
 * Hook to fetch a single pet by ID
 */
export const useGetPetById = (id: string | undefined) =>
  useQuery({
    queryKey: [PETS_QUERY_KEY, id],
    queryFn: () => petsApi.getPetById(id!),
    enabled: !!id,
  });

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
export const useCreatePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Pet, 'id' | 'created_at' | 'updated_at'>) => petsApi.createPet(data),
    onSuccess: (newPet) => {
      queryClient.invalidateQueries({ queryKey: PETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [PETS_QUERY_KEY, 'owner', newPet.owner_id] });
    },
  });
};

/**
 * Hook to update an existing pet
 */
export const useUpdatePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pet> }) => petsApi.updatePet(id, data),
    onSuccess: (updatedPet) => {
      queryClient.invalidateQueries({ queryKey: PETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [PETS_QUERY_KEY, updatedPet.id] });
      queryClient.invalidateQueries({ queryKey: [PETS_QUERY_KEY, 'owner', updatedPet.owner_id] });
    },
  });
};

/**
 * Hook to delete a pet
 */
export const useDeletePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => petsApi.deletePet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PETS_QUERY_KEY });
    },
  });
};
