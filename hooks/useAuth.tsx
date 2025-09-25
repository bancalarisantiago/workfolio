import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { supabase } from '@/lib/supabase';
import type {
  AuthContextValue,
  AuthProviderProps,
  AuthUser,
  CredentialsPayload,
  PasswordResetPayload,
  RegisterPayload,
} from '@/types/hooks/auth';

type SupabaseMetadata = Record<string, unknown>;

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const toNullableString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return null;
};

const deriveNameParts = (metadata: SupabaseMetadata) => {
  const firstName =
    toNullableString(metadata.firstName) ?? toNullableString(metadata.first_name);
  const lastName = toNullableString(metadata.lastName) ?? toNullableString(metadata.last_name);
  const fullName = toNullableString(metadata.fullName) ?? toNullableString(metadata.full_name);

  if (firstName && lastName) {
    return { firstName, lastName };
  }

  if (fullName) {
    const [first, ...rest] = fullName.split(' ').filter(Boolean);
    return {
      firstName: first ?? firstName ?? null,
      lastName: rest.length > 0 ? rest.join(' ') : lastName ?? null,
    };
  }

  return { firstName, lastName };
};

const mapSupabaseUserToAuthUser = (supabaseUser: User | null): AuthUser | null => {
  if (!supabaseUser) {
    return null;
  }

  const metadata = (supabaseUser.user_metadata ?? {}) as SupabaseMetadata;
  const { firstName, lastName } = deriveNameParts(metadata);

  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? null,
    firstName,
    lastName,
    cuil: toNullableString(metadata.cuil) ?? toNullableString(metadata.CUIL),
    companyName:
      toNullableString(metadata.companyName) ?? toNullableString(metadata.company_name),
    companyDescription:
      toNullableString(metadata.companyDescription) ??
      toNullableString(metadata.company_description),
  };
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  const applySession = useCallback((session: Session | null) => {
    const sessionUser = mapSupabaseUserToAuthUser(session?.user ?? null);
    setUser(sessionUser);
    setIsAuthenticated(Boolean(sessionUser));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      setIsAuthLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!isMounted) {
          return;
        }

        if (error) {
          console.error('[AuthProvider] Failed to restore session', error);
          applySession(null);
          return;
        }

        applySession(data.session ?? null);
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    void bootstrap();

    const { data: subscription } = supabase.auth.onAuthStateChange((_, session) => {
      if (!isMounted) {
        return;
      }

      applySession(session ?? null);
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [applySession]);

  const signIn = useCallback(
    async (credentials: CredentialsPayload) => {
      setIsAuthLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword(credentials);
        if (error) {
          throw new Error(error.message);
        }

        applySession(data.session ?? null);
      } finally {
        setIsAuthLoading(false);
      }
    },
    [applySession],
  );

  const register = useCallback(
    async ({ email, password, fullName }: RegisterPayload) => {
      setIsAuthLoading(true);
      try {
        const normalizedFullName = fullName?.trim() ?? '';
        const [firstName, ...rest] = normalizedFullName.split(' ').filter(Boolean);
        const lastName = rest.length > 0 ? rest.join(' ') : null;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              fullName: normalizedFullName || null,
              firstName: firstName ?? null,
              lastName,
            },
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        applySession(data.session ?? null);
        return { emailConfirmationRequired: !data.session };
      } finally {
        setIsAuthLoading(false);
      }
    },
    [applySession],
  );

  const signOut = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }

      applySession(null);
    } finally {
      setIsAuthLoading(false);
    }
  }, [applySession]);

  const requestPasswordReset = useCallback(
    async ({ email }: PasswordResetPayload) => {
      setIsAuthLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) {
          throw new Error(error.message);
        }
      } finally {
        setIsAuthLoading(false);
      }
    },
    [],
  );

  const refreshSession = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        throw new Error(error.message);
      }

      applySession(data.session ?? null);
    } finally {
      setIsAuthLoading(false);
    }
  }, [applySession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isAuthLoading,
      user,
      signIn,
      signOut,
      register,
      requestPasswordReset,
      refreshSession,
    }),
    [
      isAuthenticated,
      isAuthLoading,
      register,
      refreshSession,
      requestPasswordReset,
      signIn,
      signOut,
      user,
    ],
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
