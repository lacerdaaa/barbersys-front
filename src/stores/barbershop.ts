import { create } from "zustand";
import { isAxiosError } from "axios";
import type { Barbershop } from "../models/barbershop";
import type { Invite } from "../models/invite";
import {
  createBarberShop,
  createBarberShopInvite,
  getBarberShop,
  listBarberShops,
  type CreateBarbershopPayload,
  type CreateInvitePayload,
} from "../api/barbershops";

interface BarbershopState {
  barbershops: Barbershop[];
  currentBarbershop: Barbershop | null;
  isLoading: boolean;
  error: string | null;
  fetchBarbershops: () => Promise<void>;
  fetchBarbershop: (barbershopId: string) => Promise<Barbershop | null>;
  addBarbershop: (payload: CreateBarbershopPayload) => Promise<Barbershop | null>;
  createInvite: (payload: CreateInvitePayload) => Promise<Invite | null>;
  clearError: () => void;
}

const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? "Não foi possível carregar os dados.";
  }
  return "Algo deu errado. Tente novamente.";
};

export const useBarbershopStore = create<BarbershopState>((set, get) => ({
  barbershops: [],
  currentBarbershop: null,
  isLoading: false,
  error: null,

  fetchBarbershops: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await listBarberShops();
      set({ barbershops: data, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
    }
  },

  fetchBarbershop: async (barbershopId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getBarberShop(barbershopId);
      set({ currentBarbershop: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
      return null;
    }
  },

  addBarbershop: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const barbershop = await createBarberShop(payload);
      set({
        barbershops: [barbershop, ...get().barbershops],
        currentBarbershop: barbershop,
        isLoading: false,
      });
      return barbershop;
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
      return null;
    }
  },

  createInvite: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const invite = await createBarberShopInvite(payload);
      const barbershops = get().barbershops.map((shop) =>
        shop.id === payload.barbershopId
          ? {
              ...shop,
              invites: shop.invites ? [invite, ...shop.invites] : [invite],
            }
          : shop,
      );

      set({ barbershops, isLoading: false });
      return invite;
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));
