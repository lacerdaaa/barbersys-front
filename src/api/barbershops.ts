import { api } from "./client";
import type { Barbershop } from "../models/barbershop";
import type { Invite } from "../models/invite";

export interface CreateBarbershopPayload {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
}

export interface CreateInvitePayload {
  barbershopId: string;
  expiresAt?: string;
}

export const listBarberShops = async () => {
  const { data } = await api.get<Barbershop[]>("/barber-shops");
  return data;
};

export const getBarberShop = async (barbershopId: string) => {
  const { data } = await api.get<Barbershop>(`/barber-shop/${barbershopId}`);
  return data;
};

export const createBarberShop = async (payload: CreateBarbershopPayload) => {
  const { data } = await api.post<Barbershop>("/barber-shop", payload);
  return data;
};

export const createBarberShopInvite = async (payload: CreateInvitePayload) => {
  const { data } = await api.post<Invite>("/barber-shop/invite", payload);
  return data;
};
