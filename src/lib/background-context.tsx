"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from './supabase';

export type BackgroundType = 'default' | 'color' | 'image';
export type TextMode = 'light' | 'dark';

export interface BackgroundSettings {
  type: BackgroundType;
  value: string; // hex color or image url/base64
  textMode?: TextMode; // 'light' for light text, 'dark' for dark text
}

interface BackgroundContextType {
  settings: BackgroundSettings;
  setBackground: (type: BackgroundType, value: string, textMode?: TextMode) => void;
  resetBackground: () => void;
  toggleTextMode: () => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

// Helper to get consistent user ID (in a real app this would be from auth)
// For this demo, we'll store a random ID in localStorage if not present
const getUserId = () => {
  if (typeof window === 'undefined') return 'anon';
  let id = localStorage.getItem('user_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('user_id', id);
  }
  return id;
};

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BackgroundSettings>({
    type: 'default',
    value: '',
    textMode: 'dark' // default to dark text for the default light background
  });

  // Load saved settings from LocalStorage and Supabase
  useEffect(() => {
    const loadSettings = async () => {
      // 1. Try LocalStorage first
      try {
        const localSettings = localStorage.getItem('background_settings');
        if (localSettings) {
          setSettings(JSON.parse(localSettings));
        }
      } catch {
        console.warn('Failed to load settings from localStorage');
      }

      // 2. Try Supabase
      try {
        if (process.env.NODE_ENV !== 'production') return;
        if (!supabase) return;

        const userId = getUserId();
        const { data, error } = await supabase
          .from('user_settings')
          .select('background_settings')
          .eq('user_id', userId)
          .single();

        if (error) {
          // Ignore specific errors like table missing or row missing
          if (error.code !== 'PGRST116' && error.code !== 'PGRST205') {
            console.warn('Supabase error:', error.message);
          }
          return;
        }

        if (data?.background_settings) {
          setSettings(data.background_settings as BackgroundSettings);
          // Sync back to local storage
          localStorage.setItem('background_settings', JSON.stringify(data.background_settings));
        }
      } catch {
        // Silent failure for Supabase issues
      }
    };

    loadSettings();
  }, []);

  // Save settings to LocalStorage and Supabase
  useEffect(() => {
    // Save to LocalStorage immediately
    try {
      localStorage.setItem('background_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }

    const saveSettings = async () => {
      try {
        if (process.env.NODE_ENV !== 'production') return;
        if (!supabase) return;

        const userId = getUserId();
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: userId,
            background_settings: settings,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (error) {
          // Ignore table missing error
          if (error.code !== 'PGRST205') {
            console.warn('Supabase save error:', error.message);
          }
        }
      } catch {
        // Silent failure
      }
    };

    // Debounce save to avoid too many requests
    const timer = setTimeout(() => {
      saveSettings();
    }, 1000);

    return () => clearTimeout(timer);
  }, [settings]);

  const setBackground = (type: BackgroundType, value: string, textMode?: TextMode) => {
    let mode = textMode;

    // Auto-detect hint from URL if it's an image
    // #dark-bg -> Needs 'light' text
    // #light-bg -> Needs 'dark' text
    if (type === 'image' && !mode) {
      if (value.includes('#dark-bg')) mode = 'light';
      else if (value.includes('#light-bg')) mode = 'dark';
    }

    // Default fallback if still undefined
    if (!mode) {
      mode = type === 'default' ? 'dark' : (settings.textMode || 'dark');
    }

    setSettings({ type, value, textMode: mode });
  };

  const resetBackground = () => {
    setSettings({ type: 'default', value: '', textMode: 'dark' });
  };

  const toggleTextMode = () => {
    setSettings(prev => ({
      ...prev,
      textMode: prev.textMode === 'light' ? 'dark' : 'light'
    }));
  };

  return (
    <BackgroundContext.Provider value={{ settings, setBackground, resetBackground, toggleTextMode }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}
