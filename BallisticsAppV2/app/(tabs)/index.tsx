import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Header, SliderInput, ResultDisplay, Card, RangeCard } from '../../src/components';
import { colors, SLIDER_RANGES } from '../../src/lib/constants';
import { useApp } from '../../src/context/AppContext';
import { calculateTrajectory, createStandardEnvironment } from '../../src/lib/ballistics';

export default function CalculatorScreen() {
  const { activeProfile, profiles, setActiveProfile, settings } = useApp();
  const [distance, setDistance] = useState(150);
  const [windSpeed, setWindSpeed] = useState(0);
  const [windAngle, setWindAngle] = useState(90);
  const [showRangeCard, setShowRangeCard] = useState(false);

  // Calculate ballistic result
  const result = useMemo(() => {
    if (!activeProfile) return null;
    const environment = createStandardEnvironment(windSpeed, windAngle);
    return calculateTrajectory(activeProfile, distance, environment);
  }, [activeProfile, distance, windSpeed, windAngle]);

  // Wind direction text
  const getWindDirectionText = (angle: number): string => {
    if (angle === 0) return 'Gegenwind';
    if (angle === 180) return 'Ruckenwind';
    if (angle === 90) return 'von rechts';
    if (angle < 90) return `${angle}° von rechts vorne`;
    return `${180 - angle}° von rechts hinten`;
  };

  if (!activeProfile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Ballistik Rechner" />
        <View style={styles.noProfileContainer}>
          <Text style={styles.noProfileTitle}>Kein Profil aktiv</Text>
          <Text style={styles.noProfileText}>
            Bitte wahlen Sie ein Profil aus oder erstellen Sie ein neues.
          </Text>
          <TouchableOpacity
            style={styles.goToProfilesButton}
            onPress={() => router.push('/(tabs)/profiles')}
          >
            <Text style={styles.goToProfilesText}>Zu den Profilen</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Ballistik Rechner"
        subtitle={activeProfile.name}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Profile Switcher */}
        {profiles.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.profileSwitcher}
            contentContainerStyle={styles.profileSwitcherContent}
          >
            {profiles.map(profile => (
              <TouchableOpacity
                key={profile.id}
                style={[
                  styles.profileChip,
                  activeProfile.id === profile.id && styles.profileChipActive,
                ]}
                onPress={() => setActiveProfile(profile)}
              >
                <Text
                  style={[
                    styles.profileChipText,
                    activeProfile.id === profile.id && styles.profileChipTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {profile.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Distance Slider */}
        <Card style={styles.sliderCard}>
          <SliderInput
            label="Entfernung"
            value={distance}
            onValueChange={setDistance}
            min={SLIDER_RANGES.distance.min}
            max={SLIDER_RANGES.distance.max}
            step={SLIDER_RANGES.distance.step}
            unit="m"
          />
        </Card>

        {/* Result Display */}
        {result && (
          <ResultDisplay
            result={result}
            distance={distance}
            unit={settings.units}
          />
        )}

        {/* Range Card Toggle Button */}
        <TouchableOpacity
          style={[
            styles.rangeCardToggle,
            showRangeCard && styles.rangeCardToggleActive,
          ]}
          onPress={() => setShowRangeCard(!showRangeCard)}
        >
          <Text style={styles.rangeCardToggleIcon}>
            {showRangeCard ? '📋' : '📊'}
          </Text>
          <Text style={[
            styles.rangeCardToggleText,
            showRangeCard && styles.rangeCardToggleTextActive,
          ]}>
            {showRangeCard ? 'Schusstafel ausblenden' : 'Schusstafel anzeigen'}
          </Text>
          <Text style={[
            styles.rangeCardToggleArrow,
            showRangeCard && styles.rangeCardToggleArrowActive,
          ]}>
            {showRangeCard ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {/* Range Card */}
        {showRangeCard && (
          <View style={styles.rangeCardContainer}>
            <RangeCard
              profile={activeProfile}
              windSpeed={windSpeed}
              windAngle={windAngle}
              unit={settings.units}
            />
          </View>
        )}

        {/* Wind Settings */}
        <Text style={styles.sectionTitle}>Windeinstellungen</Text>

        <Card style={styles.sliderCard}>
          <SliderInput
            label="Windgeschwindigkeit"
            value={windSpeed}
            onValueChange={setWindSpeed}
            min={SLIDER_RANGES.windSpeed.min}
            max={SLIDER_RANGES.windSpeed.max}
            step={SLIDER_RANGES.windSpeed.step}
            unit=" m/s"
          />
        </Card>

        <Card style={styles.sliderCard}>
          <SliderInput
            label="Windrichtung"
            value={windAngle}
            onValueChange={setWindAngle}
            min={SLIDER_RANGES.windAngle.min}
            max={SLIDER_RANGES.windAngle.max}
            step={SLIDER_RANGES.windAngle.step}
            formatValue={(val) => getWindDirectionText(val)}
          />
        </Card>

        {/* Profile Info */}
        <Text style={styles.sectionTitle}>Aktives Profil</Text>
        <Card style={styles.profileInfo}>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Kaliber</Text>
            <Text style={styles.profileValue}>{activeProfile.caliber}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Munition</Text>
            <Text style={styles.profileValue}>{activeProfile.ammunition.name}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Zero</Text>
            <Text style={styles.profileValue}>
              {activeProfile.zeroDistance}m {activeProfile.zeroType === 'gee' ? '(GEE)' : ''}
            </Text>
          </View>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  noProfileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noProfileTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  noProfileText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  goToProfilesButton: {
    backgroundColor: colors.forest,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  goToProfilesText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.warmWhite,
  },
  profileSwitcher: {
    marginVertical: 12,
  },
  profileSwitcherContent: {
    paddingRight: 16,
  },
  profileChip: {
    backgroundColor: colors.warmWhite,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 150,
  },
  profileChipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  profileChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  profileChipTextActive: {
    color: colors.warmWhite,
  },
  sliderCard: {
    marginVertical: 8,
  },
  rangeCardToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warmWhite,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rangeCardToggleActive: {
    backgroundColor: colors.forestDark,
    borderColor: colors.forestDark,
  },
  rangeCardToggleIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  rangeCardToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.forest,
    flex: 1,
    textAlign: 'center',
  },
  rangeCardToggleTextActive: {
    color: colors.warmWhite,
  },
  rangeCardToggleArrow: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  rangeCardToggleArrowActive: {
    color: colors.goldLight,
  },
  rangeCardContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  profileInfo: {
    marginVertical: 8,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  profileLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.forest,
  },
  bottomSpacer: {
    height: 24,
  },
});
