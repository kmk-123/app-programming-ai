import { create } from 'zustand';
import { User } from '../../domain/entities';
import { authRepository } from '../../data/repositories/authRepository';

function mapFirebaseError(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
    'auth/invalid-email': '올바르지 않은 이메일 형식입니다.',
    'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
    'auth/user-not-found': '존재하지 않는 계정입니다.',
    'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
    'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'auth/too-many-requests': '잠시 후 다시 시도해 주세요.',
  };
  return messages[code] ?? '오류가 발생했습니다. 다시 시도해 주세요.';
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initAuth: () => () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  signUp: async (email, password, displayName) => {
    set({ loading: true, error: null });
    try {
      const user = await authRepository.signUp(email, password, displayName);
      set({ user, loading: false });
    } catch (e: any) {
      set({ error: mapFirebaseError(e.code ?? ''), loading: false });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const user = await authRepository.signIn(email, password);
      set({ user, loading: false });
    } catch (e: any) {
      set({ error: mapFirebaseError(e.code ?? ''), loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    await authRepository.signOut();
    set({ user: null, loading: false });
  },

  initAuth: () => {
    return authRepository.onAuthStateChanged((user) => set({ user }));
  },

  clearError: () => set({ error: null }),
}));
