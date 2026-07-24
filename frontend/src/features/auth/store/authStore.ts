// src/features/auth/store/authStore.ts
// Task 1.5.5: Zustand store quản lý auth state, persist qua sessionStorage.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiLogin } from '../../../services/authService';
import { Role, resolveRoles } from '../../../constants/roles';

export interface AuthUser {
  username: string;
  name: string;
  email: string;
  roles: Role[];
  isFirstLogin: boolean;
}

interface LoginResult {
  success: boolean;
  message?: string;
  user?: AuthUser;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  completeFirstLogin: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (username, password) => {
        const { ok, data } = await apiLogin(username, password);

        if (!ok) {
          const message =
            data?.message || data?.title || 'Tên đăng nhập hoặc mật khẩu không đúng!';
          return { success: false, message };
        }

        // Backend mới bọc ApiResponse<T> ({ data: {...} }), backend cũ trả thẳng
        const payload = data?.data ?? data;
        const token = payload?.token;
        if (!token) {
          return { success: false, message: 'Không nhận được token từ server!' };
        }

        // axiosInstance đọc token/refreshToken từ sessionStorage
        sessionStorage.setItem('token', token);
        if (payload?.refreshToken) {
          sessionStorage.setItem('refreshToken', payload.refreshToken);
        }

        const user: AuthUser = {
          username,
          name: payload?.user?.name || payload?.user?.fullName || username,
          email: payload?.user?.email || '',
          roles: resolveRoles(payload),
          isFirstLogin: payload?.user?.isFirstLogin ?? false,
        };

        set({ user, isAuthenticated: true });
        return { success: true, user };
      },

      completeFirstLogin: () => {
        const { user } = get();
        if (user) set({ user: { ...user, isFirstLogin: false } });
      },

      logout: () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
