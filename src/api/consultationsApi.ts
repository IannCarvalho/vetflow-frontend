/**
 * Consultations API
 *
 * Provides typed functions for consultation CRUD operations and filtering.
 * The CRUD core is delegated to createEntityApi; only the by-pet filter is
 * hand-written here.
 */
import axiosInstance from './axios';
import { createEntityApi } from './createEntityApi';

import type { Consultation } from '../types';

type CreateConsultationInput = Omit<Consultation, 'id' | 'created_at'>;

const base = createEntityApi<Consultation, CreateConsultationInput>('/consultations');

/** Fetch all consultations */
export const getConsultations = base.getAll;
/** Fetch a single consultation by ID */
export const getConsultationById = base.getById;
/** Create a new consultation */
export const createConsultation = base.create;
/** Update an existing consultation */
export const updateConsultation = base.update;
/** Delete a consultation */
export const deleteConsultation = base.remove;

/**
 * Fetch all consultations for a specific pet
 */
export const getConsultationsByPetId = async (petId: string): Promise<Consultation[]> => {
  const response = await axiosInstance.get<Consultation[]>('/consultations', {
    params: { pet_id: petId },
  });
  return response.data;
};
