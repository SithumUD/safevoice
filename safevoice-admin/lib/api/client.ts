import { API_BASE_URL, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from './config';

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function getStoredTokens() {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  const accessToken = getCookie(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = getCookie(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY);
  return { accessToken, refreshToken };
}

export function saveTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return;
  setCookie(ACCESS_TOKEN_KEY, accessToken, 1); // Access token
  setCookie(REFRESH_TOKEN_KEY, refreshToken, 7); // Refresh token
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  deleteCookie(ACCESS_TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { accessToken, refreshToken } = getStoredTokens();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  let response = await fetch(url, config);

  // If 401 Unauthorized or 403 Forbidden and we have a refreshToken, try silent refresh
  if ((response.status === 401 || response.status === 403) && refreshToken && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.accessToken) {
          saveTokens(refreshData.accessToken, refreshData.refreshToken || refreshToken);
          headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
          response = await fetch(url, { ...options, headers });
        }
      } else {
        clearTokens();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login?error=Session expired. Please log in again.';
          return {} as T;
        }
      }
    } catch (err) {
      clearTokens();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?error=Session expired. Please log in again.';
        return {} as T;
      }
    }
  }

  // If no refresh token available and request failed with 401/403, redirect to login immediately
  if ((response.status === 401 || response.status === 403) && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    clearTokens();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login?error=Authentication required. Please log in.';
      return {} as T;
    }
  }

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      errorMsg = errorJson.message || errorJson.error || errorMsg;
    } catch (e) {
      // JSON parse failed
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
