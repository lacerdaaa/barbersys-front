import { useEffect, useMemo, useState } from "react";
import { Dialog } from "radix-ui";
import { Calendar, CheckCircle2, Clock, Loader2 } from "lucide-react";
import type { Barbershop } from "../../models/barbershop";
import type { Service } from "../../models/service";
import { useBookingStore } from "../../stores/booking";

interface CreateBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barbershop: Barbershop | null;
  service: Service | null;
  onSuccess?: () => void;
}

const getDefaultDateTimeValue = () => {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);
  return date.toISOString().slice(0, 16);
};

const CreateBookingDialog = ({ open, onOpenChange, barbershop, service, onSuccess }: CreateBookingDialogProps) => {
  const [scheduledAt, setScheduledAt] = useState(getDefaultDateTimeValue());
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const addBooking = useBookingStore((state) => state.addBooking);
  const isLoading = useBookingStore((state) => state.isLoading);
  const storeError = useBookingStore((state) => state.error);
  const clearError = useBookingStore((state) => state.clearError);

  useEffect(() => {
    if (open) {
      setScheduledAt(getDefaultDateTimeValue());
      setLocalError(null);
      setIsSuccess(false);
      clearError();
    }
  }, [open, clearError]);

  const serviceDurationMinutes = useMemo(() => service?.duration ?? null, [service?.duration]);

  if (!barbershop || !service) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    clearError();

    if (!scheduledAt) {
      setLocalError("Informe a data e horário desejados.");
      return;
    }

    const isoDate = new Date(scheduledAt);
    if (Number.isNaN(isoDate.getTime())) {
      setLocalError("Data e horário inválidos.");
      return;
    }

    const booking = await addBooking({
      serviceId: service.id,
      barbershopId: barbershop.id,
      date: isoDate.toISOString(),
    });

    if (booking) {
      setIsSuccess(true);
      onSuccess?.();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl">
          <div className="p-6 border-b border-gray-100">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Agendar horário
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 mt-1">
              {service.name} em {barbershop.name}
            </Dialog.Description>
          </div>

          <div className="p-6">
            {isSuccess ? (
              <div className="flex flex-col items-center text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <p className="text-base font-semibold text-gray-900">Agendamento criado!</p>
                <p className="text-sm text-gray-600">
                  Você receberá atualizações quando o status for confirmado.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label htmlFor="booking-datetime" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    Data e horário desejados
                  </label>
                  <input
                    id="booking-datetime"
                    type="datetime-local"
                    min={getDefaultDateTimeValue()}
                    value={scheduledAt}
                    onChange={(event) => setScheduledAt(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {serviceDurationMinutes && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Duração estimada: {serviceDurationMinutes} minutos
                    </p>
                  )}
                </div>

                {(localError || storeError) && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                    {localError ?? storeError}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      disabled={isLoading}
                    >
                      Cancelar
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Confirmar agendamento
                  </button>
                </div>
              </form>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CreateBookingDialog;
