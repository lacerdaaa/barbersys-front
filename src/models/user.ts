import type { Booking } from "./booking";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  barberShopId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  booking?: Booking[];
}

export enum Role {
  CLIENT = 'CLIENT',
  BARBER = 'BARBER',
  OWNER = 'OWNER',
}

