import { api } from "./client";

export interface SimpleBarber {
  id: string;
  name: string;
  email: string;
}

export const listServiceBarbers = async (serviceId: string, barbershopId: string) => {
  const { data } = await api.get<SimpleBarber[]>(`/services/${serviceId}/barbers`, {
    params: { barbershopId },
  });
  return data;
};

