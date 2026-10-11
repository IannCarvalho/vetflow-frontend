/**
 * Vaccines React Query Hooks
 *
 * Provides React Query hooks for vaccine data fetching and mutations.
 */
import { useQuery } from '@tanstack/react-query';

import * as vaccinesApi from '../api/vaccinesApi';
import { createEntityHooks } from './createEntityHooks';

import type { Vaccine } from '../types';

const VACCINES_QUERY_KEY = ['vaccines'] as const;

type CreateVaccineInput = Omit<Vaccine, 'id' | 'created_at'>;

const vaccineHooks = createEntityHooks<Vaccine, CreateVaccineInput>({
  queryKey: VACCINES_QUERY_KEY,
  // Forma histórica da chave de detalhe: [QUERY_KEY, id] (array aninhado).
  detailKey: (id) => [VACCINES_QUERY_KEY, id],
  // Invalida também a lista "por pet" na criação/atualização.
  relatedKeys: (vaccine) => [[VACCINES_QUERY_KEY, 'pet', vaccine.pet_id]],
  api: {
    getAll: vaccinesApi.getVaccines,
    getById: vaccinesApi.getVaccineById,
    create: vaccinesApi.createVaccine,
    update: vaccinesApi.updateVaccine,
    remove: vaccinesApi.deleteVaccine,
  },
});

/**
 * Hook to fetch all vaccines
 */
export const useGetVaccines = vaccineHooks.useGetAll;

/**
 * Hook to fetch a single vaccine by ID
 */
export const useGetVaccineById = vaccineHooks.useGetById;

/**
 * Hook to fetch all vaccines for a specific pet
 */
export const useGetVaccinesByPetId = (petId: string | undefined) =>
  useQuery({
    queryKey: [VACCINES_QUERY_KEY, 'pet', petId],
    queryFn: () => vaccinesApi.getVaccinesByPetId(petId!),
    enabled: !!petId,
  });

/**
 * Hook to create a new vaccine record
 */
export const useCreateVaccine = vaccineHooks.useCreate;

/**
 * Hook to update an existing vaccine record
 */
export const useUpdateVaccine = vaccineHooks.useUpdate;

/**
 * Hook to delete a vaccine record
 */
export const useDeleteVaccine = vaccineHooks.useDelete;
