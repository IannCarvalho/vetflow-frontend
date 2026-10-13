/**
 * Invoices API
 *
 * Provides typed functions for invoice (financeiro) CRUD operations and
 * filtering. The CRUD core is delegated to createEntityApi; only the by-client
 * filter is hand-written here.
 */
import axiosInstance from './axios';
import { createEntityApi } from './createEntityApi';

import type { Invoice } from '../types';

type CreateInvoiceInput = Omit<Invoice, 'id' | 'created_at' | 'updated_at'>;

const base = createEntityApi<Invoice, CreateInvoiceInput>('/invoices');

/** Fetch all invoices for the authenticated veterinarian */
export const getInvoices = base.getAll;
/** Fetch a single invoice by ID */
export const getInvoiceById = base.getById;
/** Create a new invoice */
export const createInvoice = base.create;
/** Update an existing invoice */
export const updateInvoice = base.update;
/** Delete an invoice */
export const deleteInvoice = base.remove;

/**
 * Fetch all invoices for a specific client
 */
export const getInvoicesByClientId = async (clientId: string): Promise<Invoice[]> => {
  const response = await axiosInstance.get<Invoice[]>('/invoices', {
    params: { client_id: clientId },
  });
  return response.data;
};
