// src/store/authStore.ts
import { authService } from '../services/authService';
import { storage } from '../services/storage';
import { UserResponseDTO } from '../types/api';

export interface AuthState {
  user: UserResponseDTO | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  guestId: string | null;
  isLoading: boolean;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<UserResponseDTO>;
  register: (email: string, password: string, nickname: string) => Promise<UserResponseDTO>;
  logout: () => Promise<void>;
  enableGuestMode: () => Promise<void>;
  convertGuest: () => Promise<void>;
  refreshUser: () => Promise<UserResponseDTO | null>;
}

// Simple pub/sub store to avoid complex external dependencies if not using zustand
type Listener = () => void;

let state: AuthState = {
  user: null,
  isAuthenticated: false,
  isGuest: false,
  guestId: null,
  isLoading: true,

  initialize: async () => {
    try {
      const savedUser = await storage.getUser();
      const accessToken = await storage.getAccessToken();
      const guestId = await storage.getGuestId();

      if (savedUser && accessToken) {
        state = {
          ...state,
          user: savedUser,
          isAuthenticated: true,
          isGuest: false,
          isLoading: false,
        };
      } else if (guestId) {
        state = {
          ...state,
          user: null,
          isAuthenticated: false,
          isGuest: true,
          guestId,
          isLoading: false,
        };
      } else {
        state = {
          ...state,
          user: null,
          isAuthenticated: false,
          isGuest: false,
          isLoading: false,
        };
      }
    } catch {
      state = {
        ...state,
        user: null,
        isAuthenticated: false,
        isGuest: false,
        isLoading: false,
      };
    }
    notifyListeners();
  },

  login: async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    state = {
      ...state,
      user: res.user,
      isAuthenticated: true,
      isGuest: false,
      isLoading: false,
    };
    notifyListeners();
    return res.user;
  },

  register: async (email: string, password: string, nickname: string) => {
    const res = await authService.register({ email, password, nickname });
    state = {
      ...state,
      user: res.user,
      isAuthenticated: true,
      isGuest: false,
      isLoading: false,
    };
    notifyListeners();
    return res.user;
  },

  logout: async () => {
    await authService.logout();
    state = {
      ...state,
      user: null,
      isAuthenticated: false,
      isGuest: false,
      isLoading: false,
    };
    notifyListeners();
  },

  enableGuestMode: async () => {
    let guestId = await storage.getGuestId();
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
      await storage.setGuestId(guestId);
    }
    state = {
      ...state,
      user: null,
      isAuthenticated: false,
      isGuest: true,
      guestId,
      isLoading: false,
    };
    notifyListeners();
  },

  convertGuest: async () => {
    if (state.guestId && state.isAuthenticated) {
      await authService.convertGuest(state.guestId);
      await storage.setGuestId('');
      state = { ...state, guestId: null };
      notifyListeners();
    }
  },

  refreshUser: async () => {
    try {
      const user = await authService.getMe();
      state = { ...state, user };
      notifyListeners();
      return user;
    } catch {
      return null;
    }
  },
};

const listeners = new Set<Listener>();

export function getAuthState(): AuthState {
  return state;
}

export function subscribeAuth(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetAuth(): void {
  state = {
    ...state,
    user: null,
    isAuthenticated: false,
    isGuest: false,
    isLoading: false,
  };
  notifyListeners();
}

function notifyListeners() {
  listeners.forEach((l) => l());
}
