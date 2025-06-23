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

  useEffect(() => {
    // Function to read the value from local storage
    const readValue = () => {
      if (typeof window === "undefined") {
        return initialValueRef.current;
      }
      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValueRef.current;
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        return initialValueRef.current;
      }
    };

    // Set the initial stored value when the component mounts
    setStoredValue(readValue());

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
