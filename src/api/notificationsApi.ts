/**
 * Notifications API
 * API calls for notification management
 */
import axiosInstance from './axios';

export interface Notification {
  id: string;
  vet_id: string;
  pet_id: string;
  type: 'consultation' | 'vaccine';
  title: string;
  message: string;
  days_until: number;
  target_date: string;
  status: 'pending' | 'sent' | 'dismissed';
  created_at: string;
  sent_at?: string;
}

export const notificationsApi = {
  generate: async () => {
    const response = await axiosInstance.post('/notifications/generate');
    return response.data;
  },

  getAll: async () => {
    const response = await axiosInstance.get('/notifications');
    return response.data;
  },

  markAsRead: async (notificationId: string) => {
    const response = await axiosInstance.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  dismiss: async (notificationId: string) => {
    const response = await axiosInstance.put(`/notifications/${notificationId}/dismiss`);
    return response.data;
  },
};
