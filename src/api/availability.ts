import { api } from "./client";

export const checkBarberAvailability = async (barberId: string, date: string) => {
  const { data } = await api.get<{ available: boolean }>(`/bookings/availability`, {
    params: { barberId, date },
  });
  return data;
};

