import { useState, useEffect } from 'react';
import { PhilippineHoliday, INITIAL_PH_HOLIDAYS_2026 } from '../data/phHolidays';

const STORAGE_KEY = 'kawayan_ph_holidays_registry_v1';
const EVENT_NAME = 'kawayan_holidays_changed';

/**
 * Loads holidays from localStorage or defaults to initial 2026 proclamations
 */
export function getStoredHolidays(): PhilippineHoliday[] {
  if (typeof window === 'undefined') {
    return INITIAL_PH_HOLIDAYS_2026;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PH_HOLIDAYS_2026));
      return INITIAL_PH_HOLIDAYS_2026;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load holidays from localStorage:', err);
  }
  return INITIAL_PH_HOLIDAYS_2026;
}

/**
 * Saves holidays array to localStorage and emits update event
 */
export function saveHolidaysToStorage(holidays: PhilippineHoliday[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(holidays));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: holidays }));
  } catch (err) {
    console.error('Failed to save holidays to localStorage:', err);
  }
}

/**
 * Subscribes to holiday changes
 */
export function subscribeToHolidays(callback: (holidays: PhilippineHoliday[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<PhilippineHoliday[]>;
    callback(customEvent.detail || getStoredHolidays());
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getStoredHolidays());
    }
  };

  window.addEventListener(EVENT_NAME, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(EVENT_NAME, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}

/**
 * Hook for consuming and modifying the official holiday schedule
 */
export function useHolidays() {
  const [holidays, setHolidays] = useState<PhilippineHoliday[]>(() => getStoredHolidays());

  useEffect(() => {
    setHolidays(getStoredHolidays());
    const unsubscribe = subscribeToHolidays((updated) => {
      setHolidays([...updated]);
    });
    return unsubscribe;
  }, []);

  const addHoliday = (newHoliday: PhilippineHoliday) => {
    const current = getStoredHolidays();
    const updated = [newHoliday, ...current.filter(h => h.id !== newHoliday.id)];
    saveHolidaysToStorage(updated);
    setHolidays(updated);
    return updated;
  };

  const mergeHolidays = (newHolidays: PhilippineHoliday[], replaceYear?: number) => {
    const current = getStoredHolidays();
    let base = current;
    if (replaceYear) {
      // Remove previous holidays of that year if replacing
      base = current.filter(h => !h.date.startsWith(`${replaceYear}-`));
    }
    // Combine and sort chronologically
    const map = new Map<string, PhilippineHoliday>();
    base.forEach(h => map.set(`${h.date}-${h.name}`, h));
    newHolidays.forEach(h => map.set(`${h.date}-${h.name}`, h));

    const combined = Array.from(map.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    saveHolidaysToStorage(combined);
    setHolidays(combined);
    return combined;
  };

  const resetToDefault = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    saveHolidaysToStorage(INITIAL_PH_HOLIDAYS_2026);
    setHolidays(INITIAL_PH_HOLIDAYS_2026);
    return INITIAL_PH_HOLIDAYS_2026;
  };

  return {
    holidays,
    addHoliday,
    mergeHolidays,
    resetToDefault,
  };
}
