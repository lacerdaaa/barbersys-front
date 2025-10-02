import { Dialog, Select } from "radix-ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Barbershop } from "../models/barbershop";
import {
  Clock,
  Filter,
  LogOut,
  MapPin,
  Menu,
  Navigation,
  Phone,
  Search,
  Star,
  UserCircle2,
  Users,
  X,
} from "lucide-react";
import { useBarbershopStore } from "../stores/barbershop";
import { useAuthStore } from "../stores/auth";
import UserProfileDialog from "../components/profile/UserProfileDialog";
import type { ListBarbershopsParams } from "../api/barbershops";

const registrationOptions = [
  {
    label: "Sou Cliente",
    description: "Quero agendar horários em barbearias",
    role: "CLIENT",
  },
  {
    label: "Sou Barbeiro",
    description: "Quero gerenciar minha agenda de atendimentos",
    role: "BARBER",
  },
  {
    label: "Sou Dono de Barbearia",
    description: "Quero cadastrar minha barbearia e a equipe",
    role: "OWNER",
  },
] as const;

type SortOption = "distance" | "rating" | "name";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBarbershop, setSelectedBarbershop] = useState<Barbershop | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("distance");
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [radius, setRadius] = useState(10);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const barbershops = useBarbershopStore((state) => state.barbershops);
  const fetchBarbershops = useBarbershopStore((state) => state.fetchBarbershops);
  const isLoading = useBarbershopStore((state) => state.isLoading);
  const error = useBarbershopStore((state) => state.error);
  const total = useBarbershopStore((state) => state.total);
  const page = useBarbershopStore((state) => state.page);
  const limit = useBarbershopStore((state) => state.limit);
  const setPageStore = useBarbershopStore((state) => state.setPage);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const getProfile = useAuthStore((state) => state.getProfile);
  const navigate = useNavigate();
  const firstName = user?.name?.split(" ")[0] ?? user?.name ?? "Perfil";
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const [debouncedRegion, setDebouncedRegion] = useState("");
  const fetchRef = useRef(fetchBarbershops);

  useEffect(() => {
    fetchRef.current = fetchBarbershops;
  }, [fetchBarbershops]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedRegion(searchTerm.trim());
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const ensureLocation = useCallback(async () => {
    if (location) return;

    if (!navigator.geolocation) {
      setLocationError("Seu navegador não suporta geolocalização.");
      return;
    }

    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setLocation({ latitude: lat, longitude: lng });
      },
      (err) => {
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "Precisamos da sua localização para ordenar por distância."
            : "Não foi possível obter sua localização."
        );
      }
    );
  }, [location]);

  useEffect(() => {
    const resolvedOrder: ListBarbershopsParams['orderBy'] =
      sortBy === "distance" && location
        ? "distance"
        : sortBy === "rating"
          ? "createdAt"
          : "name";

    const params: ListBarbershopsParams = {
      region: debouncedRegion || undefined,
      page: 1,
      limit,
      orderBy: resolvedOrder,
    };

    if (sortBy === "distance" && location) {
      params.latitude = location.latitude;
      params.longitude = location.longitude;
      params.radius = radius;
    }

    fetchRef.current(params);
  }, [debouncedRegion, sortBy, location, radius, limit]);

  useEffect(() => {
    if (token) {
      setIsRegisterDialogOpen(false);
      if (!user) {
        getProfile();
      }
    } else {
      setIsProfileDialogOpen(false);
    }
  }, [token, user, getProfile]);

  const sortedBarbershops = useMemo(() => {
    if (sortBy === "distance") {
      return barbershops.slice().sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }

    if (sortBy === "name") {
      return barbershops.slice().sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    }

    return barbershops;
  }, [barbershops, sortBy]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handleLogout = () => {
    logout();
    setIsProfileDialogOpen(false);
    navigate("/");
  };

  const openRegister = () => {
    setIsRegisterDialogOpen(true);
    setIsSidebarOpen(false);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    if (value === "distance") {
      ensureLocation();
    }
  };

  useEffect(() => {
    if (sortBy === "distance" && !location) {
      ensureLocation();
    }
  }, [sortBy, location, ensureLocation]);

  const SidebarContent = ({ showClose = false, onClose }: { showClose?: boolean; onClose?: () => void }) => (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between px-6 pt-6">
        <div>
          <span className="text-2xl font-bold text-gray-900">FindCut</span>
          <p className="text-sm text-gray-500 mt-1">Encontre as melhores barbearias perto de você.</p>
        </div>
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="mt-6 flex-1 overflow-y-auto px-6 pb-8 space-y-6">
        <div className="flex flex-col gap-3">
          {token && user ? null : (
            <>
              <Link
                to="/login"
                onClick={() => onClose?.()}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Já tenho conta
              </Link>
              <button
                type="button"
                onClick={openRegister}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <Users className="h-4 w-4" />
                Quero me cadastrar
              </button>
            </>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Buscar</label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Digite uma região ou nome"
              className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ordenar por</label>
          <Select.Root value={sortBy} onValueChange={(value) => handleSortChange(value as SortOption)}>
            <Select.Trigger className="mt-2 flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500">
              <div className="flex items-center gap-2 text-gray-700">
                <Filter className="w-4 h-4" />
                <Select.Value placeholder="Ordenar" />
              </div>
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="bg-white border border-gray-200 rounded-lg shadow-lg p-1 z-50">
                <Select.Item value="distance" className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                  <Select.ItemText>Distância</Select.ItemText>
                </Select.Item>
                <Select.Item value="rating" className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                  <Select.ItemText>Avaliação</Select.ItemText>
                </Select.Item>
                <Select.Item value="name" className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                  <Select.ItemText>Nome</Select.ItemText>
                </Select.Item>
              </Select.Content>
            </Select.Portal>
            </Select.Root>
        </div>

        {sortBy === "distance" && (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between">
              Raio (km)
              <span className="text-gray-400 text-[11px]">{radius} km</span>
            </label>
            <input
              type="range"
              min={1}
              max={50}
              step={1}
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
              className="mt-2 w-full"
            />
            <button
              type="button"
              onClick={ensureLocation}
              className="mt-3 inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Usar minha localização
            </button>
            {locationError && (
              <p className="mt-2 text-xs text-red-500">{locationError}</p>
            )}
          </div>
        )}

        <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800">
          Explore as barbearias da sua região e agende com poucos cliques.
        </div>

        {user && (
          <div className="border-t border-gray-200 pt-5 space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Seus dados</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div>
                  <span className="text-xs uppercase text-gray-500 block">Nome</span>
                  <span>{user.name}</span>
                </div>
                <div>
                  <span className="text-xs uppercase text-gray-500 block">E-mail</span>
                  <span>{user.email}</span>
                </div>
                <div>
                  <span className="text-xs uppercase text-gray-500 block">Perfil</span>
                  <span>
                    {user.role === 'CLIENT' && 'Cliente'}
                    {user.role === 'BARBER' && 'Barbeiro'}
                    {user.role === 'OWNER' && 'Proprietário'}
                  </span>
                </div>
                {user.createdAt && (
                  <div>
                    <span className="text-xs uppercase text-gray-500 block">Desde</span>
                    <span>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(user.createdAt))}</span>
                  </div>
                )}
              </div>
            </div>

            <hr className="border-gray-200" />

            <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
              <button
                type="button"
                onClick={() => {
                  setIsProfileDialogOpen(true);
                  onClose?.();
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <UserCircle2 className="h-4 w-4" />
                Perfil
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  onClose?.();
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pb-6 text-xs text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} FindCut. Todos os direitos reservados.
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex lg:w-72 xl:w-80 border-r border-gray-200">
          <SidebarContent />
        </aside>

        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsSidebarOpen(false)} />
            <aside className="relative h-full w-72 max-w-full bg-white shadow-xl">
              <SidebarContent showClose onClose={() => setIsSidebarOpen(false)} />
            </aside>
          </div>
        )}

        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white lg:hidden">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Barbearias</h1>
            {token && user ? (
              <button
                type="button"
                onClick={() => setIsProfileDialogOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <UserCircle2 className="h-4 w-4" />
                {firstName}
              </button>
            ) : (
              <button
                type="button"
                onClick={openRegister}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Users className="h-4 w-4" />
                Cadastrar
              </button>
            )}
          </div>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">
            <div className="lg:hidden mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar barbearias..."
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Select.Root value={sortBy} onValueChange={(value) => handleSortChange(value as SortOption)}>
                <Select.Trigger className="flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Filter className="w-4 h-4" />
                    <Select.Value placeholder="Ordenar por" />
                  </div>
                  <Select.Icon />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="bg-white border border-gray-200 rounded-lg shadow-lg p-1 z-50">
                    <Select.Item value="distance" className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                      <Select.ItemText>Distância</Select.ItemText>
                    </Select.Item>
                    <Select.Item value="rating" className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                      <Select.ItemText>Avaliação</Select.ItemText>
                    </Select.Item>
                    <Select.Item value="name" className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                      <Select.ItemText>Nome</Select.ItemText>
                    </Select.Item>
                  </Select.Content>
                </Select.Portal>
                </Select.Root>

              {sortBy === "distance" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <span>Raio (km)</span>
                    <span className="text-gray-400 text-[11px]">{radius} km</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    step={1}
                    value={radius}
                    onChange={(event) => setRadius(Number(event.target.value))}
                    className="w-full"
                  />
                  <button
                    type="button"
                    onClick={ensureLocation}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Usar minha localização
                  </button>
                  {locationError && (
                    <p className="text-xs text-red-500">{locationError}</p>
                  )}
                </div>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {total} barbearia(s) encontrada(s)
              </h2>
              <p className="text-gray-600">Selecione uma barbearia para ver mais detalhes ou agendar.</p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {sortedBarbershops.map((barbershop) => (
                    <button
                      type="button"
                      key={barbershop.id}
                      className="text-left bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                      onClick={() => setSelectedBarbershop(barbershop)}
                    >
                      <div className="relative">
                        <img
                          src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop"
                          alt={barbershop.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                            Aberto
                          </span>
                        </div>
                        <div className="absolute top-4 left-4">
                          <div className="flex items-center gap-1 bg-black bg-opacity-70 text-white px-2 py-1 rounded">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">4.8</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {barbershop.name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {barbershop.address}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Navigation className="w-4 h-4" />
                          <span>
                            {sortBy === "distance" && typeof barbershop.distance === "number"
                              ? `${barbershop.distance.toFixed(1)} km`
                              : "Próximo de você"}
                          </span>
                        </div>

                        <div className="border-t pt-4">
                          <p className="text-sm text-gray-500 mb-2">Serviços populares:</p>
                          <div className="flex flex-wrap gap-2">
                            {(barbershop.services ?? []).slice(0, 2).map((service) => (
                              <span
                                key={service.id}
                                className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                              >
                                {service.name} {service.price ? `- ${formatPrice(service.price)}` : ""}
                              </span>
                            ))}
                            {(barbershop.services ?? []).length === 0 && (
                              <span className="text-xs text-gray-400">Nenhum serviço cadastrado ainda.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {sortedBarbershops.length === 0 && !error && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma barbearia encontrada</h3>
                    <p className="text-gray-600">Tente ajustar seus filtros ou termo de busca.</p>
                  </div>
                )}

                {total > limit && (
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-gray-600">
                      Página {page} de {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPageStore(Math.max(1, page - 1))}
                        disabled={page <= 1}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Anterior
                      </button>
                      <button
                        type="button"
                        onClick={() => setPageStore(page + 1)}
                        disabled={page >= totalPages}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Próxima
                      </button>
                    </div>
                  </div>
                )}

              </>
            )}
          </main>
        </div>
      </div>

      <Dialog.Root open={selectedBarbershop !== null} onOpenChange={() => setSelectedBarbershop(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-0 z-50 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
            {selectedBarbershop && (
              <>
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=400&fit=crop"
                    alt={selectedBarbershop.name}
                    className="w-full h-64 object-cover rounded-t-xl"
                  />
                  <Dialog.Close className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all">
                    <span className="sr-only">Fechar</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Dialog.Close>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Dialog.Title className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedBarbershop.name}
                      </Dialog.Title>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>4.8</span>
                        </div>
                        <span>•</span>
                        <span>Próximo</span>
                        <span>•</span>
                        <span className="text-green-600">Aberto</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span>{selectedBarbershop.address}</span>
                    </div>
                    {selectedBarbershop.phone && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span>{selectedBarbershop.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Serviços</h3>
                    <div className="space-y-3">
                      {(selectedBarbershop.services ?? []).map((service) => (
                        <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{service.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{service.duration ? `${service.duration} min` : "Duração sob consulta"}</span>
                            </div>
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            {service.price ? formatPrice(service.price) : "Sob consulta"}
                          </div>
                        </div>
                      ))}
                      {(selectedBarbershop.services ?? []).length === 0 && (
                        <p className="text-sm text-gray-500">Esta barbearia ainda não cadastrou serviços.</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                      Agendar horário
                    </button>
                  </div>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={isRegisterDialogOpen && !token} onOpenChange={setIsRegisterDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 z-50 max-w-lg w-full mx-4">
            <div className="mb-6">
              <Dialog.Title className="text-2xl font-semibold text-gray-900">Como você quer usar o FindCut?</Dialog.Title>
              <Dialog.Description className="text-gray-600 mt-2">
                Escolha a opção que melhor representa o seu perfil para continuar o cadastro.
              </Dialog.Description>
            </div>

            <div className="space-y-3">
              {registrationOptions.map((option) => (
                <Link
                  key={option.role}
                  to={`/register?role=${option.role}`}
                  className="block rounded-lg border border-gray-200 p-4 hover:border-blue-500 hover:bg-blue-50 transition-all"
                  onClick={() => setIsRegisterDialogOpen(false)}
                >
                  <div className="text-sm font-semibold text-gray-900">{option.label}</div>
                  <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                </Link>
              ))}
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="mt-6 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {user && (
        <UserProfileDialog
          open={isProfileDialogOpen}
          onOpenChange={setIsProfileDialogOpen}
        />
      )}
    </div>
  );
};

export default Home;
