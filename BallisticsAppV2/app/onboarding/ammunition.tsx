import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Header } from '../../src/components';
import { colors } from '../../src/lib/constants';
import { getCaliberByName } from '../../src/lib/ammunition-data';
import { useApp } from '../../src/context/AppContext';
import { AmmunitionData } from '../../src/types';

export default function AmmunitionScreen() {
  const { onboardingState, setOnboardingState } = useApp();
  const caliberGroup = onboardingState.caliber ? getCaliberByName(onboardingState.caliber) : null;

  const handleSelectAmmunition = (ammo: AmmunitionData) => {
    setOnboardingState(prev => ({
      ...prev,
      ammunition: ammo,
    }));
  };

  const handleContinue = () => {
    if (onboardingState.ammunition) {
      router.push('/onboarding/zero');
    }
  };

  if (!caliberGroup) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header
          title="Munition wahlen"
          subtitle="Schritt 2 von 4"
          showBack
          onBack={() => router.back()}
        />
        <View style={styles.errorContent}>
          <Text style={styles.errorText}>Bitte wahlen Sie zuerst ein Kaliber</Text>
          <Button title="Zuruck" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Munition wahlen"
        subtitle="Schritt 2 von 4"
        showBack
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        <View style={styles.caliberInfo}>
          <Text style={styles.caliberLabel}>Gewahltes Kaliber:</Text>
          <Text style={styles.caliberName}>{caliberGroup.caliber}</Text>
        </View>

        <Text style={styles.instruction}>
          Wahlen Sie die Laborierung / Munition
        </Text>

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {caliberGroup.ammunition.map(ammo => (
            <Card
              key={ammo.name}
              onPress={() => handleSelectAmmunition(ammo)}
              selected={onboardingState.ammunition?.name === ammo.name}
              style={styles.ammoCard}
            >
              <Text style={[
                styles.ammoName,
                onboardingState.ammunition?.name === ammo.name && styles.selectedText
              ]}>
                {ammo.name}
              </Text>

              <View style={styles.specs}>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Geschossgewicht</Text>
                  <Text style={styles.specValue}>{ammo.bulletWeight} gr</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>V0</Text>
                  <Text style={styles.specValue}>{ammo.muzzleVelocity} m/s</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>BC (G1)</Text>
                  <Text style={styles.specValue}>{ammo.ballisticCoefficient}</Text>
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <Button
          title="Weiter"
          onPress={handleContinue}
          disabled={!onboardingState.ammunition}
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
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  caliberInfo: {
    backgroundColor: colors.forestLight,
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caliberLabel: {
    fontSize: 14,
    color: colors.warmWhite,
    opacity: 0.8,
    marginRight: 8,
  },
  caliberName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gold,
  },
  instruction: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  ammoCard: {
    marginVertical: 6,
  },
  ammoName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  selectedText: {
    color: colors.forest,
  },
  specs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specItem: {
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.forest,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.warmWhite,
  },
});
