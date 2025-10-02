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
  type ListBarbershopsParams,
} from "../api/barbershops";

interface BarbershopState {
  barbershops: Barbershop[];
  currentBarbershop: Barbershop | null;
  isLoading: boolean;
  error: string | null;
  page: number;
  limit: number;
  params: ListBarbershopsParams;
  total: number;
  fetchBarbershops: (params?: ListBarbershopsParams) => Promise<void>;
  setPage: (page: number) => void;
  fetchBarbershop: (barbershopId: string) => Promise<Barbershop | null>;
  addBarbershop: (payload: CreateBarbershopPayload) => Promise<Barbershop | null>;
  createInvite: (payload: CreateInvitePayload) => Promise<Invite | null>;
  clearError: () => void;
}

const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message ?? data?.error ?? "Não foi possível carregar os dados.";
  }
  return "Algo deu errado. Tente novamente.";
};

export const useBarbershopStore = create<BarbershopState>((set, get) => ({
  barbershops: [],
  currentBarbershop: null,
  isLoading: false,
  error: null,
  page: 1,
  limit: 9,
  params: {},
  total: 0,

  fetchBarbershops: async (params) => {
    const currentState = get();
    const mergedParams: ListBarbershopsParams = {
      ...currentState.params,
      ...params,
      page: params?.page ?? currentState.page,
      limit: params?.limit ?? currentState.limit,
    };

    set({ isLoading: true, error: null, params: mergedParams, page: mergedParams.page ?? 1, limit: mergedParams.limit ?? currentState.limit });
    try {
      const { data, total } = await listBarberShops(mergedParams);
      set({ barbershops: data, total, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false, total: 0, barbershops: [] });
    }
  },

  setPage: (page) => {
    const { fetchBarbershops, limit, params } = get();
    fetchBarbershops({ ...params, page, limit });
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
      const { barbershops, total } = get();
      set({
        barbershops: [barbershop, ...barbershops],
        currentBarbershop: barbershop,
        isLoading: false,
        total: total + 1,
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
