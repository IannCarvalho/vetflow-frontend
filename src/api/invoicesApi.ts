/**
 * Invoices API
 *
 * Provides typed functions for invoice (financeiro) CRUD operations and filtering.
 */
import axiosInstance from './axios';

import type { Invoice } from '../types';

/**
 * Fetch all invoices for the authenticated veterinarian
 */
export const getInvoices = async (): Promise<Invoice[]> => {
  const response = await axiosInstance.get<Invoice[]>('/invoices');
  return response.data;
};

/**
 * Fetch a single invoice by ID
 */
export const getInvoiceById = async (id: string): Promise<Invoice> => {
  const response = await axiosInstance.get<Invoice>(`/invoices/${id}`);
  return response.data;
};

/**
 * Fetch all invoices for a specific client
 */
export const getInvoicesByClientId = async (clientId: string): Promise<Invoice[]> => {
  const response = await axiosInstance.get<Invoice[]>('/invoices', {
    params: { client_id: clientId },
  });
  return response.data;
};

type CreateInvoiceInput = Omit<Invoice, 'id' | 'created_at' | 'updated_at'>;

/**
 * Create a new invoice
 */
export const createInvoice = async (data: CreateInvoiceInput): Promise<Invoice> => {
  const response = await axiosInstance.post<Invoice>('/invoices', data);
  return response.data;
};

/**
 * Update an existing invoice
 */
export const updateInvoice = async (id: string, data: Partial<Invoice>): Promise<Invoice> => {
  const response = await axiosInstance.put<Invoice>(`/invoices/${id}`, data);
  return response.data;
};

/**
 * Delete an invoice
 */
export const deleteInvoice = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/invoices/${id}`);
};
