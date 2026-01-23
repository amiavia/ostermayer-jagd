import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { RifleProfile, BallisticResult } from '../types';
import { calculateTrajectory, createStandardEnvironment, formatValue } from '../lib/ballistics';
import { copyRangeCardToClipboard, shareRangeCard } from '../lib/export';
import { colors } from '../lib/constants';

interface RangeCardProps {
  profile: RifleProfile;
  windSpeed?: number;
  windAngle?: number;
  unit: 'cm' | 'moa' | 'mil';
}

// Standard hunting distances for range card
const RANGE_DISTANCES = [50, 100, 150, 200, 250, 300];

interface RangeRow {
  distance: number;
  result: BallisticResult;
}

export function RangeCard({ profile, windSpeed = 0, windAngle = 90, unit }: RangeCardProps) {
  const [isExporting, setIsExporting] = useState(false);

  const rangeData = useMemo<RangeRow[]>(() => {
    const environment = createStandardEnvironment(windSpeed, windAngle);

    return RANGE_DISTANCES.map(distance => ({
      distance,
      result: calculateTrajectory(profile, distance, environment),
    }));
  }, [profile, windSpeed, windAngle]);

  const getDropDisplay = (row: RangeRow): string => {
    const drop = row.result.drop;
    if (unit === 'cm') {
      const prefix = drop > 0 ? '-' : '+';
      return `${prefix}${Math.abs(drop).toFixed(1)}`;
    }
    return formatValue(drop, row.distance, unit, 1).replace(' ' + unit.toUpperCase(), '');
  };

  const getDriftDisplay = (row: RangeRow): string => {
    const drift = row.result.drift;
    if (Math.abs(drift) < 0.1) return '0';
    if (unit === 'cm') {
      const prefix = drift > 0 ? 'R ' : 'L ';
      return `${prefix}${Math.abs(drift).toFixed(1)}`;
    }
    const value = formatValue(Math.abs(drift), row.distance, unit, 1).replace(' ' + unit.toUpperCase(), '');
    const prefix = drift > 0 ? 'R ' : 'L ';
    return `${prefix}${value}`;
  };

  const handleCopy = async () => {
    setIsExporting(true);
    try {
      const success = await copyRangeCardToClipboard({
        profile,
        windSpeed,
        windAngle,
        unit,
      });
      if (success) {
        Alert.alert('Kopiert', 'Schusstafel wurde in die Zwischenablage kopiert.');
      } else {
        Alert.alert('Fehler', 'Kopieren fehlgeschlagen.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    setIsExporting(true);
    try {
      await shareRangeCard({
        profile,
        windSpeed,
        windAngle,
        unit,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Schusstafel</Text>
        <Text style={styles.subtitle}>
          {profile.name} | {profile.zeroDistance}m {profile.zeroType === 'gee' ? 'GEE' : ''}
        </Text>
      </View>

      {/* Column Headers */}
      <View style={styles.tableHeader}>
        <View style={styles.distanceCol}>
          <Text style={styles.headerText}>Dist.</Text>
        </View>
        <View style={styles.dropCol}>
          <Text style={styles.headerText}>Hohe</Text>
          <Text style={styles.headerUnit}>({unit})</Text>
        </View>
        <View style={styles.driftCol}>
          <Text style={styles.headerText}>Seite</Text>
          <Text style={styles.headerUnit}>({unit})</Text>
        </View>
        <View style={styles.velocityCol}>
          <Text style={styles.headerText}>V</Text>
          <Text style={styles.headerUnit}>(m/s)</Text>
        </View>
        <View style={styles.energyCol}>
          <Text style={styles.headerText}>E</Text>
          <Text style={styles.headerUnit}>(J)</Text>
        </View>
      </View>

      {/* Data Rows */}
      <ScrollView style={styles.tableBody} showsVerticalScrollIndicator={false}>
        {rangeData.map((row, index) => {
          const isZeroDistance = row.distance === profile.zeroDistance;

          return (
            <View
              key={row.distance}
              style={[
                styles.tableRow,
                index % 2 === 0 && styles.tableRowAlt,
                isZeroDistance && styles.tableRowHighlight,
              ]}
            >
              <View style={styles.distanceCol}>
                <Text style={[styles.cellText, styles.distanceText]}>
                  {row.distance}m
                </Text>
              </View>
              <View style={styles.dropCol}>
                <Text style={[
                  styles.cellText,
                  styles.dropText,
                  row.result.drop > 0 ? styles.dropNegative : styles.dropPositive,
                ]}>
                  {getDropDisplay(row)}
                </Text>
              </View>
              <View style={styles.driftCol}>
                <Text style={[styles.cellText, styles.driftText]}>
                  {getDriftDisplay(row)}
                </Text>
              </View>
              <View style={styles.velocityCol}>
                <Text style={styles.cellText}>{row.result.velocity}</Text>
              </View>
              <View style={styles.energyCol}>
                <Text style={styles.cellText}>{row.result.energy}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Wind Info */}
      {windSpeed > 0 && (
        <View style={styles.windInfo}>
          <Text style={styles.windText}>
            Wind: {windSpeed} m/s | {windAngle === 90 ? 'Seitenwind' : `${windAngle}°`}
          </Text>
        </View>
      )}

      {/* Export Buttons */}
      <View style={styles.exportRow}>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleCopy}
          disabled={isExporting}
        >
          <Text style={styles.exportButtonIcon}>📋</Text>
          <Text style={styles.exportButtonText}>Kopieren</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportButton, styles.exportButtonPrimary]}
          onPress={handleShare}
          disabled={isExporting}
        >
          <Text style={styles.exportButtonIcon}>📤</Text>
          <Text style={[styles.exportButtonText, styles.exportButtonTextPrimary]}>
            Teilen
          </Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>
          + = uber Ziel | - = unter Ziel | R = rechts | L = links
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.warmWhite,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    backgroundColor: colors.forestDark,
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.warmWhite,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: colors.goldLight,
    textAlign: 'center',
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.forest,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  headerText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warmWhite,
    textAlign: 'center',
  },
  headerUnit: {
    fontSize: 9,
    color: colors.goldLight,
    textAlign: 'center',
  },
  tableBody: {
    maxHeight: 280,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowAlt: {
    backgroundColor: '#F9F9F7',
  },
  tableRowHighlight: {
    backgroundColor: '#FFFDE7',
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
  },
  distanceCol: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropCol: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driftCol: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  velocityCol: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  energyCol: {
    width: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  distanceText: {
    fontWeight: '600',
  },
  dropText: {
    fontWeight: '700',
    fontSize: 14,
  },
  dropPositive: {
    color: '#2E7D32', // Green for above target
  },
  dropNegative: {
    color: '#C62828', // Red for below target
  },
  driftText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  windInfo: {
    backgroundColor: colors.forestLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  windText: {
    fontSize: 11,
    color: colors.warmWhite,
    textAlign: 'center',
  },
  exportRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#F5F5F3',
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.warmWhite,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exportButtonPrimary: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  exportButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.forest,
  },
  exportButtonTextPrimary: {
    color: colors.warmWhite,
  },
  legend: {
    backgroundColor: colors.cream,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  legendText: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default RangeCard;
