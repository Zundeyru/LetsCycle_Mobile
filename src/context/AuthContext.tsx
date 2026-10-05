import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { User } from '@/models/User';
import { UserRepository } from '@/repositories/UserRepository';
import { AuthService } from '@/services/AuthService';
import { FileStorage } from '@/services/FileStorage';

interface AuthContextValue {
  user: User | null;
  isReady: boolean;
  initializationError: string | null;
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string, confirmation: string): Promise<void>;
  logout(): Promise<void>;
  retryInitialization(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const storage = useMemo(() => new FileStorage(), []);
  const service = useMemo(
    () => new AuthService(new UserRepository(storage), storage),
    [storage],
  );
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  const loadCurrentUser = useCallback(async () => {
    await storage.initialize();
    return service.getCurrentUser();
  }, [service, storage]);

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
  }, [loadCurrentUser]);

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
  }, [loadCurrentUser]);

  const login = useCallback(
    async (email: string, password: string) => setUser(await service.login(email, password)),
    [service],
  );
  const register = useCallback(
    async (name: string, email: string, password: string, confirmation: string) =>
      setUser(await service.register(name, email, password, confirmation)),
    [service],
  );
  const logout = useCallback(async () => {
    await service.logout();
    setUser(null);
  }, [service]);

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
