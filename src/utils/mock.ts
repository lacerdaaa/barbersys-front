import type { Barbershop } from "../models/barbershop";

export const mockBarbershops: Barbershop[] = [
  {
    id: '1',
    name: 'Barbearia Central',
    address: 'Rua das Flores, 123 - Centro, Campinas - SP',
    latitude: -22.9035,
    longitude: -47.0616,
    phone: '(19) 3234-5678',
    ownerId: 'owner_1',
    invites: [
      {
        id: 'invite_1',
        code: 'ABC123',
        barbershopId: '1',
        expiresAt: '2025-12-31T23:59:59Z',
        createdAt: '2025-01-01T00:00:00Z',
        expired: false
      }
    ],
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2025-01-20').toISOString(),
    services: [
      { 
        id: '1', 
        barbershopId: '1', 
        name: 'Corte Masculino', 
        price: 35, 
        duration: 30,
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString(),
        bookings: []
      },
      { 
        id: '2', 
        barbershopId: '1', 
        name: 'Barba', 
        price: 25, 
        duration: 20,
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString(),
        bookings: []
      }
    ]
  },
  {
    id: '2',
    name: 'Estilo & Tradição',
    address: 'Av. Paulista, 456 - Bela Vista, Campinas - SP',
    latitude: -22.9068,
    longitude: -47.0653,
    phone: '(19) 3345-6789',
    ownerId: 'owner_2',
    invites: [],
    createdAt: new Date('2024-02-10').toISOString(),
    updatedAt: new Date('2025-01-15').toISOString(),
    services: [
      { 
        id: '3', 
        barbershopId: '2', 
        name: 'Corte + Barba', 
        price: 55, 
        duration: 45,
        createdAt: new Date('2024-02-10').toISOString(),
        updatedAt: new Date('2024-02-10').toISOString(),
        bookings: []
      },
      { 
        id: '4', 
        barbershopId: '2', 
        name: 'Corte Social', 
        price: 40, 
        duration: 35,
        createdAt: new Date('2024-02-10').toISOString(),
        updatedAt: new Date('2024-02-10').toISOString(),
        bookings: []
      }
    ]
  },
  {
    id: '3',
    name: 'Barbershop Premium',
    address: 'Rua dos Andradas, 789 - Vila Nova, Campinas - SP',
    latitude: -22.8958,
    longitude: -47.0739,
    phone: '(19) 3456-7890',
    ownerId: 'owner_3',
    invites: [
      {
        id: 'invite_2',
        code: 'XYZ789',
        barbershopId: '3',
        expiresAt: '2025-06-30T23:59:59Z',
        createdAt: '2025-01-10T00:00:00Z',
        expired: false
      }
    ],
    createdAt: new Date('2024-03-05').toISOString(),
    updatedAt: new Date('2025-01-25').toISOString(),
    services: [
      { 
        id: '5', 
        barbershopId: '3', 
        name: 'Corte Premium', 
        price: 65, 
        duration: 40,
        createdAt: new Date('2024-03-05').toISOString(),
        updatedAt: new Date('2024-03-05').toISOString(),
        bookings: []
      },
      { 
        id: '6', 
        barbershopId: '3', 
        name: 'Tratamento Capilar', 
        price: 80, 
        duration: 60,
        createdAt: new Date('2024-03-05').toISOString(),
        updatedAt: new Date('2024-03-05').toISOString(),
        bookings: []
      }
    ]
  }
];