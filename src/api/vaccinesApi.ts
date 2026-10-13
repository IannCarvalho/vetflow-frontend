/**
 * Vaccines API
 *
 * Provides typed functions for vaccine CRUD operations and filtering.
 * The CRUD core is delegated to createEntityApi; only the by-pet filter is
 * hand-written here.
 */
import axiosInstance from './axios';
import { createEntityApi } from './createEntityApi';

import type { Vaccine } from '../types';

type CreateVaccineInput = Omit<Vaccine, 'id' | 'created_at'>;

const base = createEntityApi<Vaccine, CreateVaccineInput>('/vaccines');

/** Fetch all vaccines */
export const getVaccines = base.getAll;
/** Fetch a single vaccine by ID */
export const getVaccineById = base.getById;
/** Create a new vaccine record */
export const createVaccine = base.create;
/** Update an existing vaccine record */
export const updateVaccine = base.update;
/** Delete a vaccine record */
export const deleteVaccine = base.remove;

/**
 * Fetch all vaccines for a specific pet
 */
export const getVaccinesByPetId = async (petId: string): Promise<Vaccine[]> => {
  const response = await axiosInstance.get<Vaccine[]>('/vaccines', {
    params: { pet_id: petId },
  });
  return response.data;
};
