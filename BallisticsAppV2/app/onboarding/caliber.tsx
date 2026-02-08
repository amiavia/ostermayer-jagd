import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Header } from '../../src/components';
import { colors } from '../../src/lib/constants';
import { CALIBER_DATABASE, getAmmoCountText } from '../../src/lib/ammunition-data';
import { useApp } from '../../src/context/AppContext';
import { AmmunitionData } from '../../src/types';

export default function CaliberScreen() {
  const { onboardingState, setOnboardingState } = useApp();
  const [expandedCaliber, setExpandedCaliber] = useState<string | null>(
    onboardingState.caliber || null
  );

  const handleSelectCaliber = (caliber: string) => {
    setExpandedCaliber(caliber);
    setOnboardingState(prev => ({
      ...prev,
      caliber,
      ammunition: null, // Reset ammunition when caliber changes
    }));
  };

  const handleSelectAmmunition = (ammo: AmmunitionData) => {
    setOnboardingState(prev => ({
      ...prev,
      ammunition: ammo,
    }));
  };

  const handleContinue = () => {
    if (onboardingState.caliber && onboardingState.ammunition) {
      router.push('/onboarding/zero');
    }
  };

  const selectedCaliberGroup = CALIBER_DATABASE.find(
    c => c.caliber === expandedCaliber
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Kaliber & Munition"
        subtitle="Schritt 1 von 3"
        showBack
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        <Text style={styles.instruction}>
          Wahlen Sie das Kaliber und die Laborierung Ihrer Jagdwaffe
        </Text>

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {CALIBER_DATABASE.map(caliberGroup => {
            const isExpanded = expandedCaliber === caliberGroup.caliber;
            const isSelected = onboardingState.caliber === caliberGroup.caliber;

            return (
              <View key={caliberGroup.caliber}>
                <Card
                  onPress={() => handleSelectCaliber(caliberGroup.caliber)}
                  selected={isSelected}
                  style={styles.caliberCard}
                >
                  <View style={styles.caliberHeader}>
                    <View style={styles.caliberInfo}>
                      <Text style={[
                        styles.caliberName,
                        isSelected && styles.selectedText
                      ]}>
                        {caliberGroup.caliber}
                      </Text>
                      <Text style={styles.caliberDescription}>
                        {caliberGroup.description}
                      </Text>
                    </View>
                    <View style={styles.expandIndicator}>
                      <Text style={[
                        styles.expandIcon,
                        isExpanded && styles.expandIconRotated
                      ]}>
                        ▼
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.ammoCount}>
                    {getAmmoCountText(caliberGroup.ammunition.length)}
                  </Text>
                </Card>

                {/* Ammunition options - shown when caliber is expanded */}
                {isExpanded && selectedCaliberGroup && (
                  <View style={styles.ammunitionContainer}>
                    {selectedCaliberGroup.ammunition.map(ammo => {
                      const isAmmoSelected =
                        onboardingState.ammunition?.name === ammo.name;

                      return (
                        <TouchableOpacity
                          key={ammo.name}
                          style={[
                            styles.ammoCard,
                            isAmmoSelected && styles.ammoCardSelected,
                          ]}
                          onPress={() => handleSelectAmmunition(ammo)}
                        >
                          <View style={styles.ammoHeader}>
                            <Text style={[
                              styles.ammoName,
                              isAmmoSelected && styles.ammoNameSelected
                            ]}>
                              {ammo.name}
                            </Text>
                            {isAmmoSelected && (
                              <View style={styles.checkmark}>
                                <Text style={styles.checkmarkText}>✓</Text>
                              </View>
                            )}
                          </View>

                          <View style={styles.specs}>
                            <View style={styles.specItem}>
                              <Text style={styles.specLabel}>Gewicht</Text>
                              <Text style={[
                                styles.specValue,
                                isAmmoSelected && styles.specValueSelected
                              ]}>
                                {ammo.bulletWeight} gr
                              </Text>
                            </View>
                            <View style={styles.specItem}>
                              <Text style={styles.specLabel}>V0</Text>
                              <Text style={[
                                styles.specValue,
                                isAmmoSelected && styles.specValueSelected
                              ]}>
                                {ammo.muzzleVelocity} m/s
                              </Text>
                            </View>
                            <View style={styles.specItem}>
                              <Text style={styles.specLabel}>BC ({(ammo.dragModel || 'g1').toUpperCase()})</Text>
                              <Text style={[
                                styles.specValue,
                                isAmmoSelected && styles.specValueSelected
                              ]}>
                                {(ammo.dragModel || 'g1') === 'g7' && ammo.bcG7 != null
                                  ? ammo.bcG7
                                  : ammo.ballisticCoefficient}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <Button
          title="Weiter"
          onPress={handleContinue}
          disabled={!onboardingState.caliber || !onboardingState.ammunition}
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
  caliberCard: {
    marginVertical: 6,
  },
  caliberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  caliberInfo: {
    flex: 1,
  },
  caliberName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  selectedText: {
    color: colors.forest,
  },
  caliberDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  expandIndicator: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandIcon: {
    fontSize: 12,
    color: colors.textSecondary,
    transform: [{ rotate: '-90deg' }],
  },
  expandIconRotated: {
    transform: [{ rotate: '0deg' }],
    color: colors.forest,
  },
  ammoCount: {
    fontSize: 12,
    color: colors.gold,
    fontWeight: '600',
  },
  ammunitionContainer: {
    paddingLeft: 16,
    marginBottom: 8,
  },
  ammoCard: {
    backgroundColor: colors.warmWhite,
    borderRadius: 10,
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ammoCardSelected: {
    borderColor: colors.forest,
    borderWidth: 2,
    backgroundColor: '#F5F9F5',
  },
  ammoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ammoName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  ammoNameSelected: {
    color: colors.forest,
  },
  checkmark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: colors.forestDark,
    fontWeight: '700',
    fontSize: 12,
  },
  specs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specItem: {
    alignItems: 'center',
    flex: 1,
  },
  specLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  specValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  specValueSelected: {
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
