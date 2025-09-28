import type { Booking } from "./booking";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  barberShopId: string;
  createdAt: Date;
  updatedAt: Date;
  booking: Booking[]
};

export enum Role {
  CLIENT = 'CLIENT',
  BARBER = 'BARBER',
  OWNER = 'OWNER',
};

