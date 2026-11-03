import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { AuthApi } from '@/lib/api/authApi';
import { setUnauthorizedHandler } from '@/lib/api/client';
import { TokenStorage } from '@/lib/storage/tokenStorage';
import { isAuthError } from '@/shared/errors';
import type { AuthSessionResponse, PublicUser } from '@/shared/types/auth';
import { AuthValidator } from '@/shared/validators/authValidator';

interface AuthContextValue {
  user: PublicUser | null;
  /** Token sesi (native) untuk request yang tidak lewat apiRequest, mis. gambar. Null di web (pakai cookie). */
  token: string | null;
  isReady: boolean;
  initializationError: string | null;
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string, confirmation: string): Promise<void>;
  logout(): Promise<void>;
  /** Mengganti data user setelah server mengembalikan versi terbaru (mis. foto profil berubah). */
  updateUser(user: PublicUser): void;
  retryInitialization(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadCurrentSession(): Promise<{ user: PublicUser | null; token: string | null }> {
  const token = await TokenStorage.get();
  if (!token && !TokenStorage.usesCookieSession) return { user: null, token: null };

  try {
    // Token disisipkan otomatis oleh request interceptor; di sini hanya diteruskan untuk memuat gambar.
    return { user: (await AuthApi.me()).user, token };
  } catch (error) {
    if (isAuthError(error) && error.code === 'UNAUTHORIZED') {
      await TokenStorage.clear();
      return { user: null, token: null };
    }
    throw error;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  const retryInitialization = useCallback(async () => {
    setIsReady(false);
    setInitializationError(null);
    try {
      const session = await loadCurrentSession();
      setUser(session.user);
      setToken(session.token);
    } catch (error) {
      setInitializationError(error instanceof Error ? error.message : 'Gagal memuat data akun.');
    } finally {
      setIsReady(true);
    }
  }, []);

  // Response interceptor memanggil ini saat server menjawab 401 UNAUTHORIZED di request mana pun.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void TokenStorage.clear();
      setToken(null);
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    let isMounted = true;
    void loadCurrentSession()
      .then((session) => {
        if (!isMounted) return;
        setUser(session.user);
        setToken(session.token);
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
    setToken(TokenStorage.usesCookieSession ? null : session.token);
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
    try {
      await AuthApi.logout();
    } finally {
      // Tetap keluar secara lokal walaupun server tidak terjangkau.
      await TokenStorage.clear();
      setToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isReady,
      initializationError,
      login,
      register,
      logout,
      updateUser: setUser,
      retryInitialization,
    }),
    [initializationError, isReady, login, logout, register, retryInitialization, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  return context;
}
