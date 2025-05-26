
"use client";

import type { AppSettings, TeamMember } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const DEFAULT_SETTINGS: AppSettings = {
  shopName: 'SwiftSale POS',
  shopLogoUrl: '',
  shopAddress: '123 Commerce Street, Business City, 12345',
  currencySymbol: '₹',
  userName: 'Store Admin',
  teamPassword: '',
  teamMembers: [],
};

interface SettingsContextType extends AppSettings {
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  addTeamMember: (member: Omit<TeamMember, 'id' | 'status'>) => void;
  removeTeamMember: (memberId: string) => void;
  updateTeamMemberStatus: (memberId: string, status: TeamMember['status']) => void;
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
        const completeSettings = { ...DEFAULT_SETTINGS, ...parsedSettings };
        // Ensure teamMembers is always an array
        if (!Array.isArray(completeSettings.teamMembers)) {
          completeSettings.teamMembers = [];
        }
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
      return updated;
    });
  };

  const addTeamMember = (memberData: Omit<TeamMember, 'id' | 'status'>) => {
    setSettings(prevSettings => {
      const newMember: TeamMember = {
        ...memberData,
        id: `member-${Date.now()}`,
        status: 'pending'
      };
      const updatedTeamMembers = [...(prevSettings.teamMembers || []), newMember];
      return { ...prevSettings, teamMembers: updatedTeamMembers };
    });
  };

  const removeTeamMember = (memberId: string) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      teamMembers: (prevSettings.teamMembers || []).filter(m => m.id !== memberId)
    }));
  };
  
  const updateTeamMemberStatus = (memberId: string, status: TeamMember['status']) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      teamMembers: (prevSettings.teamMembers || []).map(m => m.id === memberId ? { ...m, status } : m)
    }));
  };


  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings, addTeamMember, removeTeamMember, updateTeamMemberStatus, isSettingsLoaded }}>
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
