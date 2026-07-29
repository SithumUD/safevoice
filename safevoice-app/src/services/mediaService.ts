// src/services/mediaService.ts
import { apiClient } from './apiClient';
import { AvatarCatalogItem, CloudinarySignatureDTO, MediaUploadResponseDTO } from '../types/api';

export const mediaService = {
  async getAvatars(): Promise<AvatarCatalogItem[]> {
    const res = await apiClient.get<AvatarCatalogItem[]>('/media/avatars');
    return res.data;
  },

  async uploadMedia(
    fileUri: string,
    fileType: 'image' | 'video',
    folder: 'topics' | 'comments' = 'topics'
  ): Promise<MediaUploadResponseDTO> {
    const formData = new FormData();
    const filename = fileUri.split('/').pop() || 'upload';
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1].toLowerCase() : fileType === 'image' ? 'jpg' : 'mp4';
    const mimeType = fileType === 'image' ? `image/${ext}` : `video/${ext}`;

    // Append file object for React Native FormData
    formData.append('file', {
      uri: fileUri,
      name: filename,
      type: mimeType,
    } as any);
    formData.append('folder', folder);

    const res = await apiClient.post<MediaUploadResponseDTO>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data;
  },

  async getUploadSignature(): Promise<CloudinarySignatureDTO> {
    const res = await apiClient.get<CloudinarySignatureDTO>('/media/upload-signature');
    return res.data;
  },
};
