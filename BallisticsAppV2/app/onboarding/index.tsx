import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components';
import { colors } from '../../src/lib/constants';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>Premium Jagd seit 2019</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>Ballistik Rechner</Text>
          <Text style={styles.subtitle}>
            Berechnen Sie prazise Haltepunkte fur Ihre Jagdwaffe.
            Erstellen Sie Profile fur verschiedene Waffen und Munition.
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <View style={styles.featureBullet} />
            <Text style={styles.featureText}>Prazise Trajektorienberechnung</Text>
          </View>
          <View style={styles.feature}>
            <View style={styles.featureBullet} />
            <Text style={styles.featureText}>Windabdrift Kalkulation</Text>
          </View>
          <View style={styles.feature}>
            <View style={styles.featureBullet} />
            <Text style={styles.featureText}>Schusstafel zum Teilen</Text>
          </View>
          <View style={styles.feature}>
            <View style={styles.featureBullet} />
            <Text style={styles.featureText}>Mehrere Waffenprofile</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Jetzt einrichten"
            onPress={() => router.push('/onboarding/caliber')}
            fullWidth
          />
          <Text style={styles.footerNote}>
            Richten Sie Ihr erstes Waffenprofil in nur 3 Schritten ein
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.forestDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 14,
    color: colors.goldLight,
    marginTop: 4,
    letterSpacing: 1,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.warmWhite,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.goldLight,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  features: {
    backgroundColor: colors.forest,
    borderRadius: 16,
    padding: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: colors.warmWhite,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 32,
  },
  footerNote: {
    fontSize: 14,
    color: colors.goldLight,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.8,
  },
});
