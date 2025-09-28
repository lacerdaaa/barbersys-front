export interface Invite {
  id: string;
  code: string;
  barbershopId: string,
  expiresAt: string,
  createdAt: string,
  expired: boolean,
}