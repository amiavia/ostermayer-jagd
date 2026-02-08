import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { RifleProfile, AppSettings, OnboardingState, AmmunitionData } from '../types';
import {
  loadProfiles,
  saveProfiles,
  addProfile as addProfileToStorage,
  deleteProfile as deleteProfileFromStorage,
  updateProfile as updateProfileInStorage,
  getActiveProfileId,
  setActiveProfileId as setActiveProfileIdInStorage,
  isOnboardingComplete,
  setOnboardingComplete as setOnboardingCompleteInStorage,
  loadSettings,
  saveSettings,
  generateProfileId,
} from '../lib/storage';
import { DEFAULT_SETTINGS, DEFAULT_ONBOARDING } from '../lib/constants';

interface AppContextType {
  // Loading state
  isLoading: boolean;

  // Profiles
  profiles: RifleProfile[];
  activeProfile: RifleProfile | null;
  setActiveProfile: (profile: RifleProfile | null) => void;
  addProfile: (profile: Omit<RifleProfile, 'id' | 'createdAt'>) => Promise<RifleProfile>;
  updateProfile: (profile: RifleProfile) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;

  // Onboarding
  onboardingComplete: boolean;
  completeOnboarding: () => Promise<void>;
  onboardingState: OnboardingState;
  setOnboardingState: React.Dispatch<React.SetStateAction<OnboardingState>>;
  resetOnboarding: () => void;
  isAddingProfile: boolean;
  setIsAddingProfile: (value: boolean) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;

  // Refresh data
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<RifleProfile[]>([]);
  const [activeProfile, setActiveProfileState] = useState<RifleProfile | null>(null);
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(DEFAULT_ONBOARDING);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isAddingProfile, setIsAddingProfile] = useState(false);

  // Load initial data with timeout to prevent getting stuck
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);

    // Timeout promise to prevent hanging
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Loading timeout')), 5000)
    );

    try {
      const loadData = async () => {
        const [loadedProfiles, loadedSettings, loadedOnboardingComplete, activeId] = await Promise.all([
          loadProfiles(),
          loadSettings(),
          isOnboardingComplete(),
          getActiveProfileId(),
        ]);

        setProfiles(loadedProfiles);
        setSettings(loadedSettings);
        setOnboardingCompleteState(loadedOnboardingComplete);

        // Set active profile
        if (activeId) {
          const active = loadedProfiles.find(p => p.id === activeId);
          setActiveProfileState(active || (loadedProfiles.length > 0 ? loadedProfiles[0] : null));
        } else if (loadedProfiles.length > 0) {
          setActiveProfileState(loadedProfiles[0]);
          await setActiveProfileIdInStorage(loadedProfiles[0].id);
        }
      };

      await Promise.race([loadData(), timeout]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      // Continue anyway with defaults - don't leave user stuck
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Profile management
  const setActiveProfile = useCallback(async (profile: RifleProfile | null) => {
    setActiveProfileState(profile);
    await setActiveProfileIdInStorage(profile?.id || null);
  }, []);

  const addProfile = useCallback(async (profileData: Omit<RifleProfile, 'id' | 'createdAt'>): Promise<RifleProfile> => {
    const newProfile: RifleProfile = {
      ...profileData,
      dragModel: profileData.dragModel || profileData.ammunition.dragModel || 'g1',
      id: generateProfileId(),
      createdAt: Date.now(),
    };

    await addProfileToStorage(newProfile);
    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);

    // If this is the first profile, set it as active
    if (updatedProfiles.length === 1) {
      await setActiveProfile(newProfile);
    }

    return newProfile;
  }, [profiles, setActiveProfile]);

  const updateProfile = useCallback(async (profile: RifleProfile) => {
    await updateProfileInStorage(profile);
    setProfiles(prev => prev.map(p => p.id === profile.id ? profile : p));

    // Update active profile if it's the one being updated
    if (activeProfile?.id === profile.id) {
      setActiveProfileState(profile);
    }
  }, [activeProfile]);

  const deleteProfile = useCallback(async (profileId: string) => {
    await deleteProfileFromStorage(profileId);
    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    setProfiles(updatedProfiles);

    // If deleted profile was active, set new active
    if (activeProfile?.id === profileId) {
      const newActive = updatedProfiles.length > 0 ? updatedProfiles[0] : null;
      await setActiveProfile(newActive);
    }
  }, [profiles, activeProfile, setActiveProfile]);

  // Onboarding
  const completeOnboarding = useCallback(async () => {
    await setOnboardingCompleteInStorage(true);
    setOnboardingCompleteState(true);
  }, []);

  const resetOnboarding = useCallback(() => {
    setOnboardingState(DEFAULT_ONBOARDING);
  }, []);

  // Settings
  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    await saveSettings(updated);
    setSettings(updated);
  }, [settings]);

  // Refresh
  const refreshData = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);

  const value: AppContextType = {
    isLoading,
    profiles,
    activeProfile,
    setActiveProfile,
    addProfile,
    updateProfile,
    deleteProfile,
    onboardingComplete,
    completeOnboarding,
    onboardingState,
    setOnboardingState,
    resetOnboarding,
    isAddingProfile,
    setIsAddingProfile,
    settings,
    updateSettings,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
