/**
 * Invoices React Query Hooks
 *
 * Provides React Query hooks for invoice (financeiro) data fetching and mutations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as invoicesApi from '../api/invoicesApi';

import type { Invoice } from '../types';

const INVOICES_QUERY_KEY = ['invoices'] as const;

type CreateInvoiceInput = Omit<Invoice, 'id' | 'created_at' | 'updated_at'>;

/**
 * Hook to fetch all invoices
 */
export const useGetInvoices = () =>
  useQuery({
    queryKey: INVOICES_QUERY_KEY,
    queryFn: invoicesApi.getInvoices,
  });

/**
 * Hook to fetch a single invoice by ID
 */
export const useGetInvoiceById = (id: string | undefined) =>
  useQuery({
    queryKey: [...INVOICES_QUERY_KEY, id],
    queryFn: () => invoicesApi.getInvoiceById(id!),
    enabled: !!id,
  });

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
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceInput) => invoicesApi.createInvoice(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...INVOICES_QUERY_KEY, 'client', created.client_id],
      });
    },
  });
};

/**
 * Hook to update an existing invoice
 */
export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) =>
      invoicesApi.updateInvoice(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...INVOICES_QUERY_KEY, updated.id] });
      queryClient.invalidateQueries({
        queryKey: [...INVOICES_QUERY_KEY, 'client', updated.client_id],
      });
    },
  });
};

/**
 * Hook to delete an invoice
 */
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
    },
  });
};
