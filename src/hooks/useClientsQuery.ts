/**
 * Clients React Query Hooks
 *
 * Provides React Query hooks for client (pet owner) data fetching and mutations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as clientsApi from '../api/clientsApi';

import type { Client } from '../types';

const CLIENTS_QUERY_KEY = ['clients'] as const;

/**
 * Hook to fetch all clients
 */
export const useGetClients = () =>
  useQuery({
    queryKey: CLIENTS_QUERY_KEY,
    queryFn: clientsApi.getClients,
  });

/**
 * Hook to fetch a single client by ID
 */
export const useGetClientById = (id: string | undefined) =>
  useQuery({
    queryKey: [CLIENTS_QUERY_KEY, id],
    queryFn: () => clientsApi.getClientById(id!),
    enabled: !!id,
  });

/**
 * Hook to create a new client
 */
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Client, 'id' | 'created_at' | 'updated_at'>) =>
      clientsApi.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
    },
  });
};

/**
 * Hook to update an existing client
 */
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) =>
      clientsApi.updateClient(id, data),
    onSuccess: (updatedClient) => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY, updatedClient.id] });
    },
  });
};

/**
 * Hook to delete a client
 */
export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsApi.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
    },
  });
};
