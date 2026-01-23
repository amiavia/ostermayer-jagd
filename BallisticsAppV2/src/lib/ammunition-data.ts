import { CaliberGroup } from '../types';

/**
 * VALIDATED AMMUNITION DATABASE
 *
 * All ballistic data has been verified against official manufacturer specifications.
 * Data sources are documented in the app settings under "Datenquellen".
 *
 * IMPORTANT: Actual performance may vary based on:
 * - Barrel length (data based on 24" test barrels unless noted)
 * - Environmental conditions (temperature, altitude, humidity)
 * - Individual rifle characteristics
 *
 * Last verified: January 2025
 */
export const CALIBER_DATABASE: CaliberGroup[] = [
  {
    caliber: '.308 Winchester',
    description: 'Vielseitig fur Mitteldistanz',
    ammunition: [
      {
        // Source: Hornady American Whitetail 80904
        // Ref: hornady.com/ammunition/rifle/308-win-150-gr-interlock-sp-american-whitetail
        name: '.308 Win 150gr InterLock SP',
        bulletWeight: 150,
        ballisticCoefficient: 0.338, // G1, Hornady official
        muzzleVelocity: 862, // 2820 fps, 24" barrel
      },
      {
        // Source: Hornady American Whitetail 80904
        // Ref: hornady.com/ammunition/rifle/308-win-165-gr-interlock-sp-american-whitetail
        name: '.308 Win 165gr InterLock SP',
        bulletWeight: 165,
        ballisticCoefficient: 0.435, // G1, Hornady official
        muzzleVelocity: 823, // 2700 fps, 24" barrel
      },
      {
        // Source: Hornady Precision Hunter
        // Ref: hornady.com/ammunition/rifle/308-win-178-gr-eld-x-precision-hunter
        name: '.308 Win 178gr ELD-X',
        bulletWeight: 178,
        ballisticCoefficient: 0.535, // G1, Hornady official
        muzzleVelocity: 790, // 2600 fps, 24" barrel
      },
    ],
  },
  {
    caliber: '.30-06 Springfield',
    description: 'Klassiker fur grosse Distanzen',
    ammunition: [
      {
        // Source: Federal Fusion F3006FS1
        // Ref: federalpremium.com/rifle/fusion
        name: '.30-06 150gr Fusion',
        bulletWeight: 150,
        ballisticCoefficient: 0.414, // G1, Federal official
        muzzleVelocity: 896, // 2940 fps, 24" barrel
      },
      {
        // Source: Federal Fusion F3006FS2
        // Ref: federalpremium.com/rifle/fusion/11-F3006FS2.html
        name: '.30-06 165gr Fusion',
        bulletWeight: 165,
        ballisticCoefficient: 0.444, // G1, Federal official
        muzzleVelocity: 850, // 2790 fps, 24" barrel
      },
      {
        // Source: Hornady American Whitetail
        // Ref: hornady.com/ammunition/rifle/30-06-spfld-180-gr-interlock-sp-american-whitetail
        name: '.30-06 180gr InterLock SP',
        bulletWeight: 180,
        ballisticCoefficient: 0.452, // G1, Hornady official
        muzzleVelocity: 810, // 2660 fps, 24" barrel
      },
    ],
  },
  {
    caliber: '6.5 Creedmoor',
    description: 'Prazision und niedrige Ruckstoss',
    ammunition: [
      {
        // Source: Hornady American Whitetail
        // Ref: hornady.com/ammunition/rifle/6-5-creedmoor-129-gr-interlock-american-whitetail
        name: '6.5 CM 129gr InterLock',
        bulletWeight: 129,
        ballisticCoefficient: 0.485, // G1, Hornady official
        muzzleVelocity: 847, // 2780 fps, 24" barrel
      },
      {
        // Source: Hornady ELD Match 81500
        // Ref: hornady.com/ammunition/rifle/6-5-creedmoor-140-gr-eld-match
        name: '6.5 CM 140gr ELD Match',
        bulletWeight: 140,
        ballisticCoefficient: 0.646, // G1, Hornady official
        muzzleVelocity: 826, // 2710 fps, 24" barrel
      },
    ],
  },
  {
    caliber: '7mm Remington Magnum',
    description: 'Langstrecken Magnum',
    ammunition: [
      {
        // Source: Hornady American Whitetail
        // Ref: hornady.com/ammunition/rifle/7mm-rem-mag-154-gr-interlock-sp-american-whitetail
        name: '7mm RM 154gr InterLock SP',
        bulletWeight: 154,
        ballisticCoefficient: 0.433, // G1, Hornady official
        muzzleVelocity: 930, // 3050 fps, 24" barrel
      },
      {
        // Source: Hornady Precision Hunter
        // Ref: hornady.com/ammunition/rifle/7mm-rem-mag-162-gr-eld-x-precision-hunter
        name: '7mm RM 162gr ELD-X',
        bulletWeight: 162,
        ballisticCoefficient: 0.631, // G1, Hornady official
        muzzleVelocity: 899, // 2950 fps, 24" barrel
      },
    ],
  },
  {
    caliber: '.270 Winchester',
    description: 'Flache Flugbahn',
    ammunition: [
      {
        // Source: Hornady American Whitetail
        // Ref: hornady.com/ammunition/rifle/270-win-130-gr-interlock-sp-american-whitetail
        name: '.270 Win 130gr InterLock SP',
        bulletWeight: 130,
        ballisticCoefficient: 0.409, // G1, Hornady official
        muzzleVelocity: 945, // 3100 fps, 24" barrel
      },
      {
        // Source: Hornady Precision Hunter
        // Ref: hornady.com/ammunition/rifle/270-win-145-gr-eld-x-precision-hunter
        name: '.270 Win 145gr ELD-X',
        bulletWeight: 145,
        ballisticCoefficient: 0.536, // G1, Hornady official
        muzzleVelocity: 869, // 2850 fps, 24" barrel
      },
    ],
  },
  {
    caliber: '9.3x62mm',
    description: 'Klassisch fur Schwarzwild',
    ammunition: [
      {
        // Source: Norma Oryx 20193072
        // Ref: norma-ammunition.com/en-gb/products/dedicated-hunting/centerfire-rifle/norma-oryx/norma-oryx-93-x-62-232gr---20193072
        // Verified: January 2025
        name: '9.3x62 232gr Oryx',
        bulletWeight: 232,
        ballisticCoefficient: 0.267, // G1, Norma official website
        muzzleVelocity: 800, // 2625 fps, Norma official
      },
      {
        // Source: Norma Oryx 20193132
        // Ref: norma-ammunition.com/en-gb/products/dedicated-hunting/centerfire-rifle/norma-oryx/norma-oryx-93-x-62-285gr---20193132
        name: '9.3x62 285gr Oryx',
        bulletWeight: 285,
        ballisticCoefficient: 0.328, // G1, Norma official
        muzzleVelocity: 730, // 2395 fps, Norma official
      },
    ],
  },
  {
    caliber: '.243 Winchester',
    description: 'Rehwild und Niederwild',
    ammunition: [
      {
        // Source: Hornady American Whitetail
        // Ref: hornady.com/ammunition/rifle/243-win-100-gr-interlock-btsp-american-whitetail
        name: '.243 Win 100gr InterLock',
        bulletWeight: 100,
        ballisticCoefficient: 0.405, // G1, Hornady official
        muzzleVelocity: 899, // 2950 fps, 24" barrel
      },
      {
        // Source: Hornady Precision Hunter
        // Ref: hornady.com/ammunition/rifle/243-win-90-gr-eld-x-precision-hunter
        name: '.243 Win 90gr ELD-X',
        bulletWeight: 90,
        ballisticCoefficient: 0.409, // G1, Hornady official
        muzzleVelocity: 930, // 3050 fps, 24" barrel
      },
    ],
  },
  {
    caliber: '8x57 IS (8mm Mauser)',
    description: 'Deutscher Klassiker',
    ammunition: [
      {
        // Source: Norma Oryx 20180042
        // Ref: norma-ammunition.com/en-gb/products/dedicated-hunting/centerfire-rifle/norma-oryx/norma-oryx-8x57-js-196gr---20180042
        // Verified: January 2025
        name: '8x57 IS 196gr Oryx',
        bulletWeight: 196,
        ballisticCoefficient: 0.331, // G1, Norma official website
        muzzleVelocity: 770, // 2526 fps, Norma official
      },
      {
        // Source: Hornady Vintage Match
        // Ref: hornady.com/ammunition/rifle/8x57-js-196gr-bthp-vintage-match
        name: '8x57 IS 196gr BTHP Match',
        bulletWeight: 196,
        ballisticCoefficient: 0.525, // G1, Hornady official
        muzzleVelocity: 780, // 2560 fps, Hornady official
      },
    ],
  },
];

// Helper to get caliber by name
export function getCaliberByName(name: string): CaliberGroup | undefined {
  return CALIBER_DATABASE.find(c => c.caliber === name);
}

// Helper to get ammunition count text
export function getAmmoCountText(count: number): string {
  return count === 1 ? '1 Ladung verfugbar' : `${count} Ladungen verfugbar`;
}
