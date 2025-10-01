import { api } from "./client";
import type { Service } from "../models/service";

export interface ServicePayload {
  barbershopId: string;
  name: string;
  price?: number;
  duration?: number;
}

export const listServices = async () => {
  const { data } = await api.get<Service[]>("/services");
  return data;
};

export const createService = async (payload: ServicePayload) => {
  const { data } = await api.post<Service>("/services", payload);
  return data;
};

export const updateService = async (serviceId: string, payload: Partial<ServicePayload>) => {
  const { data } = await api.put<Service>(`/services/${serviceId}`, payload);
  return data;
};

export const deleteService = async (serviceId: string) => {
  await api.delete(`/services/${serviceId}`);
};
