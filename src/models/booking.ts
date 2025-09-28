export interface Booking {
  id: string;
  clientId: string;
  barberId: string;
  barbershopId: string;
  date: Date;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum BookingStatus {
  PENDING,
  CONFIRMED,
  CANCELED,
}