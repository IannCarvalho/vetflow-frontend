/**
 * Appointments API
 *
 * Provides typed functions for appointment (agenda) CRUD operations and
 * filtering. The CRUD core is delegated to createEntityApi; the date-range and
 * by-pet filters are hand-written here.
 */
import axiosInstance from './axios';
import { createEntityApi } from './createEntityApi';

import type { Appointment } from '../types';

type CreateAppointmentInput = Omit<Appointment, 'id' | 'created_at' | 'updated_at'>;

const base = createEntityApi<Appointment, CreateAppointmentInput>('/appointments');

/** Fetch all appointments for the authenticated veterinarian */
export const getAppointments = base.getAll;
/** Fetch a single appointment by ID */
export const getAppointmentById = base.getById;
/** Create a new appointment */
export const createAppointment = base.create;
/** Update an existing appointment */
export const updateAppointment = base.update;
/** Delete an appointment */
export const deleteAppointment = base.remove;

/**
 * Fetch appointments within a date range (RFC3339), used by the calendar view.
 */
export const getAppointmentsInRange = async (
  start: string,
  end: string
): Promise<Appointment[]> => {
  const response = await axiosInstance.get<Appointment[]>('/appointments', {
    params: { start, end },
  });
  return response.data;
};

/**
 * Fetch all appointments for a specific pet
 */
export const getAppointmentsByPetId = async (petId: string): Promise<Appointment[]> => {
  const response = await axiosInstance.get<Appointment[]>('/appointments', {
    params: { pet_id: petId },
  });
  return response.data;
};
