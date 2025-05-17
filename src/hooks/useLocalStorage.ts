"use client";

import { type Dispatch, type SetStateAction, useState, useEffect } from 'react';

function getStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved) as T;
    } catch (e) {
      console.error('Error parsing localStorage key “' + key + '”:', e);
      localStorage.removeItem(key); // Remove corrupted item
      return defaultValue;
    }
  }
  return defaultValue;
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        // This can happen if storage is full or if value is too large
        console.error('Error setting localStorage key “' + key + '”:', e);
      }
    }
  }, [key, value]);

  // Ensure state is updated if localStorage changes in another tab/window
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setValue(JSON.parse(event.newValue) as T);
        } catch (e) {
          console.error('Error parsing storage event for key “' + key + '”:', e);
        }
      } else if (event.key === key && event.newValue === null) {
         setValue(defaultValue); // Item was removed
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, defaultValue]);


  return [value, setValue];
}
