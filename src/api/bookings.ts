import { api } from "./client";
import type { Booking, BookingStatus } from "../models/booking";

export interface CreateBookingPayload {
  serviceId: string;
  date: string;
  barberId?: string;
}

export interface UpdateBookingStatusPayload {
  status: BookingStatus;
}

export const createBooking = async (payload: CreateBookingPayload) => {
  const { data } = await api.post<Booking>("/bookings", payload);
  return data;
};

export const listBookings = async () => {
  const { data } = await api.get<Booking[]>("/bookings");
  return data;
};

export const updateBookingStatus = async (bookingId: string, payload: UpdateBookingStatusPayload) => {
  const { data } = await api.patch<Booking>(`/bookings/${bookingId}`, payload);
  return data;
};
