import { AmmunitionData, BallisticResult, BallisticEnvironment, DragModel, RifleProfile } from '../types';
import { STANDARD_ATMOSPHERE } from './constants';

/**
 * BALLISTIC CALCULATION ENGINE
 *
 * Implements G1 and G7 drag models for external ballistics calculations.
 * Uses point-mass trajectory integration with adaptive timestep near transonic.
 *
 * Features:
 * - G1 and G7 standard drag models
 * - Velocity-band BC interpolation
 * - Physics-based wind model (relative velocity)
 * - Iterative zero angle solve (binary search)
 * - Temperature-dependent speed of sound
 * - Humidity-corrected air density (virtual temperature method)
 * - Adaptive timestep near transonic regime
 *
 * References:
 * - JBM Ballistics (jbmballistics.com)
 * - Bryan Litz, "Applied Ballistics for Long Range Shooting"
 * - Robert L. McCoy, "Modern Exterior Ballistics"
 * - Aberdeen Proving Ground drag function data
 *
 * Last validated: February 2026
 */

// =============================================================================
// Physical Constants
// =============================================================================

/** Gravitational acceleration (m/s^2) */
const GRAVITY = 9.81;

/** Conversion factor: 1 grain = 0.0000648 kg */
const GRAINS_TO_KG = 0.0000648;

/** ICAO standard air density at sea level, 15 deg C, 1013.25 hPa (kg/m^3) */
const STANDARD_AIR_DENSITY = 1.225;

/**
 * Drag model scaling constant K.
 *
 * Both G1 and G7 reference projectiles share the same sectional density reference:
 *   SD_ref = 1 lb/in^2 = 703.07 kg/m^2
 *
 * K = rho_std / (2 * SD_ref) = 1.225 / (2 * 703.07) = 0.000871
 *
 * This constant converts the dimensionless drag coefficient into a deceleration
 * per unit velocity squared, scaled by BC and air density ratio.
 */
const DRAG_CONSTANT = 0.000871;

// =============================================================================
// G1 Standard Drag Function Table
// =============================================================================

/**
 * G1 drag coefficient vs Mach number.
 * The G1 reference projectile is a flat-base, 2-caliber nose ogive.
 * Source: JBM Ballistics (jbmballistics.com/ballistics/downloads/text/mcg1.txt)
 */
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

// =============================================================================
// G7 Standard Drag Function Table
// =============================================================================

/**
 * G7 drag coefficient vs Mach number.
 * The G7 reference projectile is a tangent ogive, boat-tail design — more
 * representative of modern long-range rifle bullets than the flat-base G1.
 * Source: Aberdeen Proving Ground / JBM Ballistics
 */
const G7_DRAG_TABLE: [number, number][] = [
  [0.00, 0.1198], [0.05, 0.1197], [0.10, 0.1196], [0.15, 0.1194], [0.20, 0.1193],
  [0.25, 0.1194], [0.30, 0.1194], [0.35, 0.1194], [0.40, 0.1193], [0.45, 0.1193],
  [0.50, 0.1194], [0.55, 0.1193], [0.60, 0.1194], [0.65, 0.1197], [0.70, 0.1202],
  [0.725, 0.1207], [0.75, 0.1215], [0.775, 0.1226], [0.80, 0.1242], [0.825, 0.1266],
  [0.85, 0.1306], [0.875, 0.1368], [0.90, 0.1464], [0.925, 0.1660], [0.95, 0.2054],
  [0.975, 0.2993], [1.00, 0.3803], [1.025, 0.4015], [1.05, 0.4043], [1.075, 0.4034],
  [1.10, 0.4014], [1.125, 0.3987], [1.15, 0.3955], [1.20, 0.3884], [1.25, 0.3810],
  [1.30, 0.3732], [1.35, 0.3657], [1.40, 0.3580], [1.50, 0.3440], [1.55, 0.3376],
  [1.60, 0.3315], [1.65, 0.3260], [1.70, 0.3209], [1.75, 0.3160], [1.80, 0.3117],
  [1.85, 0.3078], [1.90, 0.3042], [1.95, 0.3010], [2.00, 0.2980], [2.05, 0.2951],
  [2.10, 0.2922], [2.15, 0.2892], [2.20, 0.2864], [2.25, 0.2835], [2.30, 0.2807],
  [2.35, 0.2779], [2.40, 0.2752], [2.45, 0.2725], [2.50, 0.2697], [2.55, 0.2670],
  [2.60, 0.2643], [2.65, 0.2615], [2.70, 0.2588], [2.75, 0.2561], [2.80, 0.2533],
  [2.85, 0.2506], [2.90, 0.2479], [2.95, 0.2451], [3.00, 0.2424], [3.50, 0.2122],
  [4.00, 0.1875], [4.50, 0.1669], [5.00, 0.1497],
];

