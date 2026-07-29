// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { AuthState, getAuthState, subscribeAuth } from '../store/authStore';

export { getAuthState };

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>(getAuthState());

  useEffect(() => {
    const unsubscribe = subscribeAuth(() => {
      setAuthState({ ...getAuthState() });
    });
    return unsubscribe;
  }, []);

  return authState;
}
