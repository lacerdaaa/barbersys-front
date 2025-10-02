import { create } from "zustand";
import { isAxiosError } from "axios";
import type { Booking } from "../models/booking";
import {
  createBooking,
  listBookings,
  type CreateBookingPayload,
} from "../api/bookings";

interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  fetchBookings: () => Promise<void>;
  addBooking: (payload: CreateBookingPayload) => Promise<Booking | null>;
  clearError: () => void;
}

const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message ?? data?.error ?? "Não foi possível completar a operação.";
  }
  return "Algo deu errado. Tente novamente.";
};

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  isLoading: false,
  error: null,

  fetchBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await listBookings();
      set({ bookings: data, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false, bookings: [] });
    }
  },

  addBooking: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const booking = await createBooking(payload);
      set((state) => ({ bookings: [booking, ...state.bookings], isLoading: false }));
      return booking;
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));
