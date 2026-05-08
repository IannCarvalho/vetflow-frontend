/**
 * Clients API
 *
 * Provides typed functions for client (pet owner) CRUD operations.
 */
import axiosInstance from './axios';

import type { Client } from '../types';

/**
 * Fetch all clients
 */
export const getClients = async (): Promise<Client[]> => {
  const response = await axiosInstance.get<Client[]>('/clients');
  return response.data;
};

/**
 * Fetch a single client by ID
 */
export const getClientById = async (id: string): Promise<Client> => {
  const response = await axiosInstance.get<Client>(`/clients/${id}`);
  return response.data;
};

/**
 * Create a new client
 */
export const createClient = async (
  data: Omit<Client, 'id' | 'created_at' | 'updated_at'>
): Promise<Client> => {
  const response = await axiosInstance.post<Client>('/clients', data);
  return response.data;
};

/**
 * Update an existing client
 */
export const updateClient = async (id: string, data: Partial<Client>): Promise<Client> => {
  const response = await axiosInstance.put<Client>(`/clients/${id}`, data);
  return response.data;
};

/**
 * Delete a client
 */
export const deleteClient = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/clients/${id}`);
};
