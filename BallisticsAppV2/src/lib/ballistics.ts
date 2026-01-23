import { AmmunitionData, BallisticResult, BallisticEnvironment, RifleProfile } from '../types';
import { STANDARD_ATMOSPHERE } from './constants';

/**
 * BALLISTIC CALCULATION MODEL
 *
 * This module implements the G1 drag model for external ballistics calculations.
 *
 * References:
 * - JBM Ballistics (jbmballistics.com)
 * - Bryan Litz, "Applied Ballistics for Long Range Shooting"
 * - McCoy, "Modern Exterior Ballistics"
 *
 * Last validated: January 2025
 */

// Physical Constants
const GRAVITY = 9.81; // m/s² - gravitational acceleration
const GRAINS_TO_KG = 0.0000648; // conversion: 1 grain = 0.0000648 kg
const STANDARD_AIR_DENSITY = 1.225; // kg/m³ at ICAO standard atmosphere (15°C, 1013.25 hPa)
const SPEED_OF_SOUND = 340.3; // m/s at 15°C

// G1 Standard Drag Function Table
// Source: JBM Ballistics (jbmballistics.com/ballistics/downloads/text/mcg1.txt)
// Values: [Mach, Cd] - drag coefficient vs Mach number
const G1_DRAG_TABLE: [number, number][] = [
  [0.00, 0.2629], [0.05, 0.2558], [0.10, 0.2487], [0.15, 0.2413], [0.20, 0.2344],
  [0.25, 0.2278], [0.30, 0.2214], [0.35, 0.2155], [0.40, 0.2104], [0.45, 0.2061],
  [0.50, 0.2032], [0.55, 0.2020], [0.60, 0.2034], [0.65, 0.2165], [0.70, 0.2230],
  [0.75, 0.2313], [0.80, 0.2417], [0.85, 0.2546], [0.90, 0.2706], [0.925, 0.2859],
  [0.95, 0.3052], [0.975, 0.3290], [1.00, 0.3576], [1.025, 0.3917], [1.05, 0.4243],
  [1.075, 0.4511], [1.10, 0.4729], [1.125, 0.4891], [1.15, 0.5014], [1.175, 0.5107],
  [1.20, 0.5180], [1.25, 0.5278], [1.30, 0.5338], [1.35, 0.5373], [1.40, 0.5392],
  [1.45, 0.5398], [1.50, 0.5396], [1.55, 0.5386], [1.60, 0.5372], [1.65, 0.5355],
  [1.70, 0.5336], [1.75, 0.5315], [1.80, 0.5294], [1.85, 0.5272], [1.90, 0.5250],
  [1.95, 0.5228], [2.00, 0.5206], [2.05, 0.5183], [2.10, 0.5162], [2.15, 0.5141],
  [2.20, 0.5121], [2.25, 0.5101], [2.30, 0.5081], [2.35, 0.5062], [2.40, 0.5043],
  [2.45, 0.5025], [2.50, 0.5007], [2.60, 0.4973], [2.70, 0.4940], [2.80, 0.4909],
  [2.90, 0.4880], [3.00, 0.4852], [3.10, 0.4825], [3.20, 0.4800], [3.30, 0.4775],
  [3.40, 0.4752], [3.50, 0.4729], [3.60, 0.4708], [3.70, 0.4687], [3.80, 0.4667],
  [3.90, 0.4648], [4.00, 0.4629], [4.20, 0.4594], [4.40, 0.4561], [4.60, 0.4531],
  [4.80, 0.4502], [5.00, 0.4474],
];

// Create standard environment with optional wind parameters
export function createStandardEnvironment(
  windSpeed: number = 0,
  windAngle: number = 90
): BallisticEnvironment {
  return {
    ...STANDARD_ATMOSPHERE,
    windSpeed,
    windAngle,
  };
}

/**
 * Calculate air density based on environmental conditions
 * Formula: ρ = P / (R × T)
 *
 * @param env - Environmental conditions
 * @returns Air density in kg/m³
 */
