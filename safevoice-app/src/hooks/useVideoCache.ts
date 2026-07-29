import * as FileSystem from 'expo-file-system/legacy';
import { useState, useEffect } from 'react';

// Ensure the cache directory exists
const VIDEO_CACHE_DIR = FileSystem.cacheDirectory + 'video_cache/';

const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(VIDEO_CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(VIDEO_CACHE_DIR, { intermediates: true });
  }
};

export const useVideoCache = (remoteUri: string | null | undefined, shouldCache: boolean = false) => {
  const [localUri, setLocalUri] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const cacheVideo = async () => {
      if (!remoteUri || !shouldCache) return;

      try {
        await ensureDirExists();

        // Create a safe filename from the remote URL
        const filename = remoteUri.split('/').pop()?.split('?')[0] || `video_${Date.now()}.mp4`;
        const fileUri = VIDEO_CACHE_DIR + filename;

        // Check if it already exists
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          if (isMounted) {
            setLocalUri(fileUri);
          }
          return;
        }

        // Doesn't exist, download it
        const downloadResult = await FileSystem.downloadAsync(remoteUri, fileUri);
        
        if (isMounted) {
          setLocalUri(downloadResult.uri);
        }
      } catch (error) {
        console.error('Error caching video:', error);
        // Fallback to remote URI if caching fails
        if (isMounted) {
          setLocalUri(remoteUri);
        }
      }
    };

    cacheVideo();

    return () => {
      isMounted = false;
    };
  }, [remoteUri, shouldCache]);

  return { localUri };
};

export const clearVideoCache = async () => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(VIDEO_CACHE_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(VIDEO_CACHE_DIR, { idempotent: true });
      await ensureDirExists();
    }
  } catch (error) {
    console.error('Error clearing video cache:', error);
  }
};
