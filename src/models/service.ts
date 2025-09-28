import type { Booking } from "./booking";

export interface Service {
  id: string;
  barbershopId: string;
  name: string;
  price?: number;
  duration?: number;
  createdAt?: Date;
  updatedAt?: Date;
  bookings?: Booking[];
}