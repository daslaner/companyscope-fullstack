import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, type ReactNode } from 'react';
import { authApi } from '../lib/api';
import type { AuthUser, LoginInput, RegistrationInput } from '../shared/auth';

const sessionQueryKey = ['auth', 'session'] as const;

type AuthStatus = 'checking' | 'authenticated' | 'anonymous' | 'error';

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  error: Error | null;
  busy: boolean;
  login(input: LoginInput): Promise<AuthUser>;
  register(input: RegistrationInput): Promise<AuthUser>;
  logout(): Promise<void>;
  retry(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeError(cause: unknown): Error {
  return cause instanceof Error ? cause : new Error('Authentication request failed.');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: sessionQueryKey,
    queryFn: authApi.getSession,
    staleTime: 30_000,
    retry: false,
  });

  const refreshSession = async () => {
    await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
  };

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: refreshSession,
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: refreshSession,
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
  });

  const session = sessionQuery.data;
  const status: AuthStatus = sessionQuery.isPending
    ? 'checking'
    : sessionQuery.isError
      ? 'error'
      : (session?.status ?? 'checking');

  const error = sessionQuery.isError
    ? normalizeError(sessionQuery.error)
    : loginMutation.error
      ? normalizeError(loginMutation.error)
      : registerMutation.error
        ? normalizeError(registerMutation.error)
        : logoutMutation.error
          ? normalizeError(logoutMutation.error)
          : null;

  const value: AuthContextValue = {
    status,
    user: session?.status === 'authenticated' ? session.user : null,
    error,
    busy: loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    retry: async () => {
      await sessionQuery.refetch();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}

export function useOptionalAuth(): AuthContextValue | null {
  return useContext(AuthContext);
}
