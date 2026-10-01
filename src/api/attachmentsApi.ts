/**
 * Attachments API
 *
 * Provides typed functions for pet attachment (exams/files) operations.
 * Listing returns lightweight summaries; content is fetched on demand.
 */
import axiosInstance from './axios';

import type { Attachment, AttachmentSummary, AttachmentCategory } from '../types';

/**
 * Fetch attachment summaries for a specific pet (no base64 content)
 */
export const getAttachmentsByPetId = async (petId: string): Promise<AttachmentSummary[]> => {
  const response = await axiosInstance.get<AttachmentSummary[]>('/attachments', {
    params: { pet_id: petId },
  });
  return response.data;
};

/**
 * Fetch a single attachment including its base64 content (for preview/download)
 */
export const getAttachmentContent = async (id: string): Promise<Attachment> => {
  const response = await axiosInstance.get<Attachment>(`/attachments/${id}/content`);
  return response.data;
};

export interface CreateAttachmentInput {
  pet_id: string;
  consultation_id?: string;
  name: string;
  category: AttachmentCategory;
  mime_type: string;
  content: string;
  notes?: string;
  date?: string;
}

/**
 * Upload a new attachment
 */
export const createAttachment = async (data: CreateAttachmentInput): Promise<Attachment> => {
  const response = await axiosInstance.post<Attachment>('/attachments', data);
  return response.data;
};

export interface UpdateAttachmentInput {
  name: string;
  category?: AttachmentCategory;
  notes?: string;
}

/**
 * Update attachment metadata (name/category/notes)
 */
export const updateAttachment = async (
  id: string,
  data: UpdateAttachmentInput
): Promise<{ message: string }> => {
  const response = await axiosInstance.put<{ message: string }>(`/attachments/${id}`, data);
  return response.data;
};

/**
 * Delete an attachment
 */
export const deleteAttachment = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/attachments/${id}`);
};
