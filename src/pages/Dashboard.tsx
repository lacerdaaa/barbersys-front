import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../stores/auth";
import { useNavigate } from "react-router-dom";
import { Role } from "../models/user";
import { useBarbershopStore } from "../stores/barbershop";
import { useBookingStore } from "../stores/booking";
import { createService, deleteService, updateService } from "../api/services";
import type { Service } from "../models/service";
import { updateBookingStatus } from "../api/bookings";
import { Dialog } from "radix-ui";

const Dashboard = () => {
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const currentShop = useBarbershopStore((s) => s.currentBarbershop);
  const fetchMyBarbershop = useBarbershopStore((s) => s.fetchMyBarbershop);
  const addBarbershop = useBarbershopStore((s) => s.addBarbershop);
  const updateBarbershop = useBarbershopStore((s) => s.updateBarbershop);
  const shopLoading = useBarbershopStore((s) => s.isLoading);
  const shopError = useBarbershopStore((s) => s.error);

  const bookings = useBookingStore((s) => s.bookings);
  const fetchBookings = useBookingStore((s) => s.fetchBookings);
  const bookingsLoading = useBookingStore((s) => s.isLoading);

  const [form, setForm] = useState({ name: "", address: "", phone: "", description: "" });
  const [serviceForm, setServiceForm] = useState<{ name: string; price: string; duration: string; barberIds: string[] }>({ name: "", price: "", duration: "", barberIds: [] });
  const [uiError, setUiError] = useState<string | null>(null);
  const [savingServiceId, setSavingServiceId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'bookings'|'barbershop'|'services'|'barbers'>('bookings');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteDays, setInviteDays] = useState("7");
  const createInvite = useBarbershopStore((s)=> s.createInvite);

  const isOwner = user?.role === Role.OWNER;

  useEffect(() => {
    if (!isOwner) return;
    fetchMyBarbershop();
    fetchBookings();
  }, [isOwner, fetchMyBarbershop, fetchBookings]);

  useEffect(() => {
    if (currentShop) {
      setForm({
        name: currentShop.name ?? "",
        address: currentShop.address ?? "",
        phone: currentShop.phone ?? "",
        description: (currentShop as any).description ?? "",
      });
    }
  }, [currentShop]);

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setUiError(null);
    if (!form.name || !form.address) {
      setUiError("Informe pelo menos nome e endereço.");
      return;
    }
    await addBarbershop({ name: form.name, address: form.address, phone: form.phone, description: form.description });
  };

  const handleUpdateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShop) return;
    await updateBarbershop(currentShop.id, { name: form.name, address: form.address, phone: form.phone, description: form.description });
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setUiError(null);
    if (!currentShop) return;
    if (!serviceForm.name) {
      setUiError("Informe o nome do serviço.");
      return;
    }
    const price = serviceForm.price ? Number(serviceForm.price) : undefined;
    const duration = serviceForm.duration ? Number(serviceForm.duration) : undefined;
    await createService({ barbershopId: currentShop.id, name: serviceForm.name, price, duration, barberIds: serviceForm.barberIds });
    await fetchMyBarbershop();
    setServiceForm({ name: "", price: "", duration: "", barberIds: [] });
  };

  const handleUpdateService = async (service: Service) => {
    setSavingServiceId(service.id);
    try {
      await updateService(service.id, { name: service.name, price: service.price, duration: service.duration, barbershopId: currentShop?.id || "" });
      await fetchMyBarbershop();
    } finally {
      setSavingServiceId(null);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    setSavingServiceId(serviceId);
    try {
      await deleteService(serviceId);
      await fetchMyBarbershop();
    } finally {
      setSavingServiceId(null);
    }
  };

  const handleBookingStatus = async (bookingId: string, status: "PENDING" | "CONFIRMED" | "CANCELED") => {
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

  if (!isOwner) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-gray-900">Acesso restrito</h1>
        <p className="text-gray-600">Apenas proprietários podem acessar este painel.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel da Barbearia</h1>
            <p className="text-sm text-gray-600">Gerencie agendamentos, serviços e dados da sua barbearia.</p>
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
            <SidebarItem label="Agendamentos" active={activeSection==='bookings'} onClick={()=>setActiveSection('bookings')} />
            <SidebarItem label="Barbearia" active={activeSection==='barbershop'} onClick={()=>setActiveSection('barbershop')} />
            <SidebarItem label="Serviços" active={activeSection==='services'} onClick={()=>setActiveSection('services')} />
            <SidebarItem label="Barbeiros" active={activeSection==='barbers'} onClick={()=>setActiveSection('barbers')} />
          </nav>
        </aside>

        <main className="md:col-span-4 space-y-10">
          {!currentShop ? (
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Cadastrar barbearia</h2>
            <p className="text-sm text-gray-600 mb-4">Crie sua barbearia para começar a receber agendamentos.</p>
            {uiError && <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{uiError}</div>}
            {shopError && <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{shopError}</div>}
            <form onSubmit={handleCreateShop} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600">Nome</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" required />
              </div>
              <div>
                <label className="text-xs text-gray-600">Telefone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-gray-600">Endereço</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" required />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-gray-600">Descrição</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" rows={3} />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button disabled={shopLoading} className="rounded-lg bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700 disabled:opacity-60">Criar barbearia</button>
              </div>
            </form>
          </section>
        ) : (
          <>
            {activeSection==='bookings' && (
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Agendamentos</h2>
              <p className="text-sm text-gray-600 mb-4">Veja e gerencie os agendamentos da sua barbearia.</p>
              {bookingsLoading ? (
                <div className="py-6 text-sm text-gray-500">Carregando agendamentos...</div>
              ) : bookings.length === 0 ? (
                <div className="py-6 text-sm text-gray-500">Nenhum agendamento ainda.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="px-2 py-2">Data</th>
                        <th className="px-2 py-2">Serviço</th>
                        <th className="px-2 py-2">Cliente</th>
                        <th className="px-2 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id} className="border-t">
                          <td className="px-2 py-2">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(b.date))}</td>
                          <td className="px-2 py-2">{b.service?.name ?? ""}</td>
                          <td className="px-2 py-2">{b.client?.name ?? ""}</td>
                          <td className="px-2 py-2">{b.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
            )}

            {activeSection==='barbershop' && (
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Dados da barbearia</h2>
              <form onSubmit={handleUpdateShop} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600">Nome</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Telefone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-600">Endereço</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-600">Descrição</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" rows={3} />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button className="rounded-lg bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700 disabled:opacity-60" disabled={shopLoading}>Salvar alterações</button>
                </div>
              </form>
            </section>
            )}

            {activeSection==='services' && (
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Serviços</h2>
              <form onSubmit={handleCreateService} className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-600">Nome do serviço</label>
                  <input value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="Corte masculino" />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Preço (R$)</label>
                  <input value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" inputMode="decimal" />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Duração (min)</label>
                  <input value={serviceForm.duration} onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" inputMode="numeric" />
                </div>
                <div className="md:col-span-4">
                  <label className="text-xs text-gray-600">Barbeiros que oferecem este serviço</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(currentShop.barbers ?? []).map((b)=>{
                      const checked = serviceForm.barberIds.includes(b.id);
                      return (
                        <label key={b.id} className={`text-xs px-2 py-1 rounded border cursor-pointer ${checked ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e)=>{
                              setServiceForm((prev)=> ({
                                ...prev,
                                barberIds: e.target.checked
                                  ? [...prev.barberIds, b.id]
                                  : prev.barberIds.filter(id=>id!==b.id)
                              }));
                            }}
                            className="mr-1"
                          />
                          {b.name}
                        </label>
                      );
                    })}
                    {(currentShop.barbers ?? []).length === 0 && (
                      <div className="text-xs text-gray-500">Você ainda não tem barbeiros cadastrados.</div>
                    )}
                  </div>
                </div>
                <div className="md:col-span-4 flex justify-end">
                  <button className="rounded-lg bg-green-600 text-white px-4 py-2 font-semibold hover:bg-green-700">Adicionar serviço</button>
                </div>
              </form>

              <div className="mt-4 divide-y">
                {(currentShop.services ?? []).map((s) => (
                  <ServiceRow key={s.id} service={s} onSave={handleUpdateService} onDelete={handleDeleteService} savingId={savingServiceId} />
                ))}
                {(currentShop.services ?? []).length === 0 && (
                  <div className="text-sm text-gray-500 py-4">Nenhum serviço cadastrado ainda.</div>
                )}
              </div>
            </section>
            )}

            {activeSection==='barbers' && (
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Barbeiros</h2>
                <Dialog.Root open={inviteOpen} onOpenChange={setInviteOpen}>
                  <Dialog.Trigger asChild>
                    <button className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700">Criar convite</button>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-sm" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl p-6">
                      <Dialog.Title className="text-lg font-semibold text-gray-900">Convite para barbeiro</Dialog.Title>
                      <p className="text-sm text-gray-600 mt-1">Defina a validade do convite em dias.</p>
                      <form
                        onSubmit={async (e)=>{ e.preventDefault(); const days = Number(inviteDays)||7; const inv = await createInvite({ daysValid: days }); if (inv) { setInviteOpen(false); alert(`Convite criado: ${inv.code}`);} }}
                        className="mt-4 space-y-3"
                      >
                        <div>
                          <label className="text-xs text-gray-600">Validade (dias)</label>
                          <input value={inviteDays} onChange={(e)=>setInviteDays(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" inputMode="numeric" />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Dialog.Close asChild>
                            <button type="button" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                          </Dialog.Close>
                          <button type="submit" className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700">Gerar convite</button>
                        </div>
                      </form>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
              </div>

              <div className="mt-4 divide-y">
                {(currentShop.barbers ?? []).map((b)=> (
                  <div key={b.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{b.name}</div>
                      <div className="text-xs text-gray-600">{b.email}</div>
                    </div>
                    <span className="text-xs rounded-full bg-gray-100 text-gray-700 px-2 py-1">{b.role}</span>
                  </div>
                ))}
                {(currentShop.barbers ?? []).length === 0 && (
                  <div className="text-sm text-gray-500 py-4">Nenhum barbeiro no time ainda.</div>
                )}
              </div>
            </section>
            )}
          </>
        )}
        </main>
      </div>
    </div>
  );
};

const ServiceRow = ({ service, onSave, onDelete, savingId }: { service: Service; onSave: (s: Service) => void; onDelete: (id: string) => void; savingId: string | null }) => {
  const [draft, setDraft] = useState<Service>({ ...service });
  const isSaving = savingId === service.id;
  return (
    <div className="py-3 flex items-center gap-3">
      <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <input value={draft.price ?? 0} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <input value={draft.duration ?? 0} onChange={(e) => setDraft({ ...draft, duration: Number(e.target.value) })} className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <button onClick={() => onSave(draft)} disabled={isSaving} className="text-xs rounded bg-blue-600 text-white px-3 py-2 disabled:opacity-60">Salvar</button>
      <button onClick={() => onDelete(service.id)} disabled={isSaving} className="text-xs rounded bg-red-600 text-white px-3 py-2 disabled:opacity-60">Excluir</button>
    </div>
  );
};

export default Dashboard;

const SidebarItem = ({ label, active, onClick }: { label: string; active?: boolean; onClick?: ()=>void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
  >
    {label}
  </button>
);
