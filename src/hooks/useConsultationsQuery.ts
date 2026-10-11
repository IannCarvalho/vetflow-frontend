/**
 * Consultations React Query Hooks
 *
 * Provides React Query hooks for consultation data fetching and mutations.
 */
import { useQuery } from '@tanstack/react-query';

import { createEntityHooks } from './createEntityHooks';
import * as consultationsApi from '../api/consultationsApi';

import type { Consultation } from '../types';

const CONSULTATIONS_QUERY_KEY = ['consultations'] as const;

type CreateConsultationInput = Omit<Consultation, 'id' | 'created_at'>;

const consultationHooks = createEntityHooks<Consultation, CreateConsultationInput>({
  queryKey: CONSULTATIONS_QUERY_KEY,
  // Forma histórica da chave de detalhe: [QUERY_KEY, id] (array aninhado).
  detailKey: (id) => [CONSULTATIONS_QUERY_KEY, id],
  // Invalida também a lista "por pet" na criação/atualização.
  relatedKeys: (consultation) => [[CONSULTATIONS_QUERY_KEY, 'pet', consultation.pet_id]],
  api: {
    getAll: consultationsApi.getConsultations,
    getById: consultationsApi.getConsultationById,
    create: consultationsApi.createConsultation,
    update: consultationsApi.updateConsultation,
    remove: consultationsApi.deleteConsultation,
  },
});

/**
 * Hook to fetch all consultations
 */
export const useGetConsultations = consultationHooks.useGetAll;

/**
 * Hook to fetch a single consultation by ID
 */
export const useGetConsultationById = consultationHooks.useGetById;

/**
 * Hook to fetch all consultations for a specific pet
 */
export const useGetConsultationsByPetId = (petId: string | undefined) =>
  useQuery({
    queryKey: [CONSULTATIONS_QUERY_KEY, 'pet', petId],
    queryFn: () => consultationsApi.getConsultationsByPetId(petId!),
    enabled: !!petId,
  });

/**
 * Hook to create a new consultation
 */
export const useCreateConsultation = consultationHooks.useCreate;

/**
 * Hook to update an existing consultation
 */
export const useUpdateConsultation = consultationHooks.useUpdate;

/**
 * Hook to delete a consultation
 */
export const useDeleteConsultation = consultationHooks.useDelete;