function calculateAirDensity(env: BallisticEnvironment): number {
  const T = env.temperature + 273.15; // Convert Celsius to Kelvin
  const P = env.pressure * 100; // Convert hPa to Pa
  const R = 287.05; // Specific gas constant for dry air in J/(kg·K)

  return P / (R * T);
}

/**
 * Get G1 drag coefficient from standard table using linear interpolation
 * Source: JBM Ballistics G1 drag function
 *
 * @param mach - Mach number (velocity / speed of sound)
 * @returns G1 drag coefficient (Cd)
 */
function getG1DragCoefficient(mach: number): number {
  // Clamp Mach number to table range
  if (mach <= 0) return G1_DRAG_TABLE[0][1];
  if (mach >= 5.0) return G1_DRAG_TABLE[G1_DRAG_TABLE.length - 1][1];

  // Find bracketing values and interpolate
  for (let i = 0; i < G1_DRAG_TABLE.length - 1; i++) {
    const [m1, cd1] = G1_DRAG_TABLE[i];
    const [m2, cd2] = G1_DRAG_TABLE[i + 1];

    if (mach >= m1 && mach <= m2) {
      // Linear interpolation
      const t = (mach - m1) / (m2 - m1);
      return cd1 + t * (cd2 - cd1);
    }
  }

  return G1_DRAG_TABLE[G1_DRAG_TABLE.length - 1][1];
}

/**
 * Calculate drag deceleration using the G1 model
 *
 * Formula: a = K × (ρ/ρ_std) × (Cd/BC) × v²
 *
 * Where:
 * - K = G1 scaling constant = ρ_std / (2 × SD_ref)
 * - ρ = current air density (kg/m³)
 * - ρ_std = standard air density = 1.225 kg/m³
 * - Cd = G1 drag coefficient from lookup table
 * - BC = ballistic coefficient (G1)
 * - v = velocity (m/s)
 *
 * Derivation:
 * - SD_ref (G1 reference) = 1 lb/in² = 703.07 kg/m²
 * - K = 1.225 / (2 × 703.07) = 0.000871
 *
 * Reference: JBM Ballistics, Applied Ballistics LLC
 *
 * @param velocity - Current velocity in m/s
 * @param bc - Ballistic coefficient (G1)
 * @param airDensity - Current air density in kg/m³
 * @returns Deceleration in m/s²
 */
function calculateDrag(
  velocity: number,
  bc: number,
  airDensity: number
): number {
  const mach = velocity / SPEED_OF_SOUND;
  const cd = getG1DragCoefficient(mach);

  // Air density ratio (current / standard)
  const densityRatio = airDensity / STANDARD_AIR_DENSITY;

  // G1 model scaling constant
  // K = ρ_std / (2 × SD_ref) where SD_ref = 1 lb/in² = 703.07 kg/m²
  // K = 1.225 / (2 × 703.07) = 0.000871
  const G1_CONSTANT = 0.000871;

  // Drag deceleration: a = K × (ρ/ρ_std) × (Cd/BC) × v²
  const deceleration = G1_CONSTANT * densityRatio * (cd / bc) * velocity * velocity;

  return deceleration;
}

