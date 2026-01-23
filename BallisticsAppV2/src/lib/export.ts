import { RifleProfile, BallisticResult } from '../types';
import { calculateTrajectory, createStandardEnvironment, formatValue } from './ballistics';
import { Share, Alert, Platform } from 'react-native';

// Lazy load clipboard to avoid crash if native module not available
let Clipboard: typeof import('expo-clipboard') | null = null;
try {
  Clipboard = require('expo-clipboard');
} catch {
  console.warn('expo-clipboard not available');
}

// Standard distances for range card export
const RANGE_DISTANCES = [50, 100, 150, 200, 250, 300];

interface ExportOptions {
  profile: RifleProfile;
  windSpeed?: number;
  windAngle?: number;
  unit: 'cm' | 'moa' | 'mil';
}

interface RangeRow {
  distance: number;
  result: BallisticResult;
}

// Generate formatted text for range card
export function generateRangeCardText(options: ExportOptions): string {
  const { profile, windSpeed = 0, windAngle = 90, unit } = options;
  const environment = createStandardEnvironment(windSpeed, windAngle);

  const rangeData: RangeRow[] = RANGE_DISTANCES.map(distance => ({
    distance,
    result: calculateTrajectory(profile, distance, environment),
  }));

  const lines: string[] = [];

  // Header
  lines.push('═══════════════════════════════════');
  lines.push('         SCHUSSTAFEL');
  lines.push('       Ostermayer AG');
  lines.push('═══════════════════════════════════');
  lines.push('');

  // Profile info
  lines.push(`Profil: ${profile.name}`);
  lines.push(`Kaliber: ${profile.caliber}`);
  lines.push(`Munition: ${profile.ammunition.name}`);
  lines.push(`Geschossgewicht: ${profile.ammunition.bulletWeight} gr`);
  lines.push(`V0: ${profile.ammunition.muzzleVelocity} m/s`);
  lines.push(`BC (G1): ${profile.ammunition.ballisticCoefficient}`);
  lines.push(`Zero: ${profile.zeroDistance}m ${profile.zeroType === 'gee' ? '(GEE +4cm)' : ''}`);
  lines.push(`ZF-Hohe: ${profile.sightHeight} cm`);
  lines.push('');

  // Wind conditions
  if (windSpeed > 0) {
    lines.push(`Wind: ${windSpeed} m/s | ${windAngle}°`);
    lines.push('');
  }

  // Table header
  const unitLabel = unit.toUpperCase();
  lines.push('───────────────────────────────────');
  lines.push(` Dist  │  Hohe  │ Seite  │  V   │  E `);
  lines.push(`  (m)  │ (${unitLabel.padEnd(3)}) │ (${unitLabel.padEnd(3)}) │(m/s) │ (J) `);
  lines.push('───────────────────────────────────');

  // Data rows
  rangeData.forEach(row => {
    const drop = formatDropValue(row.result.drop, row.distance, unit);
    const drift = formatDriftValue(row.result.drift, row.distance, unit);
    const distStr = row.distance.toString().padStart(4);
    const dropStr = drop.padStart(6);
    const driftStr = drift.padStart(6);
    const velStr = row.result.velocity.toString().padStart(4);
    const energyStr = row.result.energy.toString().padStart(4);

    const marker = row.distance === profile.zeroDistance ? '*' : ' ';
    lines.push(`${marker}${distStr} │${dropStr} │${driftStr} │${velStr} │${energyStr}`);
  });

  lines.push('───────────────────────────────────');
  lines.push('');

  // Legend
  lines.push('Legende:');
  lines.push('+ = uber Ziel | - = unter Ziel');
  lines.push('R = rechts | L = links');
  lines.push('* = Einschussentfernung');
  lines.push('');
  lines.push('Generiert mit Ostermayer AG App');

  return lines.join('\n');
}

// Format drop value for export
function formatDropValue(drop: number, distance: number, unit: 'cm' | 'moa' | 'mil'): string {
  if (unit === 'cm') {
    const prefix = drop > 0 ? '-' : '+';
    return `${prefix}${Math.abs(drop).toFixed(1)}`;
  }
  const value = formatValue(drop, distance, unit, 1);
  return value.replace(` ${unit.toUpperCase()}`, '');
}

// Format drift value for export
function formatDriftValue(drift: number, distance: number, unit: 'cm' | 'moa' | 'mil'): string {
  if (Math.abs(drift) < 0.1) return '0';

  if (unit === 'cm') {
    const prefix = drift > 0 ? 'R' : 'L';
    return `${prefix}${Math.abs(drift).toFixed(1)}`;
  }

  const value = formatValue(Math.abs(drift), distance, unit, 1);
  const numValue = value.replace(` ${unit.toUpperCase()}`, '');
  const prefix = drift > 0 ? 'R' : 'L';
  return `${prefix}${numValue}`;
}

// Copy range card to clipboard
export async function copyRangeCardToClipboard(options: ExportOptions): Promise<boolean> {
  try {
    const text = generateRangeCardText(options);
    if (Clipboard?.setStringAsync) {
      await Clipboard.setStringAsync(text);
      return true;
    }
    // Fallback: use share instead
    await Share.share({ message: text, title: `Schusstafel - ${options.profile.name}` });
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

// Share range card via system share sheet
export async function shareRangeCard(options: ExportOptions): Promise<boolean> {
  try {
    const text = generateRangeCardText(options);

    const result = await Share.share({
      message: text,
      title: `Schusstafel - ${options.profile.name}`,
    });

    return result.action === Share.sharedAction;
  } catch (error) {
    console.error('Failed to share:', error);
    return false;
  }
}

// Show export options to user
export async function showExportOptions(options: ExportOptions): Promise<void> {
  Alert.alert(
    'Schusstafel exportieren',
    'Wahlen Sie eine Export-Option:',
    [
      {
        text: 'Abbrechen',
        style: 'cancel',
      },
      {
        text: 'Kopieren',
        onPress: async () => {
          const success = await copyRangeCardToClipboard(options);
          if (success) {
            Alert.alert('Kopiert', 'Schusstafel wurde in die Zwischenablage kopiert.');
          } else {
            Alert.alert('Fehler', 'Kopieren fehlgeschlagen.');
          }
        },
      },
      {
        text: 'Teilen',
        onPress: async () => {
          await shareRangeCard(options);
        },
      },
    ]
  );
}
