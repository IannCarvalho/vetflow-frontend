/**
 * Prescriptions React Query Hooks
 *
 * Provides React Query hooks for prescription (receituário) data fetching and mutations.
 */
import { useQuery } from '@tanstack/react-query';

import { createEntityHooks } from './createEntityHooks';
import * as prescriptionsApi from '../api/prescriptionsApi';

import type { Prescription } from '../types';

const PRESCRIPTIONS_QUERY_KEY = ['prescriptions'] as const;

type CreatePrescriptionInput = Omit<Prescription, 'id' | 'created_at' | 'updated_at'>;

const prescriptionHooks = createEntityHooks<Prescription, CreatePrescriptionInput>({
  queryKey: PRESCRIPTIONS_QUERY_KEY,
  // Chave de detalhe espalhada (default): [...QUERY_KEY, id].
  detailKey: (id) => [...PRESCRIPTIONS_QUERY_KEY, id],
  // Invalida também a lista "por pet" na criação/atualização.
  relatedKeys: (prescription) => [[...PRESCRIPTIONS_QUERY_KEY, 'pet', prescription.pet_id]],
  api: {
    getAll: prescriptionsApi.getPrescriptions,
    getById: prescriptionsApi.getPrescriptionById,
    create: prescriptionsApi.createPrescription,
    update: prescriptionsApi.updatePrescription,
    remove: prescriptionsApi.deletePrescription,
  },
});

/**
 * Hook to fetch all prescriptions
 */
export const useGetPrescriptions = prescriptionHooks.useGetAll;

/**
 * Hook to fetch a single prescription by ID
 */
export const useGetPrescriptionById = prescriptionHooks.useGetById;

/**
 * Hook to fetch all prescriptions for a specific pet
 */
export const useGetPrescriptionsByPetId = (petId: string | undefined) =>
  useQuery({
    queryKey: [...PRESCRIPTIONS_QUERY_KEY, 'pet', petId],
    queryFn: () => prescriptionsApi.getPrescriptionsByPetId(petId!),
    enabled: !!petId,
  });

/**
 * Hook to create a new prescription
 */
export const useCreatePrescription = prescriptionHooks.useCreate;

/**
 * Hook to update an existing prescription
 */
export const useUpdatePrescription = prescriptionHooks.useUpdate;

/**
 * Hook to delete a prescription
 */
export const useDeletePrescription = prescriptionHooks.useDelete;
