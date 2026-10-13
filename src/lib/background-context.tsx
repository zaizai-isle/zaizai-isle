"use client";

import { createContext, useCallback, useContext, useMemo, useState, ReactNode, useEffect, useRef } from 'react';
import { getSupabaseClient } from './supabase';
import { scheduleIdle } from './utils/schedule-idle';

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
  const remoteVersionRef = useRef(0);
  const [settings, setSettings] = useState<BackgroundSettings>({
    type: 'default',
    value: '',
    textMode: 'dark' // default to dark text for the default light background
  });

  // Local settings are immediate; cloud reconciliation waits for idle time.
  useEffect(() => {
    let localTimer: number | undefined;
    try {
      const localSettings = localStorage.getItem('background_settings');
      if (localSettings) {
        const parsedSettings = JSON.parse(localSettings) as BackgroundSettings;
        localTimer = window.setTimeout(() => {
          if (remoteVersionRef.current === 0) setSettings(parsedSettings);
        }, 0);
      }
    } catch {
      console.warn('Failed to load settings from localStorage');
    }

    const loadCloudSettings = async () => {
      try {
        if (process.env.NODE_ENV !== 'production') return;
        const supabase = await getSupabaseClient();
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

        if (data?.background_settings && remoteVersionRef.current === 0) {
          setSettings(data.background_settings as BackgroundSettings);
          localStorage.setItem('background_settings', JSON.stringify(data.background_settings));
        }
      } catch {
        // Keep local settings when cloud reconciliation is unavailable.
      }
    };

    const cancelIdle = scheduleIdle(() => void loadCloudSettings(), 3000);
    return () => {
      if (localTimer !== undefined) window.clearTimeout(localTimer);
      cancelIdle();
    };
  }, []);

  // Save settings to LocalStorage and Supabase
  useEffect(() => {
    // Save to LocalStorage immediately
    try {
      localStorage.setItem('background_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }

    const remoteVersion = remoteVersionRef.current;
    if (remoteVersion === 0) return;

    const saveSettings = async () => {
      try {
        if (process.env.NODE_ENV !== 'production') return;
        const supabase = await getSupabaseClient();
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
        } else if (remoteVersionRef.current === remoteVersion) {
          remoteVersionRef.current = 0;
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

  const setBackground = useCallback((type: BackgroundType, value: string, textMode?: TextMode) => {
    remoteVersionRef.current += 1;
    setSettings((previous) => {
      let mode = textMode;
      if (type === 'image' && !mode) {
        if (value.includes('#dark-bg')) mode = 'light';
        else if (value.includes('#light-bg')) mode = 'dark';
      }
      if (!mode) mode = type === 'default' ? 'dark' : (previous.textMode || 'dark');
      return { type, value, textMode: mode };
    });
  }, []);

  const resetBackground = useCallback(() => {
    remoteVersionRef.current += 1;
    setSettings({ type: 'default', value: '', textMode: 'dark' });
  }, []);

  const toggleTextMode = useCallback(() => {
    remoteVersionRef.current += 1;
    setSettings(prev => ({
      ...prev,
      textMode: prev.textMode === 'light' ? 'dark' : 'light'
    }));
  }, []);

  const value = useMemo(
    () => ({ settings, setBackground, resetBackground, toggleTextMode }),
    [settings, setBackground, resetBackground, toggleTextMode]
  );

  return (
    <BackgroundContext.Provider value={value}>
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
