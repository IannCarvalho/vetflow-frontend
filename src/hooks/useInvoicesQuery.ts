/**
 * Invoices React Query Hooks
 *
 * Provides React Query hooks for invoice (financeiro) data fetching and mutations.
 */
import { useQuery } from '@tanstack/react-query';

import * as invoicesApi from '../api/invoicesApi';
import { createEntityHooks } from './createEntityHooks';

import type { Invoice } from '../types';

const INVOICES_QUERY_KEY = ['invoices'] as const;

type CreateInvoiceInput = Omit<Invoice, 'id' | 'created_at' | 'updated_at'>;

const invoiceHooks = createEntityHooks<Invoice, CreateInvoiceInput>({
  queryKey: INVOICES_QUERY_KEY,
  // Chave de detalhe espalhada (default): [...QUERY_KEY, id].
  detailKey: (id) => [...INVOICES_QUERY_KEY, id],
  // Invalida também a lista "por cliente" na criação/atualização.
  relatedKeys: (invoice) => [[...INVOICES_QUERY_KEY, 'client', invoice.client_id]],
  api: {
    getAll: invoicesApi.getInvoices,
    getById: invoicesApi.getInvoiceById,
    create: invoicesApi.createInvoice,
    update: invoicesApi.updateInvoice,
    remove: invoicesApi.deleteInvoice,
  },
});

/**
 * Hook to fetch all invoices
 */
export const useGetInvoices = invoiceHooks.useGetAll;

/**
 * Hook to fetch a single invoice by ID
 */
export const useGetInvoiceById = invoiceHooks.useGetById;

/**
 * Hook to fetch all invoices for a specific client
 */
export const useGetInvoicesByClientId = (clientId: string | undefined) =>
  useQuery({
    queryKey: [...INVOICES_QUERY_KEY, 'client', clientId],
    queryFn: () => invoicesApi.getInvoicesByClientId(clientId!),
    enabled: !!clientId,
  });

/**
 * Hook to create a new invoice
 */
export const useCreateInvoice = invoiceHooks.useCreate;

/**
 * Hook to update an existing invoice
 */
export const useUpdateInvoice = invoiceHooks.useUpdate;

/**
 * Hook to delete an invoice
 */
export const useDeleteInvoice = invoiceHooks.useDelete;
