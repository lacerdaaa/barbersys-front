import { api } from "./client";
import type { Role } from "../models/user";
import type { User } from "../models/user";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  inviteCode?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  user: User;
  message?: string;
  token?: string;
}

export const login = async (payload: LoginPayload) => {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
};

export const register = async (payload: RegisterPayload) => {
  const { data } = await api.post<RegisterResponse>("/auth/register", payload);
  return data;
};

export const getProfile = async () => {
  const { data } = await api.get<User>("/users/me");
  return data;
};
