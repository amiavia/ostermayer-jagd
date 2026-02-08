import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../lib/constants';
import { BallisticResult } from '../types';
import { formatValue } from '../lib/ballistics';

interface ResultDisplayProps {
  result: BallisticResult;
  distance: number;
  unit: 'cm' | 'moa' | 'mil';
}

export function ResultDisplay({ result, distance, unit }: ResultDisplayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.mainResult}>
        <Text style={styles.mainLabel}>Haltepunkt</Text>
        <Text style={styles.mainValue}>
          {result.drop > 0 ? '+' : ''}{formatValue(result.drop, distance, unit)}
        </Text>
        <Text style={styles.mainDescription}>
          {result.drop > 0 ? 'uber' : 'unter'} Zielpunkt
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.secondaryResults}>
        <View style={styles.resultItem}>
          <Text style={styles.itemLabel}>Windabdrift</Text>
          <Text style={styles.itemValue}>
            {result.drift > 0 ? '+' : ''}{formatValue(result.drift, distance, unit)}
          </Text>
        </View>

        <View style={styles.resultItem}>
          <Text style={styles.itemLabel}>Flugzeit</Text>
          <Text style={styles.itemValue}>{result.time}s</Text>
        </View>

        <View style={styles.resultItem}>
          <Text style={styles.itemLabel}>V @ Ziel</Text>
          <Text style={styles.itemValue}>{result.velocity} m/s</Text>
        </View>

        <View style={styles.resultItem}>
          <Text style={styles.itemLabel}>Energie</Text>
          <Text style={styles.itemValue}>{result.energy} J</Text>
        </View>

        <View style={styles.resultItem}>
          <Text style={styles.itemLabel}>Mach @ Ziel</Text>
          <Text style={styles.itemValue}>{result.machAtTarget}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.forestDark,
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
  },
  mainResult: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  mainLabel: {
    fontSize: 14,
    color: colors.goldLight,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mainValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.warmWhite,
    marginVertical: 4,
  },
  mainDescription: {
    fontSize: 14,
    color: colors.goldLight,
    opacity: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.forestLight,
    marginVertical: 16,
  },
  secondaryResults: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resultItem: {
    width: '48%',
    marginVertical: 8,
  },
  itemLabel: {
    fontSize: 12,
    color: colors.goldLight,
    opacity: 0.8,
    marginBottom: 2,
  },
  itemValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.warmWhite,
  },
});