// =============================================================================
// Drag Coefficient Lookup
// =============================================================================

/**
 * Interpolate drag coefficient from a drag table at a given Mach number.
 * Uses linear interpolation between table entries and clamps to table bounds.
 *
 * @param mach - Mach number (velocity / speed of sound)
 * @param table - Drag table as [Mach, Cd] pairs sorted by Mach ascending
 * @returns Interpolated drag coefficient (Cd)
 */
function interpolateDragTable(mach: number, table: [number, number][]): number {
  if (mach <= table[0][0]) return table[0][1];
  if (mach >= table[table.length - 1][0]) return table[table.length - 1][1];

  for (let i = 0; i < table.length - 1; i++) {
    const [m1, cd1] = table[i];
    const [m2, cd2] = table[i + 1];

    if (mach >= m1 && mach <= m2) {
      const t = (mach - m1) / (m2 - m1);
      return cd1 + t * (cd2 - cd1);
    }
  }

  return table[table.length - 1][1];
}

/**
 * Get G1 drag coefficient at the given Mach number.
 * G1 is the standard model for flat-base, spitzer bullets.
 */
function getG1DragCoefficient(mach: number): number {
  return interpolateDragTable(mach, G1_DRAG_TABLE);
}

/**
 * Get G7 drag coefficient at the given Mach number.
 * G7 is preferred for modern boat-tail, tangent ogive bullets (VLD, ELD, etc.).
 */
function getG7DragCoefficient(mach: number): number {
  return interpolateDragTable(mach, G7_DRAG_TABLE);
}

/**
 * Dispatch to the appropriate drag model.
 *
 * @param mach - Mach number
 * @param model - 'g1' or 'g7'
 * @returns Drag coefficient (Cd) for the selected model
 */
function getDragCoefficient(mach: number, model: DragModel): number {
  return model === 'g7' ? getG7DragCoefficient(mach) : getG1DragCoefficient(mach);
}

// =============================================================================
// Velocity-Band BC Interpolation
// =============================================================================

/**
 * Get the effective ballistic coefficient for the current velocity and drag model.
 *
 * If the ammunition defines velocity-band BCs (`bcBands`), we select the band
 * whose velocity threshold is closest below the current velocity. Bands are
 * expected to be sorted descending by velocityThreshold: the first band where
 * velocity >= threshold is used. If velocity is below all thresholds, the
 * last (lowest) band is used.
 *
 * Otherwise, falls back to the single-value BC appropriate for the drag model:
 * - G7: use `bcG7` if available, else `ballisticCoefficient`
 * - G1: use `ballisticCoefficient`
 *
 * @param ammo - Ammunition data
 * @param velocity - Current bullet velocity in m/s
 * @param model - Drag model being used
 * @returns Effective BC for drag calculation
 */
function getBCForVelocity(ammo: AmmunitionData, velocity: number, model: DragModel): number {
  if (ammo.bcBands && ammo.bcBands.length > 0) {
    for (const band of ammo.bcBands) {
      if (velocity >= band.velocityThreshold) {
        return band.bc;
      }
    }
    // Velocity below all thresholds — use the last (lowest) band
    return ammo.bcBands[ammo.bcBands.length - 1].bc;
  }

  if (model === 'g7' && ammo.bcG7 != null) {
    return ammo.bcG7;
  }

  return ammo.ballisticCoefficient;
}

