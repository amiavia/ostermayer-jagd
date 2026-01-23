import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors } from '../lib/constants';

interface SliderInputProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  formatValue?: (value: number) => string;
}

export function SliderInput({
  label,
  value,
  onValueChange,
  min,
  max,
  step,
  unit = '',
  formatValue,
}: SliderInputProps) {
  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{displayValue}</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={colors.gold}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.gold}
      />
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>{min}{unit}</Text>
        <Text style={styles.rangeLabel}>{max}{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.forest,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  rangeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
