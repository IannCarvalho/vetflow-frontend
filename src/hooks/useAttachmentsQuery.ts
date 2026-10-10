/**
 * Attachments React Query Hooks
 *
 * Provides React Query hooks for pet attachment (exams/files) data.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as attachmentsApi from '../api/attachmentsApi';

const ATTACHMENTS_QUERY_KEY = ['attachments'] as const;

/**
 * Hook to fetch attachment summaries for a specific pet
 */
export const useGetAttachmentsByPetId = (petId: string | undefined) =>
  useQuery({
    queryKey: [...ATTACHMENTS_QUERY_KEY, 'pet', petId],
    queryFn: () => attachmentsApi.getAttachmentsByPetId(petId!),
    enabled: !!petId,
  });

/**
 * Hook to create a new attachment
 */
export const useCreateAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: attachmentsApi.CreateAttachmentInput) =>
      attachmentsApi.createAttachment(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({
        queryKey: [...ATTACHMENTS_QUERY_KEY, 'pet', created.pet_id],
      });
    },
  });
};

/**
 * Hook to update attachment metadata
 */
export const useUpdateAttachment = (petId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: attachmentsApi.UpdateAttachmentInput }) =>
      attachmentsApi.updateAttachment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ATTACHMENTS_QUERY_KEY, 'pet', petId] });
    },
  });
};

/**
 * Hook to delete an attachment
 */
export const useDeleteAttachment = (petId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => attachmentsApi.deleteAttachment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ATTACHMENTS_QUERY_KEY, 'pet', petId] });
    },
  });
};
