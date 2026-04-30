export const initialLogs = [
  {
    id: 'log-1',
    species: 'Yellowfin tuna',
    weight: '68 kg',
    location: 'Sarangani Bay',
    notes: 'Clear water, caught before first market run.',
    createdAt: '2026-04-28T06:30:00.000Z',
  },
  {
    id: 'log-2',
    species: 'Mackerel',
    weight: '34 kg',
    location: 'Davao Gulf',
    notes: 'Good school movement near reef line.',
    createdAt: '2026-04-27T09:15:00.000Z',
  },
];

export const initialProducts = [
  {
    id: 'product-1',
    name: 'Fresh lapu-lapu',
    category: 'Fish',
    price: 'PHP 420/kg',
    seller: 'Marina Coop',
    icon: '<>',
  },
  {
    id: 'product-2',
    name: 'Repair net bundle',
    category: 'Supplies',
    price: 'PHP 1,250',
    seller: 'Pier 4 Supply',
    icon: '#',
  },
  {
    id: 'product-3',
    name: 'Ice box rental',
    category: 'Equipment',
    price: 'PHP 300/day',
    seller: 'Cold Chain Hub',
    icon: '[]',
  },
];

export const initialAlerts = [
  {
    id: 'alert-1',
    title: 'PAGASA gale warning watch',
    level: 'Weather',
    message: 'Monitor wind shifts after 16:00 before leaving nearshore lanes.',
    createdAt: '2026-04-30T04:00:00.000Z',
  },
  {
    id: 'alert-2',
    title: 'Floating debris report',
    level: 'Safety',
    message: 'Avoid the west channel marker until cleanup clears.',
    createdAt: '2026-04-29T13:30:00.000Z',
  },
];

export const productiveZones = [
  {
    id: 'zone-1',
    name: 'Tuna shelf marker 14',
    cooperative: 'Sarangani Bluewater Coop',
    trustLevel: 'Trusted crews only',
    confidence: 'High',
    lastCatch: 'Yellowfin movement reported 05:40',
    distance: '8.2 nm SE',
    coordinates: '6.036 N, 125.245 E',
    left: '30%',
    top: '48%',
  },
  {
    id: 'zone-2',
    name: 'Reef edge drift lane',
    cooperative: 'Davao Gulf Handline Network',
    trustLevel: 'Coop verified',
    confidence: 'Medium',
    lastCatch: 'Mackerel school active before tide turn',
    distance: '4.7 nm E',
    coordinates: '7.001 N, 125.702 E',
    left: '64%',
    top: '35%',
  },
  {
    id: 'zone-3',
    name: 'Night squid pocket',
    cooperative: 'Southern Lights Fishers',
    trustLevel: 'Private share',
    confidence: 'Medium',
    lastCatch: 'Squid lights productive after moonset',
    distance: '11.5 nm S',
    coordinates: '5.922 N, 125.132 E',
    left: '73%',
    top: '70%',
  },
];

export const voiceCommands = [
  {
    language: 'Cebuano',
    phrase: 'Asa ang isda?',
    intent: 'Show productive zones near current GPS position.',
  },
  {
    language: 'Cebuano',
    phrase: 'Basaha ang panahon',
    intent: 'Read PAGASA marine weather and sea condition alerts aloud.',
  },
  {
    language: 'Hiligaynon',
    phrase: 'Diin ang maayo nga hulugan?',
    intent: 'Find trusted cooperative fishing zones.',
  },
  {
    language: 'Hiligaynon',
    phrase: 'Irekord ang dakop',
    intent: 'Start a hands-free catch log.',
  },
];

export function formatDate(value) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}
