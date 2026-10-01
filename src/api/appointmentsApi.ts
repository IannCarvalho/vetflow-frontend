/**
 * Appointments API
 *
 * Provides typed functions for appointment (agenda) CRUD operations and filtering.
 */
import axiosInstance from './axios';

import type { Appointment } from '../types';

/**
 * Fetch all appointments for the authenticated veterinarian
 */
export const getAppointments = async (): Promise<Appointment[]> => {
  const response = await axiosInstance.get<Appointment[]>('/appointments');
  return response.data;
};

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
 * Fetch a single appointment by ID
 */
export const getAppointmentById = async (id: string): Promise<Appointment> => {
  const response = await axiosInstance.get<Appointment>(`/appointments/${id}`);
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

type CreateAppointmentInput = Omit<Appointment, 'id' | 'created_at' | 'updated_at'>;

/**
 * Create a new appointment
 */
export const createAppointment = async (data: CreateAppointmentInput): Promise<Appointment> => {
  const response = await axiosInstance.post<Appointment>('/appointments', data);
  return response.data;
};

/**
 * Update an existing appointment
 */
export const updateAppointment = async (
  id: string,
  data: Partial<Appointment>
): Promise<Appointment> => {
  const response = await axiosInstance.put<Appointment>(`/appointments/${id}`, data);
  return response.data;
};

/**
 * Delete an appointment
 */
export const deleteAppointment = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/appointments/${id}`);
};
