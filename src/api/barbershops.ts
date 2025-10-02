import { api } from "./client";
import type { Barbershop } from "../models/barbershop";
import type { Invite } from "../models/invite";

export interface CreateBarbershopPayload {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  description?: string;
}

export interface CreateInvitePayload {
  daysValid: number;
}

export interface ListBarbershopsParams {
  region?: string;
  page?: number;
  limit?: number;
  orderBy?: 'name' | 'distance' | 'createdAt';
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface ListBarbershopsResponse {
  data: Barbershop[];
  total: number;
}

export const listBarberShops = async (params?: ListBarbershopsParams): Promise<ListBarbershopsResponse> => {
  const response = await api.get<Barbershop[]>("/barber-shops", { params });
  const totalHeader = response.headers?.["x-total-count"] ?? response.headers?.["X-Total-Count"];
  const total = Number(totalHeader ?? response.data.length ?? 0);

  return {
    data: response.data,
    total: Number.isFinite(total) ? total : response.data.length,
  };
};

export const getBarberShop = async (barbershopId: string) => {
  const { data } = await api.get<Barbershop>(`/barber-shop/${barbershopId}`);
  return data;
};

export const getMyBarberShop = async () => {
  const { data } = await api.get<Barbershop | null>(`/me/barber-shop`);
  return data;
};

export const createBarberShop = async (payload: CreateBarbershopPayload) => {
  const { data } = await api.post<Barbershop>("/barber-shop", payload);
  return data;
};

export const updateBarberShop = async (barbershopId: string, payload: Partial<CreateBarbershopPayload>) => {
  const { data } = await api.patch<Barbershop>(`/barber-shop/${barbershopId}`, payload);
  return data;
};

export const createBarberShopInvite = async (payload: CreateInvitePayload) => {
  const { data } = await api.post<Invite>("/barber-shop/invite", payload);
  return data;
};
