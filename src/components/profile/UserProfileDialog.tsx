import { useEffect } from "react";
import { Dialog } from "radix-ui";
import { Calendar, Mail, ShieldCheck, User, Clock } from "lucide-react";
import { useAuthStore } from "../../stores/auth";
import { useBookingStore } from "../../stores/booking";
import { Role } from "../../models/user";

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-green-100 text-green-700",
  CANCELED: "bg-red-100 text-red-600",
};

const UserProfileDialog = ({ open, onOpenChange }: UserProfileDialogProps) => {
  const user = useAuthStore((state) => state.user);
  const bookings = useBookingStore((state) => state.bookings);
  const fetchBookings = useBookingStore((state) => state.fetchBookings);
  const bookingsLoading = useBookingStore((state) => state.isLoading);
  const bookingsError = useBookingStore((state) => state.error);
  const clearBookingsError = useBookingStore((state) => state.clearError);

  useEffect(() => {
    if (open && user?.role === Role.CLIENT) {
      fetchBookings();
    }

    if (!open) {
      clearBookingsError();
    }
  }, [open, user, fetchBookings, clearBookingsError]);

  if (!user) {
    return null;
  }

  const formatDateTime = (date: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(date));
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-50">
          <div className="p-6 border-b border-gray-100">
            <Dialog.Title className="text-2xl font-semibold text-gray-900">Meu perfil</Dialog.Title>
            <p className="text-sm text-gray-500 mt-1">
              Veja suas informações básicas e seus agendamentos.
            </p>
          </div>

          <div className="p-6 space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Informações pessoais
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{user.name}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <ShieldCheck className="w-4 h-4 text-gray-400" />
                  <span>
                    {user.role === Role.CLIENT && "Cliente"}
                    {user.role === Role.BARBER && "Barbeiro"}
                    {user.role === Role.OWNER && "Proprietário"}
                  </span>
                </div>
              </div>
            </section>

            {user.role === Role.CLIENT && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Meus agendamentos
                  </h3>
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>

                {bookingsError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {bookingsError}
                  </div>
                )}

                {bookingsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-500 border-t-transparent" />
                  </div>
                ) : bookings.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Você ainda não possui agendamentos ativos.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {bookings.map((booking) => {
                      const statusStyle = statusStyles[booking.status] ?? "bg-gray-100 text-gray-600";
                      return (
                        <li key={booking.id} className="rounded-lg border border-gray-200 p-4">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-gray-900">
                              {booking.service?.name ?? "Serviço"}
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyle}`}>
                              {booking.status === "PENDING" && "Pendente"}
                              {booking.status === "CONFIRMED" && "Confirmado"}
                              {booking.status === "CANCELED" && "Cancelado"}
                            </span>
                          </div>
                          <div className="mt-3 space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>{formatDateTime(booking.date)}</span>
                            </div>
                            {booking.service?.duration && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>Duração: {booking.service.duration} min</span>
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 flex justify-end">
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Fechar
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default UserProfileDialog;
