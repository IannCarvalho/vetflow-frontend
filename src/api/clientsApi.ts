/**
 * Clients API
 *
 * Provides typed functions for client (pet owner) CRUD operations.
 * The CRUD core is delegated to createEntityApi.
 */
import { createEntityApi } from './createEntityApi';

import type { Client } from '../types';

type CreateClientInput = Omit<Client, 'id' | 'created_at' | 'updated_at'>;

const base = createEntityApi<Client, CreateClientInput>('/clients');

/** Fetch all clients */
export const getClients = base.getAll;
/** Fetch a single client by ID */
export const getClientById = base.getById;
/** Create a new client */
export const createClient = base.create;
/** Update an existing client */
export const updateClient = base.update;
/** Delete a client */
export const deleteClient = base.remove;
