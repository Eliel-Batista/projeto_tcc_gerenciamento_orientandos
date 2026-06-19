import { create } from 'zustand';
import { authService } from '@/services/authService';
import { User, RegisterRequest } from '@/types/index';
import { api } from '@/lib/axios';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => void;
  initializeFromStorage: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.login(email, password);
      const user: User = {
        id: response.userId,
        email: response.email,
        fullName: response.fullName,
        profile: response.profile,
      };

      // Store token and user in localStorage
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(user));

      // Set token in axios
      api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;

      set({
        isAuthenticated: true,
        user,
        token: response.token,
        loading: false,
      });

      return user;
    } catch (error: any) {
      const errorMessage =
        error.response?.status === 401
          ? 'Email ou senha incorretos'
          : error.response?.status === 400
            ? 'Campos inválidos'
            : error.message || 'Erro ao fazer login';

      set({
        loading: false,
        error: errorMessage,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.register(data);
      const user: User = {
        id: response.userId,
        email: response.email,
        fullName: response.fullName,
        profile: response.profile,
      };

      // Store token and user in localStorage
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(user));

      // Set token in axios
      api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;

      set({
        isAuthenticated: true,
        user,
        token: response.token,
        loading: false,
      });

      return user;
    } catch (error: any) {
      const errorMessage =
        error.response?.status === 409
          ? 'Email já cadastrado'
          : error.response?.status === 400
            ? error.response?.data?.message || 'Dados inválidos'
            : error.message || 'Erro ao fazer registro';

      set({
        loading: false,
        error: errorMessage,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    set({
      isAuthenticated: false,
      user: null,
      token: null,
      error: null,
    });
  },

  initializeFromStorage: () => {
    const token = localStorage.getItem('authToken');
    const userJson = localStorage.getItem('user');

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({
          isAuthenticated: true,
          user,
          token,
        });
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        set({
          isAuthenticated: false,
          user: null,
          token: null,
        });
      }
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
