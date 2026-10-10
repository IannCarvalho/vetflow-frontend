/**
 * Dashboard API
 *
 * Provides a typed function for the aggregated dashboard stats endpoint.
 */
import axiosInstance from './axios';

import type { DashboardStats } from '../types';

/**
 * Fetch aggregated, vet-scoped dashboard stats
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axiosInstance.get<DashboardStats>('/dashboard/stats');
  return response.data;
};
