import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Header, SliderInput } from '../../src/components';
import { colors, ZERO_OPTIONS, SLIDER_RANGES } from '../../src/lib/constants';
import { useApp } from '../../src/context/AppContext';

export default function ZeroScreen() {
  const { onboardingState, setOnboardingState } = useApp();

  const handleSelectZero = (distance: number, type: 'standard' | 'gee') => {
    setOnboardingState(prev => ({
      ...prev,
      zeroDistance: distance,
      zeroType: type,
    }));
  };

  const handleSightHeightChange = (value: number) => {
    setOnboardingState(prev => ({
      ...prev,
      sightHeight: value,
    }));
  };

  const handleContinue = () => {
    router.push('/onboarding/summary');
  };

  const selectedKey = `${onboardingState.zeroDistance}-${onboardingState.zeroType}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Einschussdaten"
        subtitle="Schritt 2 von 3"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Einschussentfernung</Text>
        <Text style={styles.instruction}>
          Wahlen Sie Ihre Einschussentfernung und -methode
        </Text>

        {ZERO_OPTIONS.map(option => {
          const optionKey = `${option.distance}-${option.type}`;
          const isSelected = selectedKey === optionKey;

          return (
            <Card
              key={optionKey}
              onPress={() => handleSelectZero(option.distance, option.type)}
              selected={isSelected}
              style={styles.zeroCard}
            >
              <View style={styles.zeroHeader}>
                <Text style={[styles.zeroLabel, isSelected && styles.selectedText]}>
                  {option.label}
                </Text>
                {option.recommended && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>Empfohlen</Text>
                  </View>
                )}
              </View>
              <Text style={styles.zeroDescription}>{option.description}</Text>
            </Card>
          );
        })}

        <View style={styles.sightHeightSection}>
          <Text style={styles.sectionTitle}>Zielfernrohrhohe</Text>
          <Text style={styles.instruction}>
            Hohe der optischen Achse uber der Laufachse
          </Text>

          <Card style={styles.sliderCard}>
            <SliderInput
              label="Hohe uber Lauf"
              value={onboardingState.sightHeight}
              onValueChange={handleSightHeightChange}
              min={SLIDER_RANGES.sightHeight.min}
              max={SLIDER_RANGES.sightHeight.max}
              step={SLIDER_RANGES.sightHeight.step}
              unit=" cm"
            />
          </Card>

          <Text style={styles.hint}>
            Typischerweise 4-5 cm fur Zielfernrohre mit Standardmontage
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Weiter"
          onPress={handleContinue}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 4,
  },
  instruction: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  zeroCard: {
    marginVertical: 6,
  },
  zeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  zeroLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  selectedText: {
    color: colors.forest,
  },
  recommendedBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.forestDark,
  },
  zeroDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sightHeightSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  sliderCard: {
    marginVertical: 8,
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.warmWhite,
  },
});
