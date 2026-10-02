/**
 * Dashboard React Query Hooks
 *
 * Provides React Query hooks for aggregated dashboard stats.
 */
import { useQuery } from '@tanstack/react-query';

import * as dashboardApi from '../api/dashboardApi';

const DASHBOARD_STATS_QUERY_KEY = ['dashboard', 'stats'] as const;

/**
 * Hook to fetch aggregated dashboard stats
 */
export const useGetDashboardStats = () =>
  useQuery({
    queryKey: DASHBOARD_STATS_QUERY_KEY,
    queryFn: dashboardApi.getDashboardStats,
  });
