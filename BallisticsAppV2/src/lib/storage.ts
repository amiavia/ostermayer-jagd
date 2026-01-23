import AsyncStorage from '@react-native-async-storage/async-storage';
import { RifleProfile, AppSettings } from '../types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from './constants';

// Profile storage functions
export async function saveProfiles(profiles: RifleProfile[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  } catch (error) {
    console.error('Error saving profiles:', error);
    throw error;
  }
}

export async function loadProfiles(): Promise<RifleProfile[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PROFILES);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading profiles:', error);
    return [];
  }
}

export async function addProfile(profile: RifleProfile): Promise<void> {
  const profiles = await loadProfiles();
  profiles.push(profile);
  await saveProfiles(profiles);
}

export async function updateProfile(profile: RifleProfile): Promise<void> {
  const profiles = await loadProfiles();
  const index = profiles.findIndex(p => p.id === profile.id);
  if (index !== -1) {
    profiles[index] = profile;
    await saveProfiles(profiles);
  }
}

export async function deleteProfile(profileId: string): Promise<void> {
  const profiles = await loadProfiles();
  const filtered = profiles.filter(p => p.id !== profileId);
  await saveProfiles(filtered);

  // If deleted profile was active, clear active profile
  const activeId = await getActiveProfileId();
  if (activeId === profileId) {
    await setActiveProfileId(filtered.length > 0 ? filtered[0].id : null);
  }
}

// Active profile management
export async function setActiveProfileId(profileId: string | null): Promise<void> {
  try {
    if (profileId) {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, profileId);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
    }
  } catch (error) {
    console.error('Error setting active profile:', error);
    throw error;
  }
}

export async function getActiveProfileId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
  } catch (error) {
    console.error('Error getting active profile:', error);
    return null;
  }
}

export async function getActiveProfile(): Promise<RifleProfile | null> {
  const activeId = await getActiveProfileId();
  if (!activeId) return null;

  const profiles = await loadProfiles();
  return profiles.find(p => p.id === activeId) || null;
}

// Onboarding status
export async function setOnboardingComplete(complete: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, JSON.stringify(complete));
  } catch (error) {
    console.error('Error setting onboarding status:', error);
    throw error;
  }
}

export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return data ? JSON.parse(data) : false;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

// Settings management
export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// Generate unique ID for profiles
export function generateProfileId(): string {
  return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Clear all app data (for testing/reset)
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PROFILES,
      STORAGE_KEYS.ACTIVE_PROFILE_ID,
      STORAGE_KEYS.ONBOARDING_COMPLETE,
      STORAGE_KEYS.SETTINGS,
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}