// Main trajectory calculation
export function calculateTrajectory(
  profile: RifleProfile,
  targetDistance: number,
  environment: BallisticEnvironment
): BallisticResult {
  const ammo = profile.ammunition;
  const bc = ammo.ballisticCoefficient;
  const v0 = ammo.muzzleVelocity;
  const bulletMass = ammo.bulletWeight * GRAINS_TO_KG;
  const sightHeight = profile.sightHeight / 100; // Convert to meters

  // Calculate zero angle based on zero distance and type
  const zeroAngle = calculateZeroAngle(profile, environment);

  // Initial conditions
  let x = 0; // horizontal position (m)
  let y = -sightHeight; // vertical position relative to sight line (m)
  let vx = v0 * Math.cos(zeroAngle);
  let vy = v0 * Math.sin(zeroAngle);
  let t = 0;

  // Wind components
  const windRad = (environment.windAngle * Math.PI) / 180;
  const crossWind = environment.windSpeed * Math.sin(windRad); // Positive = from right
  let z = 0; // lateral drift (m)
  let vz = 0;

  // Air density
  const airDensity = calculateAirDensity(environment);

  // Time step for numerical integration
  const dt = 0.001; // 1ms steps

  // Integrate until target distance reached
  while (x < targetDistance && t < 5) {
    // 5 second max flight time safety
    // Calculate velocity magnitude
    const v = Math.sqrt(vx * vx + vy * vy + vz * vz);

    // Calculate drag deceleration
    const drag = calculateDrag(v, bc, airDensity);

    // Drag components (opposite to velocity direction)
    const dragX = (drag * vx) / v;
    const dragY = (drag * vy) / v;
    const dragZ = (drag * vz) / v;

    // Update velocities
    vx -= dragX * dt;
    vy -= (GRAVITY + dragY) * dt;

    // Wind drift: accelerate towards wind speed
    const windForce = (crossWind - vz) * 0.1; // Simple wind model
    vz += (windForce - dragZ) * dt;

    // Update positions
    x += vx * dt;
    y += vy * dt;
    z += vz * dt;

    t += dt;
  }

  // Calculate drop relative to sight line (accounting for sight height)
  // At zero distance, bullet should hit where aimed (y=0 at sight line)
  const drop = -y * 100; // Convert to cm, positive = below line of sight

  // Calculate energy
  const velocity = Math.sqrt(vx * vx + vy * vy);
  const energy = 0.5 * bulletMass * velocity * velocity;

  return {
    drop: Math.round(drop * 10) / 10,
    drift: Math.round(z * 100 * 10) / 10, // cm, positive = right
    time: Math.round(t * 100) / 100,
    velocity: Math.round(velocity),
    energy: Math.round(energy),
  };
}

// Calculate the angle needed to zero at a given distance
function calculateZeroAngle(
  profile: RifleProfile,
  environment: BallisticEnvironment
): number {
  const zeroDistance = profile.zeroDistance;
  const sightHeight = profile.sightHeight / 100; // meters
  const geeOffset = profile.zeroType === 'gee' ? 0.04 : 0; // 4cm GEE offset

  // Target height at zero distance (sight line intersection + GEE offset)
  const targetHeight = geeOffset;

  // Simple ballistic angle calculation
  // For a more accurate zero, we'd iterate, but this approximation works well
  const v0 = profile.ammunition.muzzleVelocity;
  const timeToZero = zeroDistance / v0; // Approximate time
  const dropAtZero = 0.5 * GRAVITY * timeToZero * timeToZero;

  // Angle needed to compensate for drop and hit target height
  const angleRad = Math.atan((targetHeight + dropAtZero + sightHeight) / zeroDistance);

  return angleRad;
}

// Unit conversion helpers
export function cmToMOA(cm: number, distance: number): number {
  // 1 MOA = 1.047" at 100 yards, or approximately 2.908 cm at 100m
  const moaPerCmAt100m = 1 / 2.908;
  const distanceFactor = distance / 100;
  return cm * moaPerCmAt100m / distanceFactor;
}

export function cmToMIL(cm: number, distance: number): number {
  // 1 MIL = 10 cm at 100m
  const milPerCmAt100m = 0.1;
  const distanceFactor = distance / 100;
  return cm * milPerCmAt100m / distanceFactor;
}

export function formatValue(
  cm: number,
  distance: number,
  unit: 'cm' | 'moa' | 'mil',
  decimals: number = 1
): string {
  switch (unit) {
    case 'moa':
      return `${cmToMOA(cm, distance).toFixed(decimals)} MOA`;
    case 'mil':
      return `${cmToMIL(cm, distance).toFixed(decimals)} MIL`;
    default:
      return `${cm.toFixed(decimals)} cm`;
  }
}
