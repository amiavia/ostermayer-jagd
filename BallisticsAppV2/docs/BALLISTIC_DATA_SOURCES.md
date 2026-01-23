# Ballistic Data Sources & Validation

> **Last Updated:** January 2025
> **App Version:** 1.0.0

---

## Overview

All ballistic data in the Ostermayer Jagd Ballistik Rechner has been validated against official manufacturer specifications. This document serves as the authoritative reference for all ammunition data used in the app.

---

## Calculation Model

### G1 Drag Model
The app uses the **G1 Standard Drag Model** with numerical integration (point-mass trajectory calculation).

**Physical Constants:**
- Gravity: 9.81 m/s²
- Standard Atmosphere (ICAO): 15°C, 1013.25 hPa, sea level
- Air density calculation based on temperature and pressure

**Factors Considered:**
- Gravity
- Air resistance (G1 drag coefficient)
- Air density (temperature, pressure)
- Wind drift (crosswind component)
- Sight height above bore

---

## Validated Ammunition Database

### .308 Winchester

| Load | Weight | BC (G1) | MV (m/s) | MV (fps) | Source |
|------|--------|---------|----------|----------|--------|
| InterLock SP | 150 gr | 0.338 | 862 | 2820 | Hornady |
| InterLock SP | 165 gr | 0.435 | 823 | 2700 | Hornady |
| ELD-X | 178 gr | 0.535 | 790 | 2600 | Hornady |

**Source URLs:**
- https://www.hornady.com/ammunition/rifle/308-win-150-gr-interlock-sp-american-whitetail
- https://www.hornady.com/ammunition/rifle/308-win-165-gr-interlock-sp-american-whitetail
- https://www.hornady.com/ammunition/rifle/308-win-178-gr-eld-x-precision-hunter

---

### .30-06 Springfield

| Load | Weight | BC (G1) | MV (m/s) | MV (fps) | Source |
|------|--------|---------|----------|----------|--------|
| Fusion | 150 gr | 0.414 | 896 | 2940 | Federal |
| Fusion | 165 gr | 0.444 | 850 | 2790 | Federal |
| InterLock SP | 180 gr | 0.452 | 810 | 2660 | Hornady |

**Source URLs:**
- https://www.federalpremium.com/rifle/fusion/11-F3006FS1.html
- https://www.federalpremium.com/rifle/fusion/11-F3006FS2.html
- https://www.hornady.com/ammunition/rifle/30-06-spfld-180-gr-interlock-sp-american-whitetail

---

### 6.5 Creedmoor

| Load | Weight | BC (G1) | MV (m/s) | MV (fps) | Source |
|------|--------|---------|----------|----------|--------|
| InterLock | 129 gr | 0.485 | 847 | 2780 | Hornady |
| ELD Match | 140 gr | 0.646 | 826 | 2710 | Hornady |

**Source URLs:**
- https://www.hornady.com/ammunition/rifle/6-5-creedmoor-129-gr-interlock-american-whitetail
- https://www.hornady.com/ammunition/rifle/6-5-creedmoor-140-gr-eld-match

**Note:** The 140gr ELD Match has an exceptionally high BC due to Hornady's Heat Shield tip technology.

---

### 7mm Remington Magnum

| Load | Weight | BC (G1) | MV (m/s) | MV (fps) | Source |
|------|--------|---------|----------|----------|--------|
| InterLock SP | 154 gr | 0.433 | 930 | 3050 | Hornady |
| ELD-X | 162 gr | 0.631 | 899 | 2950 | Hornady |

**Source URLs:**
- https://www.hornady.com/ammunition/rifle/7mm-rem-mag-154-gr-interlock-sp-american-whitetail
- https://www.hornady.com/ammunition/rifle/7mm-rem-mag-162-gr-eld-x-precision-hunter

---

### .270 Winchester

| Load | Weight | BC (G1) | MV (m/s) | MV (fps) | Source |
|------|--------|---------|----------|----------|--------|
| InterLock SP | 130 gr | 0.409 | 945 | 3100 | Hornady |
| ELD-X | 145 gr | 0.536 | 869 | 2850 | Hornady |

**Source URLs:**
- https://www.hornady.com/ammunition/rifle/270-win-130-gr-interlock-sp-american-whitetail
- https://www.hornady.com/ammunition/rifle/270-win-145-gr-eld-x-precision-hunter

---

### 9.3x62mm

