import type { Booking } from "./booking";

export interface Service {
  id: string;
  barbershopId: string;
  name: string;
  price?: number;
  duration?: number;
  createdAt?: string;
  updatedAt?: string;
  bookings?: Booking[];
}