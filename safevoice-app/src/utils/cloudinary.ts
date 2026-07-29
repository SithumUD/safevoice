import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// 15 MB limit for video
const MAX_VIDEO_SIZE_MB = 15;
// 5 MB limit for images
const MAX_IMAGE_SIZE_MB = 5;

// 60 seconds limit for video
const MAX_VIDEO_DURATION_MS = 60000;

export async function validateMedia(
  uri: string,
  type: 'image' | 'video',
  fileSize?: number,
  duration?: number
): Promise<{ valid: boolean; error?: string }> {
  // Check duration first if available
  if (type === 'video' && duration && duration > MAX_VIDEO_DURATION_MS) {
    return { valid: false, error: `Video must be shorter than ${MAX_VIDEO_DURATION_MS / 1000} seconds.` };
  }

  // Check file size
  let sizeInBytes = fileSize;
  if (!sizeInBytes) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        sizeInBytes = fileInfo.size;
      }
    } catch (e) {
      console.warn("Could not read file size", e);
    }
  }

  if (sizeInBytes) {
    const sizeInMb = sizeInBytes / (1024 * 1024);
    if (type === 'video' && sizeInMb > MAX_VIDEO_SIZE_MB) {
      return { valid: false, error: `Video size exceeds ${MAX_VIDEO_SIZE_MB}MB.` };
    }
    if (type === 'image' && sizeInMb > MAX_IMAGE_SIZE_MB) {
      return { valid: false, error: `Image size exceeds ${MAX_IMAGE_SIZE_MB}MB.` };
    }
  }

  return { valid: true };
}

export async function uploadToCloudinary(uri: string, type: 'image' | 'video'): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary configuration is missing');
  }

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${type === 'video' ? 'video' : 'image'}/upload`;

  try {
    const uploadResult = await FileSystem.uploadAsync(url, uri, {
      httpMethod: 'POST',
      uploadType: 1 as any,
      fieldName: 'file',
      parameters: {
        upload_preset: UPLOAD_PRESET,
      },
    });

    const responseData = JSON.parse(uploadResult.body);

    if (uploadResult.status < 200 || uploadResult.status >= 300) {
      throw new Error(responseData.error?.message || 'Upload failed');
    }

    return responseData.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}
