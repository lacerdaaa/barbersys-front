import type { Invite } from "./invite";
import type { Service } from "./service";

export interface Barbershop {
  id: string;
  name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  ownerId?: string | null;
  invites?: Invite[];
  createdAt?: string;
  updatedAt?: string;
  services?: Service[];
}