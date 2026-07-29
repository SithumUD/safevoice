// src/services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserResponseDTO } from '../types/api';

const ACCESS_TOKEN_KEY = '@safevoice_access_token';
const REFRESH_TOKEN_KEY = '@safevoice_refresh_token';
const USER_KEY = '@safevoice_user';
const GUEST_ID_KEY = '@safevoice_guest_id';

export const storage = {
  async getAccessToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token || token === 'undefined' || token === 'null') {
        return null;
      }
      return token;
    } catch {
      return null;
    }
  },

  async setAccessToken(token: string): Promise<void> {
    if (!token || token === 'undefined' || token === 'null') {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      return;
    }
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!token || token === 'undefined' || token === 'null') {
        return null;
      }
      return token;
    } catch {
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    if (!token || token === 'undefined' || token === 'null') {
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      return;
    }
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  async saveTokens(accessToken: string, refreshToken?: string): Promise<void> {
    if (accessToken && accessToken !== 'undefined' && accessToken !== 'null') {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  async clearTokens(): Promise<void> {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  async getUser(): Promise<UserResponseDTO | null> {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async setUser(user: UserResponseDTO): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async clearUser(): Promise<void> {
    await AsyncStorage.removeItem(USER_KEY);
  },

  async getGuestId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(GUEST_ID_KEY);
    } catch {
      return null;
    }
  },

  async setGuestId(id: string): Promise<void> {
    await AsyncStorage.setItem(GUEST_ID_KEY, id);
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
      USER_KEY,
    ]);
  },
};
