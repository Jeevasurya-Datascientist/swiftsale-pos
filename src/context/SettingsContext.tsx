
"use client";

import type { AppSettings } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const DEFAULT_SETTINGS: AppSettings = {
  shopName: 'SwiftSale POS',
  shopLogoUrl: '',
  shopAddress: '123 Commerce Street, Business City, 12345',
  currencySymbol: '₹',
  userName: 'Store Admin',
  gstRate: 5, // Default GST Rate set to 5%
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
        
        // Ensure gstRate is a number, and provide default if missing or invalid
        if (parsedSettings.gstRate === undefined || parsedSettings.gstRate === null || typeof parsedSettings.gstRate === 'string') {
           parsedSettings.gstRate = Number(parsedSettings.gstRate);
        }
        if (typeof parsedSettings.gstRate !== 'number' || isNaN(parsedSettings.gstRate)) {
          parsedSettings.gstRate = DEFAULT_SETTINGS.gstRate;
        }

        const completeSettings = { ...DEFAULT_SETTINGS, ...parsedSettings };
        setSettings(completeSettings);
      } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
        localStorage.setItem('appSettings', JSON.stringify(DEFAULT_SETTINGS)); // Save defaults if parse fails
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
        localStorage.setItem('appSettings', JSON.stringify(DEFAULT_SETTINGS));
        setSettings(DEFAULT_SETTINGS);
    }
    setIsSettingsLoaded(true);
  }, []);

  useEffect(() => {
    if (isSettingsLoaded) { // Only save if initial load is complete
        localStorage.setItem('appSettings', JSON.stringify(settings));
    }
  }, [settings, isSettingsLoaded]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prevSettings => {
      const updated = {...prevSettings, ...newSettings};
      // Ensure gstRate is stored as a number
      if (newSettings.gstRate !== undefined) {
        updated.gstRate = Number(newSettings.gstRate);
        if (isNaN(updated.gstRate)) {
          updated.gstRate = DEFAULT_SETTINGS.gstRate; // fallback if conversion fails
        }
      }
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

