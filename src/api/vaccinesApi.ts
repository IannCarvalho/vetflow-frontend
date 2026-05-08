/**
 * Vaccines API
 *
 * Provides typed functions for vaccine CRUD operations and filtering.
 */
import axiosInstance from './axios';

import type { Vaccine } from '../types';

/**
 * Fetch all vaccines
 */
export const getVaccines = async (): Promise<Vaccine[]> => {
  const response = await axiosInstance.get<Vaccine[]>('/vaccines');
  return response.data;
};

/**
 * Fetch a single vaccine by ID
 */
export const getVaccineById = async (id: string): Promise<Vaccine> => {
  const response = await axiosInstance.get<Vaccine>(`/vaccines/${id}`);
  return response.data;
};

/**
 * Fetch all vaccines for a specific pet
 */
export const getVaccinesByPetId = async (petId: string): Promise<Vaccine[]> => {
  const response = await axiosInstance.get<Vaccine[]>('/vaccines', {
    params: { pet_id: petId },
  });
  return response.data;
};

/**
 * Create a new vaccine record
 */
export const createVaccine = async (data: Omit<Vaccine, 'id' | 'created_at'>): Promise<Vaccine> => {
  const response = await axiosInstance.post<Vaccine>('/vaccines', data);
  return response.data;
};

/**
 * Update an existing vaccine record
 */
export const updateVaccine = async (id: string, data: Partial<Vaccine>): Promise<Vaccine> => {
  const response = await axiosInstance.put<Vaccine>(`/vaccines/${id}`, data);
  return response.data;
};

/**
 * Delete a vaccine record
 */
export const deleteVaccine = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/vaccines/${id}`);
};
