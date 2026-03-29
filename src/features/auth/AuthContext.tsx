/**
 * CONTEXT API + useContext + useReducer
 *
 * Context API: Provides a way to share state across the component tree
 * without prop drilling. Ideal for global cross-cutting concerns like
 * authentication, themes, and language settings.
 *
 * useReducer: Like useState but for complex state transitions. Takes a
 * reducer function (state, action) => newState — same pattern as Redux
 * but local to this context. Great when next state depends on previous.
 */
import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { user: null, isAuthenticated: false };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for demo
const MOCK_USERS: User[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@devboard.io', avatar: 'AJ', role: 'admin' },
  { id: '2', name: 'Sam Rivera', email: 'sam@devboard.io', avatar: 'SR', role: 'developer' },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
  });

  const login = (email: string, _password: string): boolean => {
    const user = MOCK_USERS.find((u) => u.email === email);
    if (user) {
      dispatch({ type: 'LOGIN', payload: user });
      return true;
    }
    return false;
  };

  const logout = () => dispatch({ type: 'LOGOUT' });

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth — Custom Hook
 *
 * Custom hooks encapsulate reusable stateful logic. This hook wraps
 * useContext so consumers never import AuthContext directly — they just
 * call useAuth(). It also provides a clear error if used outside the provider.
 */
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
