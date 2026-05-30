export interface CasualPalette {
  id: string;
  name: string;
  swatch: string;
  bg: string;
  headerFrom: string;
  headerTo: string;
  accent: string;
  accentLight: string;
  cardBgs: string[];
  avatarColors: string[];
}

export interface CorporatePalette {
  id: string;
  name: string;
  swatch: string;
  headerFrom: string;
  headerTo: string;
  accent: string;      // gold/highlight colour
  accentLight: string; // light version for card backgrounds
  cardLight: string;   // alternate card background
}

export function buildCustomPalette(hex: string): CorporatePalette {
  return { id: hex, name: 'Custom', swatch: hex, headerFrom: hex, headerTo: hex, accent: '#C4903A', accentLight: '#FFF8EE', cardLight: '#F4F4F6' };
}

export const CORPORATE_PALETTES: CorporatePalette[] = [
  {
    id: 'navy',
    name: 'Navy',
    swatch: '#1A2744',
    headerFrom: '#1A2744',
    headerTo: '#2E4080',
    accent: '#C4903A',
    accentLight: '#FFF8EE',
    cardLight: '#F4F4F6',
  },
  {
    id: 'charcoal',
    name: 'Charcoal',
    swatch: '#2A2A2A',
    headerFrom: '#222222',
    headerTo: '#404040',
    accent: '#C4903A',
    accentLight: '#FFF8EE',
    cardLight: '#F5F5F5',
  },
  {
    id: 'forest',
    name: 'Forest',
    swatch: '#1A3A28',
    headerFrom: '#1A3428',
    headerTo: '#2A5A40',
    accent: '#8FBF6A',
    accentLight: '#F0F8EE',
    cardLight: '#F4F6F4',
  },
  {
    id: 'burgundy',
    name: 'Burgundy',
    swatch: '#5A1828',
    headerFrom: '#4A1520',
    headerTo: '#7A2A38',
    accent: '#C4903A',
    accentLight: '#FFF8EE',
    cardLight: '#F6F4F4',
  },
  {
    id: 'slate',
    name: 'Slate',
    swatch: '#2A3A52',
    headerFrom: '#243448',
    headerTo: '#3A5070',
    accent: '#7AB8C8',
    accentLight: '#EEF6F8',
    cardLight: '#F4F5F6',
  },
];

export const CASUAL_PALETTES: CasualPalette[] = [
  {
    id: 'sky',
    name: 'Ocean',
    swatch: '#3A8FA0',
    bg: '#D4EEF7',
    headerFrom: '#2A7E9F',
    headerTo: '#4AAFBF',
    accent: '#2A7E9F',
    accentLight: '#E8F7FC',
    cardBgs: ['#ffffff', '#E8F7FC', '#FFF9E6', '#F0FAF4', '#F8F0FA'],
    avatarColors: ['#E8724A', '#3A8FA0', '#7C5CBF', '#4A9070', '#E8C84A', '#5AC8FA', '#E87068'],
  },
  {
    id: 'sunset',
    name: 'Sunset',
    swatch: '#E8724A',
    bg: '#FDE8D8',
    headerFrom: '#C85A2A',
    headerTo: '#E8824A',
    accent: '#C85A2A',
    accentLight: '#FEF4EE',
    cardBgs: ['#ffffff', '#FEF4EE', '#E8F7FC', '#F0FAF4', '#F8F0FA'],
    avatarColors: ['#C85A2A', '#3A8FA0', '#7C5CBF', '#4A9070', '#E8C84A', '#5AC8FA', '#E87068'],
  },
  {
    id: 'garden',
    name: 'Garden',
    swatch: '#4A9060',
    bg: '#D8EDD8',
    headerFrom: '#2A6040',
    headerTo: '#4A9060',
    accent: '#2A6040',
    accentLight: '#EAF5EA',
    cardBgs: ['#ffffff', '#EAF5EA', '#FFF9E6', '#E8F7FC', '#F8F0FA'],
    avatarColors: ['#E8724A', '#2A6040', '#7C5CBF', '#3A8FA0', '#E8C84A', '#5AC8FA', '#E87068'],
  },
  {
    id: 'lavender',
    name: 'Lavender',
    swatch: '#7C5CBF',
    bg: '#EAE0F8',
    headerFrom: '#5A3A9F',
    headerTo: '#7C5CBF',
    accent: '#5A3A9F',
    accentLight: '#F2EBF8',
    cardBgs: ['#ffffff', '#F2EBF8', '#FFF9E6', '#E8F7FC', '#EAF5EA'],
    avatarColors: ['#E8724A', '#5A3A9F', '#3A8FA0', '#4A9070', '#E8C84A', '#5AC8FA', '#E87068'],
  },
];
