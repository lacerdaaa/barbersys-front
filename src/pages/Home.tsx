import { Dialog, Select } from "radix-ui";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Barbershop } from "../models/barbershop";
import { Clock, Filter, MapPin, Navigation, Phone, Search, Star, Users } from "lucide-react";
import { useBarbershopStore } from "../stores/barbershop";

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

  const { barbershops, fetchBarbershops, isLoading, error } = useBarbershopStore((state) => ({
    barbershops: state.barbershops,
    fetchBarbershops: state.fetchBarbershops,
    isLoading: state.isLoading,
    error: state.error,
  }));

  useEffect(() => {
    fetchBarbershops();
  }, [fetchBarbershops]);

  const filteredBarbershops = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    const filtered = normalizedTerm
      ? barbershops.filter((shop) => {
          const name = shop.name?.toLowerCase() ?? "";
          const address = shop.address?.toLowerCase() ?? "";
          return name.includes(normalizedTerm) || address.includes(normalizedTerm);
        })
      : barbershops;

    return filtered.slice().sort((a, b) => {
      if (sortBy === "name") {
        return (a.name ?? "").localeCompare(b.name ?? "");
      }

      if (sortBy === "rating") {
        const ratingA = (a as unknown as { rating?: number }).rating ?? 0;
        const ratingB = (b as unknown as { rating?: number }).rating ?? 0;
        return ratingB - ratingA;
      }

      return 0;
    });
  }, [barbershops, searchTerm, sortBy]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FindCut</h1>
              <p className="text-gray-600 mt-1">
                Encontre as melhores barbearias perto de você ou gerencie o seu negócio.
              </p>
            </div>

            <nav className="flex items-center gap-3 self-start lg:self-auto">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Entrar
              </Link>
              <button
                type="button"
                onClick={() => setIsRegisterDialogOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <Users className="h-4 w-4" />
                Quero me cadastrar
              </button>
            </nav>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar barbearias..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select.Root value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <Select.Trigger className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500">
                <Filter className="w-4 h-4" />
                <Select.Value placeholder="Ordenar por" />
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {filteredBarbershops.length} barbearia(s) encontrada(s)
              </h2>
              <p className="text-gray-600">Clique em uma barbearia para ver mais detalhes.</p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Barbershop Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBarbershops.map((barbershop) => (
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
                      <span>Próximo de você</span>
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

            {/* Empty State */}
            {filteredBarbershops.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma barbearia encontrada</h3>
                <p className="text-gray-600">Tente ajustar seus filtros ou termo de busca.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Barbershop Details Modal */}
      <Dialog.Root open={selectedBarbershop !== null} onOpenChange={() => setSelectedBarbershop(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black bg-opacity-50 fixed inset-0 z-40" />
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

      {/* Register dialog */}
      <Dialog.Root open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black bg-opacity-50 fixed inset-0 z-40" />
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
    </div>
  );
};

export default Home;
