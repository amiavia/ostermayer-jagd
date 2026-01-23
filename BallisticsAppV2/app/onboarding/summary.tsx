import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Header } from '../../src/components';
import { colors } from '../../src/lib/constants';
import { useApp } from '../../src/context/AppContext';

export default function SummaryScreen() {
  const { onboardingState, setOnboardingState, addProfile, completeOnboarding, resetOnboarding, setIsAddingProfile } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = (name: string) => {
    setOnboardingState(prev => ({
      ...prev,
      profileName: name,
    }));
  };

  const handleComplete = async () => {
    if (!onboardingState.caliber || !onboardingState.ammunition) {
      Alert.alert('Fehler', 'Bitte wahlen Sie Kaliber und Munition aus');
      return;
    }

    const profileName = onboardingState.profileName.trim() ||
      `${onboardingState.caliber} - ${onboardingState.ammunition.name}`;

    setIsLoading(true);

    try {
      await addProfile({
        name: profileName,
        caliber: onboardingState.caliber,
        ammunition: onboardingState.ammunition,
        zeroDistance: onboardingState.zeroDistance,
        zeroType: onboardingState.zeroType,
        sightHeight: onboardingState.sightHeight,
      });

      await completeOnboarding();
      resetOnboarding();
      setIsAddingProfile(false);

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Fehler', 'Profil konnte nicht gespeichert werden');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Zusammenfassung"
        subtitle="Schritt 3 von 3"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Profilname</Text>
        <Card style={styles.nameCard}>
          <TextInput
            style={styles.nameInput}
            value={onboardingState.profileName}
            onChangeText={handleNameChange}
            placeholder={`${onboardingState.caliber} - ${onboardingState.ammunition?.name || ''}`}
            placeholderTextColor={colors.textSecondary}
          />
        </Card>

        <Text style={styles.sectionTitle}>Ihre Auswahl</Text>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Kaliber</Text>
            <Text style={styles.summaryValue}>{onboardingState.caliber}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Munition</Text>
            <Text style={styles.summaryValue}>{onboardingState.ammunition?.name}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Geschossgewicht</Text>
            <Text style={styles.summaryValue}>{onboardingState.ammunition?.bulletWeight} gr</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Mundungsgeschwindigkeit</Text>
            <Text style={styles.summaryValue}>{onboardingState.ammunition?.muzzleVelocity} m/s</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>BC (G1)</Text>
            <Text style={styles.summaryValue}>{onboardingState.ammunition?.ballisticCoefficient}</Text>
          </View>
        </Card>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Einschussentfernung</Text>
            <Text style={styles.summaryValue}>{onboardingState.zeroDistance}m</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Einschussmethode</Text>
            <Text style={styles.summaryValue}>
              {onboardingState.zeroType === 'gee' ? 'GEE (+4cm)' : 'Standard'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Zielfernrohrhohe</Text>
            <Text style={styles.summaryValue}>{onboardingState.sightHeight} cm</Text>
          </View>
        </Card>

        <View style={styles.noteContainer}>
          <Text style={styles.note}>
            Sie konnen diese Einstellungen jederzeit in Ihrem Profil andern oder weitere Profile hinzufugen.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Profil erstellen"
          onPress={handleComplete}
          loading={isLoading}
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
    marginBottom: 12,
  },
  nameCard: {
    marginBottom: 8,
  },
  nameInput: {
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 4,
  },
  summaryCard: {
    marginVertical: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.forest,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  noteContainer: {
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  note: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.warmWhite,
  },
});
