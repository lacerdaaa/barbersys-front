import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../stores/auth";
import { Role } from "../models/user";
import { useBookingStore } from "../stores/booking";
import { updateBookingStatus } from "../api/bookings";
import { useNavigate } from "react-router-dom";

type Section = 'appointments' | 'agenda';

const BarberDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const bookings = useBookingStore((s) => s.bookings);
  const fetchBookings = useBookingStore((s) => s.fetchBookings);
  const bookingsLoading = useBookingStore((s) => s.isLoading);

  const [activeSection, setActiveSection] = useState<Section>('appointments');

  useEffect(() => {
    if (user?.role === Role.BARBER) {
      fetchBookings();
    }
  }, [user, fetchBookings]);

  const upcoming = useMemo(() => bookings.filter(b => new Date(b.date).getTime() >= Date.now()), [bookings]);
  const past = useMemo(() => bookings.filter(b => new Date(b.date).getTime() < Date.now()), [bookings]);

  const groupedByDay = useMemo(() => {
    const map = new Map<string, typeof bookings>();
    for (const b of upcoming) {
      const key = new Date(b.date).toISOString().slice(0,10);
      const arr = map.get(key) ?? [];
      arr.push(b);
      map.set(key, arr);
    }
    // Sort by day key
    return Array.from(map.entries()).sort(([a],[b]) => a.localeCompare(b));
  }, [upcoming]);

  const handleBookingStatus = async (bookingId: string, status: 'PENDING'|'CONFIRMED'|'CANCELED') => {
    await updateBookingStatus(bookingId, { status });
    await fetchBookings();
  };

  if (isAuthLoading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (user?.role !== Role.BARBER) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-gray-900">Acesso restrito</h1>
        <p className="text-gray-600">Apenas barbeiros podem acessar este painel.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel do Barbeiro</h1>
            <p className="text-sm text-gray-600">Gerencie seus atendimentos e agenda.</p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => { logout(); navigate("/"); }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-6 grid grid-cols-1 md:grid-cols-5 gap-6">
        <aside className="md:col-span-1 bg-white border border-gray-200 rounded-xl p-3">
          <nav className="space-y-1">
            <SidebarItem label="Atendimentos" active={activeSection==='appointments'} onClick={()=>setActiveSection('appointments')} />
            <SidebarItem label="Agenda" active={activeSection==='agenda'} onClick={()=>setActiveSection('agenda')} />
          </nav>
        </aside>

        <main className="md:col-span-4 space-y-10">
          {activeSection==='appointments' && (
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Seus atendimentos</h2>
              <p className="text-sm text-gray-600 mb-4">Confirme, cancele ou visualize detalhes.</p>
              {bookingsLoading ? (
                <div className="py-6 text-sm text-gray-500">Carregando...</div>
              ) : bookings.length === 0 ? (
                <div className="py-6 text-sm text-gray-500">Nenhum atendimento encontrado.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="px-2 py-2">Data</th>
                        <th className="px-2 py-2">Serviço</th>
                        <th className="px-2 py-2">Barbearia</th>
                        <th className="px-2 py-2">Status</th>
                        <th className="px-2 py-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id} className="border-t">
                          <td className="px-2 py-2">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(b.date))}</td>
                          <td className="px-2 py-2">{b.service?.name ?? ''}</td>
                          <td className="px-2 py-2">{b.barbershop?.name ?? ''}</td>
                          <td className="px-2 py-2">{b.status}</td>
                          <td className="px-2 py-2 space-x-2">
                            <button onClick={() => handleBookingStatus(b.id, 'CONFIRMED')} className="text-xs rounded bg-green-600 text-white px-2 py-1">Confirmar</button>
                            <button onClick={() => handleBookingStatus(b.id, 'CANCELED')} className="text-xs rounded bg-red-600 text-white px-2 py-1">Cancelar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeSection==='agenda' && (
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Agenda</h2>
              <p className="text-sm text-gray-600 mb-4">Próximos dias com seus horários marcados.</p>
              {groupedByDay.length === 0 ? (
                <div className="py-6 text-sm text-gray-500">Sem compromissos futuros.</div>
              ) : (
                <div className="space-y-5">
                  {groupedByDay.map(([day, items]) => (
                    <div key={day} className="border rounded-lg">
                      <div className="px-4 py-2 bg-gray-50 text-sm font-semibold text-gray-700">{formatDay(day)}</div>
                      <ul className="divide-y">
                        {items.map((b) => (
                          <li key={b.id} className="px-4 py-3 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <span className="text-gray-700 w-20">{new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(b.date))}</span>
                              <span className="text-gray-900 font-medium">{b.service?.name ?? ''}</span>
                            </div>
                            <span className="text-xs rounded-full bg-gray-100 text-gray-700 px-2 py-1">{b.status}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ label, active, onClick }: { label: string; active?: boolean; onClick?: ()=>void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
  >
    {label}
  </button>
);

const formatDay = (isoDay: string) => {
  const d = new Date(isoDay + 'T00:00:00');
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' }).format(d);
}

export default BarberDashboard;

