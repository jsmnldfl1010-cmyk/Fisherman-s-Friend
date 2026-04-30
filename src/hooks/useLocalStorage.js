import { useCallback, useEffect, useState } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable in private browsing modes.
    }
  }, [key, value]);

  const updateValue = useCallback((nextValue) => {
    setValue((current) => (typeof nextValue === 'function' ? nextValue(current) : nextValue));
  }, []);

  return [value, updateValue];
}
