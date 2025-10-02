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
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELED = "CANCELED",
}
