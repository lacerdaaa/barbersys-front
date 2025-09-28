import type { Invite } from "./invite";
import type { Service } from "./service";

export interface Barbershop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  ownerId: string;
  invites: Invite[];
  createdAt: Date;
  updatedAt: Date;
  services: Service[];
};