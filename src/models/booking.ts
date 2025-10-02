import type { Service } from "./service";

export interface Booking {
  id: string;
  clientId: string;
  barberId: string;
  barbershopId: string;
  date: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  service?: Service;
  barbershop?: {
    id: string;
    name: string;
  };
  client?: {
    id: string;
    name: string;
    email: string;
  };
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELED = "CANCELED",
}
