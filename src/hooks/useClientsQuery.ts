/**
 * Clients React Query Hooks
 *
 * Provides React Query hooks for client (pet owner) data fetching and mutations.
 */
import * as clientsApi from '../api/clientsApi';
import { createEntityHooks } from './createEntityHooks';

import type { Client } from '../types';

const CLIENTS_QUERY_KEY = ['clients'] as const;

type CreateClientInput = Omit<Client, 'id' | 'created_at' | 'updated_at'>;

const clientHooks = createEntityHooks<Client, CreateClientInput>({
  queryKey: CLIENTS_QUERY_KEY,
  // Forma histórica da chave de detalhe: [QUERY_KEY, id] (array aninhado).
  detailKey: (id) => [CLIENTS_QUERY_KEY, id],
  api: {
    getAll: clientsApi.getClients,
    getById: clientsApi.getClientById,
    create: clientsApi.createClient,
    update: clientsApi.updateClient,
    remove: clientsApi.deleteClient,
  },
});

/**
 * Hook to fetch all clients
 */
export const useGetClients = clientHooks.useGetAll;

/**
 * Hook to fetch a single client by ID
 */
export const useGetClientById = clientHooks.useGetById;

/**
 * Hook to create a new client
 */
export const useCreateClient = clientHooks.useCreate;

/**
 * Hook to update an existing client
 */
export const useUpdateClient = clientHooks.useUpdate;

/**
 * Hook to delete a client
 */
export const useDeleteClient = clientHooks.useDelete;