// =============================================================================
// Atmospheric Model
// =============================================================================

/**
 * Temperature-dependent speed of sound in air.
 *
 * Formula: c = 331.3 * sqrt(1 + T/273.15)
 * where T is temperature in Celsius.
 *
 * At 15 deg C this gives ~340.3 m/s (ICAO standard).
 *
 * @param temperatureCelsius - Air temperature in degrees Celsius
 * @returns Speed of sound in m/s
 */
function getSpeedOfSound(temperatureCelsius: number): number {
  return 331.3 * Math.sqrt(1 + temperatureCelsius / 273.15);
}

/**
 * Calculate air density accounting for temperature, pressure, and humidity.
 *
 * Uses the virtual temperature method to properly handle water vapor:
 * moist air is less dense than dry air at the same T and P because water
 * vapor (M=18 g/mol) is lighter than N2 (28) and O2 (32).
 *
 * The saturation vapor pressure is computed using the Buck equation (1981),
 * which is accurate to within 0.05% over -40 to +50 deg C.
 *
 * Formula:
 *   rho = Pd/(Rd*T) + e/(Rv*T)
 * where:
 *   Pd = dry air partial pressure = P - e
 *   e  = actual vapor pressure = humidity * es
 *   es = saturation vapor pressure (Buck equation)
 *   Rd = 287.058 J/(kg*K) — specific gas constant, dry air
 *   Rv = 461.495 J/(kg*K) — specific gas constant, water vapor
 *   T  = absolute temperature (K)
 *
 * @param env - Environmental conditions (temperature in C, pressure in hPa, humidity 0-1)
 * @returns Air density in kg/m^3
 */
function calculateAirDensity(env: BallisticEnvironment): number {
  const T = env.temperature + 273.15; // Kelvin
  const P = env.pressure * 100; // hPa to Pa

  // Saturation vapor pressure (Buck equation, 1981)
  const es = 611.21 * Math.exp(
    (18.678 - env.temperature / 234.5) *
    (env.temperature / (257.14 + env.temperature))
  );

  // Actual vapor pressure (humidity is 0-1 scale)
  const e = env.humidity * es;

  // Dry air partial pressure
  const Pd = P - e;

  // Specific gas constants
  const Rd = 287.058; // dry air, J/(kg*K)
  const Rv = 461.495; // water vapor, J/(kg*K)

  return (Pd / (Rd * T)) + (e / (Rv * T));
}

/**
 * Calculate pressure from altitude using the barometric formula.
 * Used as fallback when no barometer reading is available.
 *
 * Formula: P = P0 * (1 - L*h / T0)^5.255
 * where:
 *   P0 = sea level pressure (default 1013.25 hPa)
 *   L  = temperature lapse rate = 0.0065 K/m
 *   T0 = sea level temperature = 288.15 K (15 deg C)
 *   h  = altitude in meters
 *
 * Valid for altitudes up to ~11,000 m (troposphere).
 *
 * @param altitude - Altitude in meters above sea level
 * @param seaLevelPressure - Sea level pressure in hPa (default: 1013.25)
 * @returns Pressure in hPa at the given altitude
 */
export function calculatePressureFromAltitude(
  altitude: number,
  seaLevelPressure: number = 1013.25
): number {
  const T0 = 288.15;
  const L = 0.0065;
  const exponent = 5.255;

  return seaLevelPressure * Math.pow(1 - (L * altitude) / T0, exponent);
}

// =============================================================================
// Standard Environment Constructor
// =============================================================================

/**
 * Create a standard environment with optional overrides.
 * Defaults are ICAO standard atmosphere values from constants.ts.
 */
export function createStandardEnvironment(
  windSpeed: number = 0,
  windAngle: number = 90,
  overrides?: Partial<Omit<BallisticEnvironment, 'windSpeed' | 'windAngle'>>
): BallisticEnvironment {
  return {
    ...STANDARD_ATMOSPHERE,
    ...overrides,
    windSpeed,
    windAngle,
  };
}

