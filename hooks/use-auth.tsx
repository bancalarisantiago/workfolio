import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type AuthContextValue = {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signOut: () => void;
  register: (payload: { email: string; password: string; fullName?: string }) => Promise<void>;
  requestPasswordReset: (payload: { email: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const simulateNetworkDelay = useCallback(async () => {
    setIsAuthLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsAuthLoading(false);
  }, []);

  const signIn = useCallback(
    async (_credentials: { email: string; password: string }) => {
      await simulateNetworkDelay();
      setIsAuthenticated(true);
    },
    [simulateNetworkDelay],
  );

  const register = useCallback(
    async (_payload: { email: string; password: string; fullName?: string }) => {
      await simulateNetworkDelay();
      setIsAuthenticated(true);
    },
    [simulateNetworkDelay],
  );

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const requestPasswordReset = useCallback(
    async (_payload: { email: string }) => {
      await simulateNetworkDelay();
    },
    [simulateNetworkDelay],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isAuthLoading,
      signIn,
      signOut,
      register,
      requestPasswordReset,
    }),
    [isAuthenticated, isAuthLoading, register, requestPasswordReset, signIn, signOut],
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
