declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_SUPABASE_URL?: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
      EXPO_PUBLIC_SUPABASE_AUTH_REDIRECT_URL?: string;
      EXPO_PUBLIC_SUPABASE_AUTH_REDIRECT_URL_WEB?: string;
      EXPO_PUBLIC_SUPABASE_PASSWORD_RESET_REDIRECT_URL?: string;
      EXPO_PUBLIC_SUPABASE_PASSWORD_RESET_REDIRECT_URL_WEB?: string;
    }
  }
}

export {};
