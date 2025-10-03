import type { ReactNode } from 'react';

export type AuthUser = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  cuil?: string | null;
  companyName?: string | null;
  companyDescription?: string | null;
  companyCode?: string | null;
};

export type CredentialsPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  fullName?: string;
  companyCode: string;
  companyName?: string;
  countryCode?: string;
  defaultTimeZone?: string;
  industry?: string;
  billingEmail?: string;
  companyDescription?: string;
};

export type PasswordResetPayload = {
  email: string;
};

export type AuthContextValue = {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  user: AuthUser | null;
  signIn: (credentials: CredentialsPayload) => Promise<void>;
  signOut: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<{ emailConfirmationRequired: boolean }>;
  requestPasswordReset: (payload: PasswordResetPayload) => Promise<void>;
  refreshSession: () => Promise<void>;
};

export type AuthProviderProps = {
  children: ReactNode;
};
