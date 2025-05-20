
"use client";

import type { AppSettings } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const DEFAULT_SETTINGS: AppSettings = {
  shopName: 'SwiftSale POS',
  shopLogoUrl: '',
  shopAddress: '123 Commerce Street, Business City, 12345',
  currencySymbol: '$',
};

interface SettingsContextType extends AppSettings {
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  isSettingsLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  useEffect(() => {
    const storedSettings = localStorage.getItem('appSettings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        // Validate parsed settings against AppSettings structure if necessary
        setSettings(prevSettings => ({ ...prevSettings, ...parsedSettings }));
      } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
        // Fallback to default if parsing fails or structure is incorrect
        localStorage.setItem('appSettings', JSON.stringify(DEFAULT_SETTINGS));
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
        // If no settings in localStorage, initialize with defaults
        localStorage.setItem('appSettings', JSON.stringify(DEFAULT_SETTINGS));
        setSettings(DEFAULT_SETTINGS);
    }
    setIsSettingsLoaded(true);
  }, []);

  useEffect(() => {
    if (isSettingsLoaded) { // Only save to localStorage if settings have been loaded/initialized
        localStorage.setItem('appSettings', JSON.stringify(settings));
    }
  }, [settings, isSettingsLoaded]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings, isSettingsLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
