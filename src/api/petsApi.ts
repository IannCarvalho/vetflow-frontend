/**
 * Pets API
 *
 * Provides typed functions for pet CRUD operations and filtering.
 */
import axiosInstance from './axios';

import type { Pet } from '../types';

/**
 * Fetch all pets
 */
export const getPets = async (): Promise<Pet[]> => {
  const response = await axiosInstance.get<Pet[]>('/pets');
  return response.data;
};

/**
 * Fetch a single pet by ID
 */
export const getPetById = async (id: string): Promise<Pet> => {
  const response = await axiosInstance.get<Pet>(`/pets/${id}`);
  return response.data;
};

/**
 * Fetch all pets owned by a specific client
 */
export const getPetsByOwnerId = async (ownerId: string): Promise<Pet[]> => {
  const response = await axiosInstance.get<Pet[]>(`/pets`, {
    params: { owner_id: ownerId },
  });
  return response.data;
};

/**
 * Create a new pet
 */
export const createPet = async (
  data: Omit<Pet, 'id' | 'created_at' | 'updated_at'>
): Promise<Pet> => {
  const response = await axiosInstance.post<Pet>('/pets', data);
  return response.data;
};

/**
 * Update an existing pet
 */
export const updatePet = async (id: string, data: Partial<Pet>): Promise<Pet> => {
  const response = await axiosInstance.put<Pet>(`/pets/${id}`, data);
  return response.data;
};

/**
 * Delete a pet
 */
export const deletePet = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/pets/${id}`);
};
