import { Dialog, Select } from "radix-ui";
import { useState } from "react";
import type { Barbershop } from "../models/barbershop";
import { mockBarbershops } from "../utils/mock";
import { Clock, Filter, MapPin, Navigation, Phone, Search, Star } from "lucide-react";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBarbershop, setSelectedBarbershop] = useState<Barbershop | null>(null);
  const [sortBy, setSortBy] = useState('distance');

  const filteredBarbershops = mockBarbershops
    .filter(shop =>
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'distance') return 0;
      if (sortBy === 'rating') return 0;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FindCut</h1>
              <p className="text-gray-600 mt-1">Encontre as melhores barbearias perto de você</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Navigation className="w-4 h-4" />
              <span>Campinas, SP</span>
            </div>
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

            <Select.Root value={sortBy} onValueChange={setSortBy}>
              <Select.Trigger className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500">
                <Filter className="w-4 h-4" />
                <Select.Value />
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
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {filteredBarbershops.length} barbearias encontradas
          </h2>
          <p className="text-gray-600">Clique em uma barbearia para ver mais detalhes</p>
        </div>

        {/* Barbershop Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBarbershops.map((barbershop) => (
            <div
              key={barbershop.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
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

              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {barbershop.name}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{barbershop.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Navigation className="w-4 h-4" />
                    <span className="text-sm">Próximo</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{barbershop.phone}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Serviços populares:</p>
                  <div className="flex flex-wrap gap-2">
                    {barbershop.services.slice(0, 2).map((service) => (
                      <span
                        key={service.id}
                        className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                      >
                        {service.name} - {formatPrice(service.price ?? 0)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBarbershops.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma barbearia encontrada
            </h3>
            <p className="text-gray-600">
              Tente ajustar seus filtros ou termo de busca
            </p>
          </div>
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
                    src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop"
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
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span>{selectedBarbershop.phone}</span>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Serviços</h3>
                    <div className="space-y-3">
                      {selectedBarbershop.services.map((service) => (
                        <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{service.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{service.duration} min</span>
                            </div>
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            {formatPrice(service.price ?? 0)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                      Agendar Horário
                    </button>
                  </div>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export default Home;