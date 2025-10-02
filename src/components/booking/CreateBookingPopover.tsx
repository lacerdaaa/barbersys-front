import { useEffect, useMemo, useState } from "react";
import { Popover } from "radix-ui";
import { Calendar, CheckCircle2, Clock, Loader2 } from "lucide-react";
import type { Barbershop } from "../../models/barbershop";
import type { Service } from "../../models/service";
import { useBookingStore } from "../../stores/booking";
import { useAuthStore } from "../../stores/auth";
import { listServiceBarbers, type SimpleBarber } from "../../api/barbers";
import { checkBarberAvailability } from "../../api/availability";

interface CreateBookingPopoverProps {
  barbershop: Barbershop;
  service: Service;
  children: React.ReactNode; // Trigger content
  onRequireAuth?: () => void;
}

const getDefaultDateTimeValue = () => {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);
  return date.toISOString().slice(0, 16);
};

const CreateBookingPopover = ({ barbershop, service, children, onRequireAuth }: CreateBookingPopoverProps) => {
  const token = useAuthStore((s) => s.token);
  const [open, setOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(getDefaultDateTimeValue());
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [barbers, setBarbers] = useState<SimpleBarber[]>([]);
  const [barbersLoading, setBarbersLoading] = useState(false);
  const [selectedBarberId, setSelectedBarberId] = useState<string | "">("");
  const [availability, setAvailability] = useState<null | boolean>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

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
      // Load barbers for this service
      (async () => {
        try {
          setBarbersLoading(true);
          const list = await listServiceBarbers(service.id, barbershop.id);
          setBarbers(list);
          setSelectedBarberId(list[0]?.id ?? "");
        } catch (e) {
          setBarbers([]);
          setSelectedBarberId("");
        } finally {
          setBarbersLoading(false);
        }
      })();
    }
  }, [open, clearError]);

  const serviceDurationMinutes = useMemo(() => service?.duration ?? null, [service?.duration]);

  const handleOpenChange = (next: boolean) => {
    if (next && !token) {
      onRequireAuth?.();
      return; // don't open without auth
    }
    setOpen(next);
  };

  // Check availability whenever inputs change
  useEffect(() => {
    let active = true;
    (async () => {
      setAvailability(null);
      if (!selectedBarberId || !scheduledAt) return;
      try {
        setAvailabilityLoading(true);
        const isoDate = new Date(scheduledAt);
        if (Number.isNaN(isoDate.getTime())) return;
        const { available } = await checkBarberAvailability(selectedBarberId, isoDate.toISOString());
        if (active) setAvailability(available);
      } catch {
        if (active) setAvailability(null);
      } finally {
        if (active) setAvailabilityLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [selectedBarberId, scheduledAt]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    clearError();

    if (!scheduledAt) {
      setLocalError("Informe a data e horário desejados.");
      return;
    }

    if (!selectedBarberId) {
      setLocalError("Selecione um barbeiro.");
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
      barberId: selectedBarberId,
    });

    if (booking) {
      setIsSuccess(true);
      // Auto-close after a short delay to keep flow smooth
      setTimeout(() => setOpen(false), 900);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={8} className="z-[60] w-[320px] rounded-xl bg-white shadow-xl border border-gray-200 p-4">
          <div className="mb-3">
            <div className="text-sm font-semibold text-gray-900">Agendar horário</div>
            <div className="text-xs text-gray-500">
              {service.name} • {barbershop.name}
            </div>
          </div>

          {isSuccess ? (
            <div className="flex flex-col items-center text-center space-y-2 py-2">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <p className="text-sm font-semibold text-gray-900">Agendamento criado!</p>
              <p className="text-xs text-gray-600">Você poderá acompanhar no seu perfil.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Barbeiro</label>
                <select
                  value={selectedBarberId}
                  onChange={(e) => setSelectedBarberId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                  disabled={barbersLoading || barbers.length === 0}
                >
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                  {barbers.length === 0 && <option value="">Nenhum barbeiro disponível</option>}
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor={`booking-datetime-${service.id}`} className="text-xs font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Data e horário
                </label>
                <input
                  id={`booking-datetime-${service.id}`}
                  type="datetime-local"
                  min={getDefaultDateTimeValue()}
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {serviceDurationMinutes && (
                  <p className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Duração estimada: {serviceDurationMinutes} minutos
                  </p>
                )}
              </div>

              {availabilityLoading ? (
                <div className="text-[11px] text-gray-500">Verificando disponibilidade...</div>
              ) : availability === false ? (
                <div className="text-[12px] text-red-600">Horário indisponível para este barbeiro.</div>
              ) : availability === true ? (
                <div className="text-[12px] text-green-600">Horário disponível.</div>
              ) : null}

              {(localError || storeError) && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {localError ?? storeError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !selectedBarberId || availability === false}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
                >
                  {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Confirmar
                </button>
              </div>
            </form>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default CreateBookingPopover;
