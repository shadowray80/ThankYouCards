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
