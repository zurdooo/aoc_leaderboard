import { useState, useEffect, useCallback } from 'react';

const API = (import.meta as ImportMeta).env?.VITE_API_BASE || 'http://localhost:3001';

interface AuthState {
  isAuthenticated: boolean;
  username: string;
  isLoading: boolean;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface UseAuthReturn extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    username: '',
    isLoading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const resp = await fetch(`${API}/api/me`, {
          credentials: 'include',
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.authenticated) {
            setState({
              isAuthenticated: true,
              username: data.user?.username || '',
              isLoading: false,
            });
            return;
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
      }
      setState((prev) => ({ ...prev, isLoading: false }));
    };
    checkSession();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const resp = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        return { success: false, error: body?.error || `Login failed (${resp.status})` };
      }

      setState({
        isAuthenticated: true,
        username: credentials.username,
        isLoading: false,
      });
      return { success: true };
    } catch (err) {
      console.error(err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        return { success: false, error: 'Server is not available.' };
      }
      if (err instanceof Error) {
        return { success: false, error: err.message };
      }
      return { success: false, error: 'An unexpected error occurred.' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout failed:', err);
    }
    setState({
      isAuthenticated: false,
      username: '',
      isLoading: false,
    });
  }, []);

  return {
    ...state,
    login,
    logout,
  };
}
