/**
 * Consultations API
 *
 * Provides typed functions for consultation CRUD operations and filtering.
 */
import axiosInstance from './axios';

import type { Consultation } from '../types';

/**
 * Fetch all consultations
 */
export const getConsultations = async (): Promise<Consultation[]> => {
  const response = await axiosInstance.get<Consultation[]>('/consultations');
  return response.data;
};

/**
 * Fetch a single consultation by ID
 */
export const getConsultationById = async (id: string): Promise<Consultation> => {
  const response = await axiosInstance.get<Consultation>(`/consultations/${id}`);
  return response.data;
};

/**
 * Fetch all consultations for a specific pet
 */
export const getConsultationsByPetId = async (petId: string): Promise<Consultation[]> => {
  const response = await axiosInstance.get<Consultation[]>('/consultations', {
    params: { pet_id: petId },
  });
  return response.data;
};

/**
 * Create a new consultation
 */
export const createConsultation = async (
  data: Omit<Consultation, 'id' | 'created_at'>
): Promise<Consultation> => {
  const response = await axiosInstance.post<Consultation>('/consultations', data);
  return response.data;
};

/**
 * Update an existing consultation
 */
export const updateConsultation = async (
  id: string,
  data: Partial<Consultation>
): Promise<Consultation> => {
  const response = await axiosInstance.put<Consultation>(`/consultations/${id}`, data);
  return response.data;
};

/**
 * Delete a consultation
 */
export const deleteConsultation = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/consultations/${id}`);
};
