export interface Booking {
  id: string;
  clientId: string;
  barberId: string;
  barbershopId: string;
  date: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELED = "CANCELED",
}