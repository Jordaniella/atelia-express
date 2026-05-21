import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ApiError, ApiUser, authApi, tokenStorage } from '../lib/api';

interface AuthSession {
  accessToken: string;
}

interface AuthContextType {
  user: ApiUser | null;
  session: AuthSession | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const token = tokenStorage.get();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { user: currentUser } = await authApi.me();
        setUser(currentUser);
        setSession({ accessToken: token });
      } catch {
        tokenStorage.clear();
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    void loadCurrentUser();
  }, []);

  const persistAuth = (token: string, authenticatedUser: ApiUser) => {
    tokenStorage.set(token);
    setSession({ accessToken: token });
    setUser(authenticatedUser);
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { token, user: authenticatedUser } = await authApi.register({ email, password, name });
      persistAuth(token, authenticatedUser);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new ApiError(500, 'Registration failed') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { token, user: authenticatedUser } = await authApi.login({ email, password });
      persistAuth(token, authenticatedUser);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new ApiError(500, 'Login failed') };
    }
  };

  const signOut = async () => {
    tokenStorage.clear();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
