export const storage = {
  set: (key: string, value: string | number | boolean | object) => {
    return window.localStorage.setItem(key, JSON.stringify(value));
  },
  get: <T>(key: string, fallbackValue: T | null = null): T | null => {
    const value = window.localStorage.getItem(key);
    try {
      return value !== null ? JSON.parse(value) : fallbackValue;
    } catch {
      return typeof value === "string"
        ? (value as unknown as T)
        : fallbackValue;
    }
  },
  clear: () => {
    window.localStorage.clear();
  },
};
