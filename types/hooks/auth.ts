import type { ReactNode } from 'react';

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cuil: string;
  companyName: string;
  companyDescription?: string;
};

export type CredentialsPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  fullName?: string;
};

export type PasswordResetPayload = {
  email: string;
};

export type AuthContextValue = {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  user: AuthUser | null;
  signIn: (credentials: CredentialsPayload) => Promise<void>;
  signOut: () => void;
  register: (payload: RegisterPayload) => Promise<void>;
  requestPasswordReset: (payload: PasswordResetPayload) => Promise<void>;
};

export type AuthProviderProps = {
  children: ReactNode;
};
