import { User } from 'firebase/auth';

declare module '../context/AuthContext' {
  interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<User>;
    signInWithEmail: (email: string, password: string) => Promise<User>;
    signUpWithEmail: (email: string, password: string, displayName: string) => Promise<User>;
    signOut: () => Promise<void>;
    updateUserProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
    currentUser: User | null;
  }

  export const useAuth: () => AuthContextType;
  export const AuthProvider: React.FC<{ children: React.ReactNode }>;
}
