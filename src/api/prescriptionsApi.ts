/**
 * Prescriptions API
 *
 * Provides typed functions for prescription (receituário) CRUD operations and filtering.
 */
import axiosInstance from './axios';

import type { Prescription } from '../types';

/**
 * Fetch all prescriptions for the authenticated veterinarian
 */
export const getPrescriptions = async (): Promise<Prescription[]> => {
  const response = await axiosInstance.get<Prescription[]>('/prescriptions');
  return response.data;
};

/**
 * Fetch a single prescription by ID
 */
export const getPrescriptionById = async (id: string): Promise<Prescription> => {
  const response = await axiosInstance.get<Prescription>(`/prescriptions/${id}`);
  return response.data;
};

/**
 * Fetch the print-ready HTML document for a prescription.
 *
 * The backend resolves the pet, tutor and veterinarian header server-side and
 * returns a self-contained HTML document. Fetching it through the axios
 * instance ensures the JWT is attached (a plain window.open could not send the
 * Authorization header).
 */
export const getPrescriptionPrintHtml = async (id: string): Promise<string> => {
  const response = await axiosInstance.get<string>(`/prescriptions/${id}/print`, {
    responseType: 'text',
    headers: { Accept: 'text/html' },
  });
  return response.data;
};

/**
 * Fetch all prescriptions for a specific pet
 */
export const getPrescriptionsByPetId = async (petId: string): Promise<Prescription[]> => {
  const response = await axiosInstance.get<Prescription[]>('/prescriptions', {
    params: { pet_id: petId },
  });
  return response.data;
};

type CreatePrescriptionInput = Omit<Prescription, 'id' | 'created_at' | 'updated_at'>;

/**
 * Create a new prescription
 */
export const createPrescription = async (
  data: CreatePrescriptionInput
): Promise<Prescription> => {
  const response = await axiosInstance.post<Prescription>('/prescriptions', data);
  return response.data;
};

/**
 * Update an existing prescription
 */
export const updatePrescription = async (
  id: string,
  data: Partial<Prescription>
): Promise<Prescription> => {
  const response = await axiosInstance.put<Prescription>(`/prescriptions/${id}`, data);
  return response.data;
};

/**
 * Delete a prescription
 */
export const deletePrescription = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/prescriptions/${id}`);
};
