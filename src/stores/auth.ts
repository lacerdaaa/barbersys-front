import { create } from "zustand";
import { isAxiosError } from "axios";
import type { User } from "../models/user";
import {
  getProfile as getProfileRequest,
  login as loginRequest,
  register as registerRequest,
  type RegisterPayload,
} from "../api/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  getProfile: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message ?? data?.error ?? "Não foi possível completar a operação.";
  }
  return "Algo deu errado. Tente novamente.";
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem("token"),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await loginRequest({ email, password });
      localStorage.setItem("token", token);
      set({ user, token, isLoading: false });
    } catch (error) {
      localStorage.removeItem("token");
      set({ error: getErrorMessage(error), isLoading: false, token: null });
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await registerRequest(payload);
      const { token, user } = await loginRequest({ email: payload.email, password: payload.password });
      localStorage.setItem("token", token);
      set({ user, token, isLoading: false });
    } catch (error) {
      localStorage.removeItem("token");
      set({ error: getErrorMessage(error), isLoading: false, token: null });
    }
  },

  getProfile: async () => {
    const token = get().token ?? localStorage.getItem("token");
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const data = await getProfileRequest();
      set({ user: data, token, isLoading: false });
    } catch (error) {
      localStorage.removeItem("token");
      set({ user: null, token: null, isLoading: false, error: getErrorMessage(error) });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));
