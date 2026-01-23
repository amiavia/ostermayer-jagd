import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Header, Button, ProfileCard } from '../../src/components';
import { colors } from '../../src/lib/constants';
import { useApp } from '../../src/context/AppContext';

export default function ProfilesScreen() {
  const { profiles, activeProfile, setActiveProfile, deleteProfile, resetOnboarding, setIsAddingProfile, isAddingProfile } = useApp();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  // Navigate after isAddingProfile state is updated
  useEffect(() => {
    if (shouldNavigate && isAddingProfile) {
      setShouldNavigate(false);
      router.push('/onboarding/caliber');
    }
  }, [shouldNavigate, isAddingProfile]);

  const handleSelectProfile = (profile: typeof activeProfile) => {
    if (profile) {
      setActiveProfile(profile);
    }
  };

  const handleDeleteProfile = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    Alert.alert(
      'Profil loschen',
      `Mochten Sie "${profile.name}" wirklich loschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Loschen',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(profileId);
            try {
              await deleteProfile(profileId);
            } catch (error) {
              Alert.alert('Fehler', 'Profil konnte nicht geloscht werden');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const handleAddProfile = () => {
    // Reset onboarding state and navigate to add new profile
    resetOnboarding();
    setIsAddingProfile(true);
    setShouldNavigate(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Profile"
        subtitle={`${profiles.length} ${profiles.length === 1 ? 'Profil' : 'Profile'}`}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {profiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Keine Profile</Text>
            <Text style={styles.emptyText}>
              Erstellen Sie Ihr erstes Waffenprofil, um den Ballistikrechner zu nutzen.
            </Text>
          </View>
        ) : (
          profiles.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isActive={activeProfile?.id === profile.id}
              onSelect={() => handleSelectProfile(profile)}
              onDelete={() => handleDeleteProfile(profile.id)}
            />
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Neues Profil erstellen"
          onPress={handleAddProfile}
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
  contentContainer: {
    paddingVertical: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.warmWhite,
  },
});
