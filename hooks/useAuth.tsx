import type { Session, User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

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
  const firstName = toNullableString(metadata.firstName) ?? toNullableString(metadata.first_name);
  const lastName = toNullableString(metadata.lastName) ?? toNullableString(metadata.last_name);
  const fullName = toNullableString(metadata.fullName) ?? toNullableString(metadata.full_name);

  if (firstName && lastName) {
    return { firstName, lastName };
  }

  if (fullName) {
    const [first, ...rest] = fullName.split(' ').filter(Boolean);
    return {
      firstName: first ?? firstName ?? null,
      lastName: rest.length > 0 ? rest.join(' ') : (lastName ?? null),
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
    companyName: toNullableString(metadata.companyName) ?? toNullableString(metadata.company_name),
    companyDescription:
      toNullableString(metadata.companyDescription) ??
      toNullableString(metadata.company_description),
    companyCode: toNullableString(metadata.companyCode) ?? toNullableString(metadata.company_code),
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
    async ({
      email,
      password,
      fullName,
      companyCode,
      companyName,
      countryCode,
      defaultTimeZone,
      industry,
      billingEmail,
      companyDescription,
    }: RegisterPayload) => {
      setIsAuthLoading(true);
      try {
        const normalizedFullName = fullName?.trim() ?? '';
        const [firstName, ...rest] = normalizedFullName.split(' ').filter(Boolean);
        const lastName = rest.length > 0 ? rest.join(' ') : null;

        const authMetadata: Record<string, unknown> = {
          fullName: normalizedFullName || null,
          firstName: firstName ?? null,
          lastName,
        };

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: authMetadata,
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        const userId = data.user?.id;
        if (!userId) {
          throw new Error('No pudimos completar el registro del usuario.');
        }

        const ensureUniqueCompanyCode = async (name: string) => {
          const sanitized = name
            .replace(/[^a-zA-Z0-9]/g, ' ')
            .split(' ')
            .filter(Boolean)
            .map((token) => token.slice(0, 3).toUpperCase())
            .join('');

          const base = (sanitized.length > 0 ? sanitized : 'COMPANY').slice(0, 8);

          for (let attempt = 0; attempt < 6; attempt += 1) {
            const suffix = Math.floor(Math.random() * 9000 + 1000).toString();
            const candidate = `${base}-${suffix}`.toUpperCase();
            const { data: match, error: lookupError } = await supabase
              .from('companies')
              .select('id')
              .eq('company_code', candidate)
              .maybeSingle();

            if (lookupError) {
              throw new Error(lookupError.message);
            }

            if (!match) {
              return candidate;
            }
          }

          throw new Error(
            'No pudimos generar un código único para tu empresa. Intentá nuevamente en unos instantes.',
          );
        };

        let trimmedCompanyCode = companyCode?.trim().toUpperCase() ?? undefined;
        let existingCompany: Record<string, any> | null = null;
        let descriptionFromCompany: string | null = null;

        if (trimmedCompanyCode) {
          const { data: companyMatch, error: companyLookupError } = await supabase
            .from('companies')
            .select('*')
            .eq('company_code', trimmedCompanyCode)
            .maybeSingle();

          if (companyLookupError) {
            throw new Error(companyLookupError.message);
          }

          existingCompany = companyMatch;

          if (existingCompany?.metadata && typeof existingCompany.metadata === 'object') {
            const metadataDescription = (existingCompany.metadata as Record<string, unknown>)
              .description;
            if (typeof metadataDescription === 'string' && metadataDescription.length > 0) {
              descriptionFromCompany = metadataDescription;
            }
          }
        }

        if (!trimmedCompanyCode) {
          if (!companyName || !countryCode || !defaultTimeZone) {
            throw new Error(
              'Para crear una nueva empresa completá el nombre, el país (ISO 3166-1) y el huso horario.',
            );
          }

          trimmedCompanyCode = await ensureUniqueCompanyCode(companyName);
        }

        let targetCompany = existingCompany;

        if (!targetCompany) {
          if (!companyName || !countryCode || !defaultTimeZone) {
            throw new Error(
              'Para crear una nueva empresa completá el nombre, el país (ISO 3166-1) y el huso horario.',
            );
          }

          const companyPayload = {
            name: companyName,
            company_code: trimmedCompanyCode,
            country_code: countryCode.toUpperCase(),
            default_time_zone: defaultTimeZone,
            plan_tier: 'trial',
            industry: industry ?? null,
            billing_email: billingEmail ?? null,
            metadata: companyDescription ? { description: companyDescription } : {},
            created_by: userId,
          };

          const { data: insertedCompany, error: insertError } = await supabase
            .from('companies')
            .insert(companyPayload)
            .select()
            .single();

          if (insertError) {
            throw new Error(insertError.message);
          }

          targetCompany = insertedCompany;
          descriptionFromCompany = companyDescription ?? null;
        }

        if (!targetCompany) {
          throw new Error('No pudimos determinar a qué empresa asociar este usuario.');
        }

        const nowIso = new Date().toISOString();
        const membershipPayload = {
          company_id: targetCompany.id,
          user_id: userId,
          role: existingCompany ? 'employee' : 'admin',
          status: 'active',
          invited_at: nowIso,
          joined_at: nowIso,
        };

        const { error: membershipError } = await supabase
          .from('company_members')
          .upsert(membershipPayload, { onConflict: 'company_id,user_id' });

        if (membershipError) {
          throw new Error(membershipError.message);
        }

        if (targetCompany.metadata && typeof targetCompany.metadata === 'object') {
          const metadataDescription = (targetCompany.metadata as Record<string, unknown>)
            .description;
          if (!descriptionFromCompany && typeof metadataDescription === 'string') {
            descriptionFromCompany = metadataDescription;
          }
        }

        if (targetCompany && data.session) {
          const { error: updateUserError } = await supabase.auth.updateUser({
            data: {
              companyName: targetCompany.name,
              companyDescription: descriptionFromCompany ?? null,
              companyCode: trimmedCompanyCode,
            },
          });

          if (updateUserError) {
            console.warn(
              '[AuthProvider] Failed to update user metadata after signup',
              updateUserError,
            );
          }
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

  const requestPasswordReset = useCallback(async ({ email }: PasswordResetPayload) => {
    setIsAuthLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        throw new Error(error.message);
      }
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

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
