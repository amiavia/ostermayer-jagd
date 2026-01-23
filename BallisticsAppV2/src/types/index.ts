// Ammunition data for a specific load
export interface AmmunitionData {
  name: string;
  bulletWeight: number; // grains
  ballisticCoefficient: number; // G1 BC
  muzzleVelocity: number; // m/s
}

// Caliber group with available ammunition options
export interface CaliberGroup {
  caliber: string;
  description: string;
  ammunition: AmmunitionData[];
}

// User's rifle profile
export interface RifleProfile {
  id: string;
  name: string;
  caliber: string;
  ammunition: AmmunitionData;
  zeroDistance: number; // meters
  zeroType: 'standard' | 'gee'; // GEE = Gunstigste Einschuss Entfernung (+4cm at zero)
  sightHeight: number; // cm above bore
  createdAt: number; // timestamp
}

// Ballistic calculation result
export interface BallisticResult {
  drop: number; // cm (positive = below line of sight)
  drift: number; // cm (positive = right)
  time: number; // seconds
  velocity: number; // m/s
  energy: number; // Joules
}

// Environmental conditions
export interface BallisticEnvironment {
  temperature: number; // Celsius
  pressure: number; // hPa
  humidity: number; // 0-1
  windSpeed: number; // m/s
  windAngle: number; // degrees (0=headwind, 90=right crosswind, 180=tailwind)
}

// App settings
export interface AppSettings {
  units: 'cm' | 'moa' | 'mil';
  language: 'de' | 'en';
}

// Unit conversion type
export type UnitType = 'cm' | 'moa' | 'mil';

// Onboarding state
export interface OnboardingState {
  caliber: string | null;
  ammunition: AmmunitionData | null;
  zeroDistance: number;
  zeroType: 'standard' | 'gee';
  sightHeight: number;
  profileName: string;
}
