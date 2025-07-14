import { useState, useEffect, useRef } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const initialValueRef = useRef<T>(initialValue);

  // Keep the initialValueRef always up-to-date
  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  // Helper function to merge missing keys from initialValue into stored object
  const mergeWithInitialValue = (storedData: T, initial: T): T => {
    // Only merge if both are objects and not null/array
    if (
      typeof storedData === "object" &&
      typeof initial === "object" &&
      storedData !== null &&
      initial !== null &&
      !Array.isArray(storedData) &&
      !Array.isArray(initial)
    ) {
      const merged = { ...storedData } as Record<string, unknown>;
      const initialObj = initial as Record<string, unknown>;

      // Add missing keys from initialValue
      for (const key in initialObj) {
        if (!(key in merged)) {
          merged[key] = initialObj[key];
        }
      }

      return merged as T;
    }

    // Return stored data as-is if not objects
    return storedData;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: not required
  useEffect(() => {
    // Function to read the value from local storage
    const readValue = () => {
      if (typeof window === "undefined") {
        return initialValueRef.current;
      }
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          const parsedItem = JSON.parse(item);
          // Merge missing keys from initialValue
          return mergeWithInitialValue(parsedItem, initialValueRef.current);
        }
        return initialValueRef.current;
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        return initialValueRef.current;
      }
    };

    // Set the initial stored value when the component mounts
    const mergedValue = readValue();
    setStoredValue(mergedValue);

    // Update localStorage with merged value if it was modified
    if (typeof window !== "undefined") {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsedItem = JSON.parse(item);
        // Only update localStorage if the merge actually added missing keys
        if (JSON.stringify(parsedItem) !== JSON.stringify(mergedValue)) {
          window.localStorage.setItem(key, JSON.stringify(mergedValue));
        }
      }
    }

    // Event listener for storage changes
    const handleStorageChange = (event: StorageEvent) => {
      // Only update if the changed key matches this hook's key,
      // or if event.key is null (meaning any key changed, including clear())
      if (event.key === key || event.key === null) {
        setStoredValue(readValue());
      }
    };

    // Add the event listener when the component mounts
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
    }

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorageChange);
      }
    };
  }, [key]); // Re-run effect if the key changes

  const setValue = (value: T) => {
    try {
      // Allow value to be a function for consistent API with useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const deleteValue = () => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValueRef.current);
    } catch (error) {
      console.error(`Error deleting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, deleteValue];
}
