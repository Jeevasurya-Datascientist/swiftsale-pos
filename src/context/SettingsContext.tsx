
"use client";

import type { AppSettings } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const DEFAULT_SETTINGS: AppSettings = {
  shopName: 'SwiftSale POS',
  shopLogoUrl: '',
  shopAddress: '123 Commerce Street, Business City, 12345',
  currencySymbol: '₹',
  userName: 'Store Admin',
  // gstRate: 5, // Removed global GST rate
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
        // Removed GST rate specific parsing here as it's no longer global
        const completeSettings = { ...DEFAULT_SETTINGS, ...parsedSettings };
        setSettings(completeSettings);
      } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
        localStorage.setItem('appSettings', JSON.stringify(DEFAULT_SETTINGS)); 
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
        localStorage.setItem('appSettings', JSON.stringify(DEFAULT_SETTINGS));
        setSettings(DEFAULT_SETTINGS);
    }
    setIsSettingsLoaded(true);
  }, []);

  useEffect(() => {
    if (isSettingsLoaded) { 
        localStorage.setItem('appSettings', JSON.stringify(settings));
    }
  }, [settings, isSettingsLoaded]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prevSettings => {
      const updated = {...prevSettings, ...newSettings};
      // Removed GST rate specific update logic
      return updated;
    });
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
