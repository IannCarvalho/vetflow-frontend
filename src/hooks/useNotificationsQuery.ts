import type { Notification} from 'src/api/notificationsApi';

/**
 * useNotificationsQuery Hook
 * React Query hook for notifications management
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { notificationsApi } from 'src/api/notificationsApi';

export const useNotifications = () => useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll(),
    refetchInterval: 60000, // Refetch every minute
  });

export const useGenerateNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.generate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationsApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useDismissNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationsApi.dismiss(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