// =============================================================================
// Drag Deceleration
// =============================================================================

/**
 * Calculate drag deceleration magnitude for a bullet.
 *
 * The drag equation for a projectile referenced to a standard drag model:
 *   a_drag = K * (rho / rho_std) * (Cd / BC) * v^2
 *
 * where:
 *   K        = DRAG_CONSTANT = rho_std / (2 * SD_ref) = 0.000871
 *   rho      = local air density (kg/m^3)
 *   rho_std  = standard air density = 1.225 kg/m^3
 *   Cd       = drag coefficient from the selected model at current Mach
 *   BC       = ballistic coefficient (dimensionless, referenced to same model)
 *   v        = bullet speed relative to the air mass (m/s)
 *
 * @param velocity - Bullet speed relative to air (m/s)
 * @param bc - Ballistic coefficient for the active drag model
 * @param airDensity - Current air density (kg/m^3)
 * @param speedOfSound - Local speed of sound (m/s)
 * @param dragModel - Which drag model to use ('g1' or 'g7')
 * @returns Drag deceleration magnitude (m/s^2), always >= 0
 */
function calculateDrag(
  velocity: number,
  bc: number,
  airDensity: number,
  speedOfSound: number,
  dragModel: DragModel
): number {
  const mach = velocity / speedOfSound;
  const cd = getDragCoefficient(mach, dragModel);
  const densityRatio = airDensity / STANDARD_AIR_DENSITY;

  return DRAG_CONSTANT * densityRatio * (cd / bc) * velocity * velocity;
}

// =============================================================================
// Iterative Zero Angle Solver
// =============================================================================

/**
 * Simulate a simplified trajectory (no wind) and return the bullet's y-position
 * at the specified downrange distance. Used by the zero-angle solver.
 *
 * The coordinate system:
 *   x = downrange (horizontal)
 *   y = vertical (positive up)
 *   Bullet starts at (0, 0) with launch angle `angle` above horizontal.
 *
 * @param ammo - Ammunition data
 * @param distance - Target downrange distance (m)
 * @param angle - Launch angle above horizontal (radians)
 * @param airDensity - Air density (kg/m^3)
 * @param speedOfSound - Speed of sound (m/s)
 * @param dragModel - Drag model to use
 * @returns Vertical position (m) at the target distance; positive = above bore axis
 */
function simulateTrajectoryForZero(
  ammo: AmmunitionData,
  distance: number,
  angle: number,
  airDensity: number,
  speedOfSound: number,
  dragModel: DragModel
): number {
  const v0 = ammo.muzzleVelocity;
  let x = 0;
  let y = 0;
  let vx = v0 * Math.cos(angle);
  let vy = v0 * Math.sin(angle);

  const dt = 0.001; // 1 ms timestep

  while (x < distance) {
    const v = Math.sqrt(vx * vx + vy * vy);
    const bc = getBCForVelocity(ammo, v, dragModel);
    const drag = calculateDrag(v, bc, airDensity, speedOfSound, dragModel);

    // Drag opposes velocity direction
    const dragX = (drag * vx) / v;
    const dragY = (drag * vy) / v;

    vx -= dragX * dt;
    vy -= (GRAVITY + dragY) * dt;

    x += vx * dt;
    y += vy * dt;
  }

  return y;
}

/**
 * Calculate the barrel launch angle needed to zero at the given distance.
 *
 * Uses binary search to find the angle where the bullet's trajectory
 * intersects the sight line at the zero distance. For GEE (Gunstigste
 * Einschussentfernung), the target is 4 cm above sight line at zero distance.
 *
 * The sight sits above the bore by `sightHeight`. At zero distance, the
 * bullet path (measured from bore) must equal sightHeight + targetHeight
 * so that the bullet hits where the sight is aimed (or 4cm high for GEE).
 *
 * Convergence: 30 iterations of binary search give precision of approximately
 * (high-low)/2^30 ~ 0.01 / 2^30 < 0.00001 mm — far beyond needed accuracy.
 *
 * @param profile - Rifle profile (contains zero distance, sight height, zero type, ammo)
 * @param environment - Environmental conditions
 * @returns Launch angle in radians
 */