| Load | Weight | BC (G1) | MV (m/s) | MV (fps) | Source |
|------|--------|---------|----------|----------|--------|
| Oryx | 232 gr | **0.267** | 800 | 2625 | Norma |
| Oryx | 285 gr | 0.328 | 730 | 2395 | Norma |

**Source URLs:**
- https://www.norma-ammunition.com/en-gb/products/dedicated-hunting/centerfire-rifle/norma-oryx/norma-oryx-93-x-62-232gr---20193072
- https://www.norma-ammunition.com/en-gb/products/dedicated-hunting/centerfire-rifle/norma-oryx/norma-oryx-93-x-62-285gr---20193132

---

### .243 Winchester

| Load | Weight | BC (G1) | MV (m/s) | MV (fps) | Source |
|------|--------|---------|----------|----------|--------|
| InterLock | 100 gr | 0.405 | 899 | 2950 | Hornady |
| ELD-X | 90 gr | 0.409 | 930 | 3050 | Hornady |

**Source URLs:**
- https://www.hornady.com/ammunition/rifle/243-win-100-gr-interlock-btsp-american-whitetail
- https://www.hornady.com/ammunition/rifle/243-win-90-gr-eld-x-precision-hunter

---

### 8x57 IS (8mm Mauser)

| Load | Weight | BC (G1) | MV (m/s) | MV (fps) | Source |
|------|--------|---------|----------|----------|--------|
| Oryx | 196 gr | **0.331** | 770 | 2526 | Norma |
| BTHP Match | 196 gr | 0.525 | 780 | 2560 | Hornady |

**Source URLs:**
- https://www.norma-ammunition.com/en-gb/products/dedicated-hunting/centerfire-rifle/norma-oryx/norma-oryx-8x57-js-196gr---20180042
- https://www.hornady.com/ammunition/rifle/8x57-js-196gr-bthp-vintage-match

---

## Primary Data Sources

### 1. Hornady Manufacturing, Inc.
- **Website:** https://www.hornady.com
- **Ballistic Calculator:** https://www.hornady.com/4dof
- **Data Used:** G1 BC, muzzle velocity, sectional density
- **Test Barrel:** 24 inches (610 mm)
- **Product Lines:** American Whitetail, Precision Hunter, ELD Match

### 2. Federal Premium Ammunition
- **Website:** https://www.federalpremium.com
- **Ballistics:** https://www.federalpremium.com/ballistics-calculator
- **Data Used:** G1 BC, muzzle velocity
- **Test Barrel:** 24 inches (610 mm)
- **Product Lines:** Fusion, Premium, Trophy Bonded

### 3. Norma Precision AB
- **Website:** https://www.norma.cc
- **Data Used:** G1 BC, muzzle velocity
- **Product Lines:** Oryx, Tipstrike, Bondstrike
- **Note:** Primary source for European calibers

### 4. RWS (RUAG Ammotec)
- **Website:** https://www.rws-ammunition.com
- **Data Used:** G1 BC, muzzle velocity
- **Product Lines:** HIT, ID Classic, Evolution
- **Note:** German hunting ammunition specialist

---

## Reference Works

### Bryan Litz - Applied Ballistics
- Industry standard for measured BC values
- Independent testing methodology
- Book: "Applied Ballistics for Long Range Shooting"

### JBM Ballistics
- **Website:** https://www.jbmballistics.com
- Used for trajectory calculation validation
- Reference for drag model implementation

---

## Conversion Formulas

### Velocity
```
fps to m/s: multiply by 0.3048
m/s to fps: multiply by 3.28084
```

### Bullet Weight
```
grains to grams: multiply by 0.0648
grams to grains: multiply by 15.432
```

### Angular Measurements
```
1 MOA at 100m = 2.908 cm
1 MIL at 100m = 10 cm
```

---

## Important Disclaimers

1. **Test Conditions:** All data based on 24" test barrels under ICAO Standard Atmosphere (15°C, 1013.25 hPa, sea level)

2. **Actual Performance Varies:** Results depend on:
   - Barrel length (shorter = lower velocity)
   - Ambient temperature
   - Altitude
   - Humidity
   - Individual rifle characteristics

3. **Verification Required:** Always verify zero and trajectory with your specific rifle/ammunition combination before hunting

4. **Not a Replacement:** This app is a calculation aid, not a replacement for proper zeroing and field verification

---

## Update History

| Date | Version | Changes |
|------|---------|---------|
| Jan 2025 | 1.0.0 | Initial validated database |

---

*Ostermayer Jagd AG - Premium Jagd seit 2019*
