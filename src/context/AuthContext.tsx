import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { AuthApi } from '@/lib/api/authApi';
import { TokenStorage } from '@/lib/storage/tokenStorage';
import { isAuthError } from '@/shared/errors';
import type { AuthSessionResponse, PublicUser } from '@/shared/types/auth';
import { AuthValidator } from '@/shared/validators/authValidator';

interface AuthContextValue {
  user: PublicUser | null;
  isReady: boolean;
  initializationError: string | null;
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string, confirmation: string): Promise<void>;
  logout(): Promise<void>;
  retryInitialization(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadCurrentUser(): Promise<PublicUser | null> {
  const token = await TokenStorage.get();
  if (!token && !TokenStorage.usesCookieSession) return null;

  try {
    return (await AuthApi.me(token)).user;
  } catch (error) {
    if (isAuthError(error) && error.code === 'UNAUTHORIZED') {
      await TokenStorage.clear();
      return null;
    }
    throw error;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  const retryInitialization = useCallback(async () => {
    setIsReady(false);
    setInitializationError(null);
    try {
      setUser(await loadCurrentUser());
    } catch (error) {
      setInitializationError(error instanceof Error ? error.message : 'Gagal memuat data akun.');
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    void loadCurrentUser()
      .then((activeUser) => {
        if (isMounted) setUser(activeUser);
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setInitializationError(error instanceof Error ? error.message : 'Gagal memuat data akun.');
        }
      })
      .finally(() => {
        if (isMounted) setIsReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const startSession = useCallback(async (session: AuthSessionResponse) => {
    await TokenStorage.set(session.token);
    setUser(session.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      // Validasi di client hanya untuk umpan balik cepat; server tetap memvalidasi ulang.
      const body = AuthValidator.validateLogin({ email, password });
      await startSession(await AuthApi.login(body));
    },
    [startSession],
  );

  const register = useCallback(
    async (name: string, email: string, password: string, confirmation: string) => {
      const body = AuthValidator.validateRegistration({ name, email, password, confirmation });
      await startSession(await AuthApi.register(body));
    },
    [startSession],
  );

  const logout = useCallback(async () => {
    const token = await TokenStorage.get();
    try {
      await AuthApi.logout(token);
    } finally {
      // Tetap keluar secara lokal walaupun server tidak terjangkau.
      await TokenStorage.clear();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isReady,
      initializationError,
      login,
      register,
      logout,
      retryInitialization,
    }),
    [initializationError, isReady, login, logout, register, retryInitialization, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  return context;
}