function calculateZeroAngle(
  profile: RifleProfile,
  environment: BallisticEnvironment
): number {
  const zeroDistance = profile.zeroDistance;
  const sightHeight = profile.sightHeight / 100; // cm to meters
  const dragModel = profile.dragModel || 'g1';

  // For GEE, bullet hits 4 cm above point of aim at zero distance
  const geeOffset = profile.zeroType === 'gee' ? 0.04 : 0;

  // The bullet must reach this height (from bore axis) at zero distance
  // so it appears at targetHeight above the sight's point of aim
  const targetHeight = sightHeight + geeOffset;

  const airDensity = calculateAirDensity(environment);
  const speedOfSound = getSpeedOfSound(environment.temperature);

  // Binary search for launch angle
  let low = 0; // 0 radians — shooting flat
  let high = 0.02; // ~1.15 degrees — sufficient for 500m zero

  for (let i = 0; i < 30; i++) {
    const mid = (low + high) / 2;
    const impact = simulateTrajectoryForZero(
      profile.ammunition,
      zeroDistance,
      mid,
      airDensity,
      speedOfSound,
      dragModel
    );

    if (impact < targetHeight) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return (low + high) / 2;
}

// =============================================================================
// Main Trajectory Calculation
// =============================================================================

/**
 * Calculate the full ballistic trajectory from muzzle to target distance.
 *
 * Coordinate system:
 *   x = downrange (meters, horizontal)
 *   y = vertical (meters, positive up)
 *   z = lateral (meters, positive right)
 *
 * The bullet starts at (0, -sightHeight, 0) — below the sight line by the
 * sight height. The zero angle is computed so the bullet crosses the sight
 * line at the zero distance.
 *
 * Wind model: The drag force acts on the bullet's velocity RELATIVE to the
 * air mass. Wind shifts the air, so relative velocity = bullet velocity - wind.
 * This naturally produces both crosswind drift and head/tailwind drag effects
 * without any empirical coefficients.
 *
 * Wind angle convention (same as BallisticEnvironment):
 *   0 deg   = pure headwind (slows bullet)
 *   90 deg  = right crosswind (pushes bullet left, but drift shows as positive right)
 *   180 deg = pure tailwind (reduces drag)
 *
 * Adaptive timestep: Uses 0.5 ms steps in the transonic region (Mach 0.9-1.1)
 * where drag changes rapidly, and 1 ms elsewhere.
 *
 * @param profile - Rifle profile with ammunition, zero settings, drag model
 * @param targetDistance - Distance to target in meters
 * @param environment - Environmental conditions (temperature, pressure, humidity, wind)
 * @returns BallisticResult with drop, drift, time, velocity, energy, machAtTarget
 */
export function calculateTrajectory(
  profile: RifleProfile,
  targetDistance: number,
  environment: BallisticEnvironment
): BallisticResult {
  const ammo = profile.ammunition;
  const v0 = ammo.muzzleVelocity;
  const bulletMass = ammo.bulletWeight * GRAINS_TO_KG;
  const sightHeight = profile.sightHeight / 100; // cm to meters
  const dragModel = profile.dragModel || 'g1';

  // Atmospheric properties
  const airDensity = calculateAirDensity(environment);
  const speedOfSound = getSpeedOfSound(environment.temperature);

  // Zero angle — the angle that makes the bullet hit where aimed at zero distance
  const zeroAngle = calculateZeroAngle(profile, environment);

  // Wind components (m/s)
  // windAngle: 0 = headwind, 90 = right crosswind, 180 = tailwind
  const windRad = (environment.windAngle * Math.PI) / 180;
  const headWind = environment.windSpeed * Math.cos(windRad); // positive = headwind
  const crossWind = environment.windSpeed * Math.sin(windRad); // positive = from right

  // Initial state — bullet starts at bore axis, sightHeight below sight line
  let x = 0;
  let y = -sightHeight;
  let z = 0;
  let vx = v0 * Math.cos(zeroAngle);
  let vy = v0 * Math.sin(zeroAngle);
  let vz = 0;
  let t = 0;

  // Integration loop — advance until we reach target distance or 5s max
  while (x < targetDistance && t < 5) {
    // Relative velocity: bullet velocity minus wind velocity in ground frame.
    // headWind is positive when blowing toward shooter (opposing bullet),
    // so subtract it from vx to get relative airspeed.
    const vxRel = vx - headWind;
    const vyRel = vy; // wind is horizontal only
    const vzRel = vz - crossWind;
    const vRel = Math.sqrt(vxRel * vxRel + vyRel * vyRel + vzRel * vzRel);

    // Adaptive timestep: finer near transonic for accuracy
    const mach = vRel / speedOfSound;
    const dt = (mach > 0.9 && mach < 1.1) ? 0.0005 : 0.001;

    // Get velocity-dependent BC
    const bc = getBCForVelocity(ammo, vRel, dragModel);

    // Drag deceleration magnitude (acts on relative velocity vector)
    const drag = calculateDrag(vRel, bc, airDensity, speedOfSound, dragModel);

    // Decompose drag into components along relative velocity direction
    const dragX = (drag * vxRel) / vRel;
    const dragY = (drag * vyRel) / vRel;
    const dragZ = (drag * vzRel) / vRel;

    // Update velocities
    // Drag opposes motion relative to air; gravity is absolute
    vx -= dragX * dt;
    vy -= (GRAVITY + dragY) * dt;
    vz -= dragZ * dt;

    // Update positions
    x += vx * dt;
    y += vy * dt;
    z += vz * dt;

    t += dt;
  }

  // Results
  // Drop: how far below the sight line the bullet is. y is negative when below,
  // so -y is positive when below the sight line. Convert m to cm.
  const drop = -y * 100;

  // Velocity magnitude at target (all three components)
  const velocity = Math.sqrt(vx * vx + vy * vy + vz * vz);

  // Kinetic energy at target (Joules)
  const energy = 0.5 * bulletMass * velocity * velocity;

  // Mach number at target
  const machAtTarget = velocity / speedOfSound;

  return {
    drop: Math.round(drop * 10) / 10,
    drift: Math.round(z * 100 * 10) / 10, // m to cm, positive = right
    time: Math.round(t * 1000) / 1000, // round to ms
    velocity: Math.round(velocity),
    energy: Math.round(energy),
    machAtTarget: Math.round(machAtTarget * 100) / 100,
  };
}

// =============================================================================
// Unit Conversion Helpers
// =============================================================================

/**
 * Convert centimeters to MOA (Minute of Angle).
 * 1 MOA = 1.047 inches at 100 yards, or approximately 2.908 cm at 100 m.
 * MOA scales linearly with distance.
 *
 * @param cm - Value in centimeters
 * @param distance - Distance in meters (must be > 0)
 * @returns Value in MOA
 */
export function cmToMOA(cm: number, distance: number): number {
  const moaPerCmAt100m = 1 / 2.908;
  const distanceFactor = distance / 100;
  return cm * moaPerCmAt100m / distanceFactor;
}

/**
 * Convert centimeters to MIL (milliradians).
 * 1 MIL = 10 cm at 100 m (by definition in the ERAD/NATO convention).
 * MIL scales linearly with distance.
 *
 * @param cm - Value in centimeters
 * @param distance - Distance in meters (must be > 0)
 * @returns Value in MIL
 */
export function cmToMIL(cm: number, distance: number): number {
  const milPerCmAt100m = 0.1;
  const distanceFactor = distance / 100;
  return cm * milPerCmAt100m / distanceFactor;
}

/**
 * Format a ballistic value (drop/drift) in the specified unit system.
 *
 * @param cm - Value in centimeters
 * @param distance - Distance in meters
 * @param unit - Target unit: 'cm', 'moa', or 'mil'
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with unit suffix
 */
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
