import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type {
  AuthContextValue,
  AuthProviderProps,
  AuthUser,
  CredentialsPayload,
  PasswordResetPayload,
  RegisterPayload,
} from '@/types/hooks/auth';

const DEFAULT_USER_PROFILE: AuthUser = {
  id: 'mock-user',
  firstName: 'Santiago',
  lastName: 'Bancalari',
  email: 'santiago@example.com',
  cuil: '20-32242925-9',
  companyName: 'Midas',
  companyDescription: 'Soluciones Tecnológicas',
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const simulateNetworkDelay = useCallback(async () => {
    setIsAuthLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsAuthLoading(false);
  }, []);

  const signIn = useCallback(
    async ({ email }: CredentialsPayload) => {
      await simulateNetworkDelay();
      setUser({ ...DEFAULT_USER_PROFILE, email });
      setIsAuthenticated(true);
    },
    [simulateNetworkDelay],
  );

  const register = useCallback(
    async ({ email, fullName }: RegisterPayload) => {
      await simulateNetworkDelay();
      const [firstName = DEFAULT_USER_PROFILE.firstName, ...rest] = (fullName ?? '').split(' ');
      const lastName = rest.join(' ') || DEFAULT_USER_PROFILE.lastName;
      setUser({
        ...DEFAULT_USER_PROFILE,
        firstName,
        lastName,
        email,
      });
      setIsAuthenticated(true);
    },
    [simulateNetworkDelay],
  );

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const requestPasswordReset = useCallback(
    async (_payload: PasswordResetPayload) => {
      await simulateNetworkDelay();
    },
    [simulateNetworkDelay],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isAuthLoading,
      user,
      signIn,
      signOut,
      register,
      requestPasswordReset,
    }),
    [isAuthenticated, isAuthLoading, register, requestPasswordReset, signIn, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
