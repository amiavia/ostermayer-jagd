import { DragModel } from '../types';

// Ostermayer Jagd AG Brand Colors
export const colors = {
  forestDark: '#0D1F0D',
  forest: '#1A2B1A',
  forestLight: '#2D4526',
  gold: '#C9A227',
  goldLight: '#D4B63C',
  cream: '#F8F6F0',
  warmWhite: '#FDFCFA',
  error: '#D32F2F',
  success: '#388E3C',
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E0E0E0',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  PROFILES: '@ballistics/profiles',
  ACTIVE_PROFILE_ID: '@ballistics/activeProfileId',
  ONBOARDING_COMPLETE: '@ballistics/onboardingComplete',
  SETTINGS: '@ballistics/settings',
} as const;

// Default settings
export const DEFAULT_SETTINGS = {
  units: 'cm' as const,
  language: 'de' as const,
};

// Standard atmospheric conditions (ICAO Standard Atmosphere)
export const STANDARD_ATMOSPHERE = {
  temperature: 15, // Celsius
  pressure: 1013.25, // hPa
  humidity: 0.5, // 50% (0-1 scale)
  altitude: 0, // meters above sea level
};

// Slider ranges
export const SLIDER_RANGES = {
  distance: { min: 50, max: 500, step: 10 },
  windSpeed: { min: 0, max: 15, step: 1 },
  windAngle: { min: 0, max: 180, step: 15 },
  sightHeight: { min: 2, max: 10, step: 0.5 },
};

// Environment slider ranges
export const ENVIRONMENT_RANGES = {
  temperature: { min: -20, max: 45, step: 1, unit: '°C' },
  pressure: { min: 850, max: 1100, step: 1, unit: 'hPa' },
  altitude: { min: 0, max: 4000, step: 50, unit: 'm' },
  humidity: { min: 0, max: 100, step: 5, unit: '%' },
};

// Zero distance options
export const ZERO_OPTIONS = [
  { distance: 100, type: 'standard' as const, label: '100m Standard', description: 'Nullpunkt genau bei 100 Metern' },
  { distance: 100, type: 'gee' as const, label: 'GEE (100m +4cm)', description: 'Gunstigste Einschussentfernung - 4cm hoch bei 100m', recommended: true },
  { distance: 200, type: 'standard' as const, label: '200m Standard', description: 'Nullpunkt genau bei 200 Metern' },
];

// Default drag model for ballistic calculations
export const DEFAULT_DRAG_MODEL: DragModel = 'g1';

// Default onboarding values
export const DEFAULT_ONBOARDING = {
  caliber: null,
  ammunition: null,
  zeroDistance: 100,
  zeroType: 'gee' as const,
  sightHeight: 4.5,
  profileName: '',
};
