export const storage = {
  set: (key: string, value: string | number | boolean | object) => {
    return window.localStorage.setItem(key, JSON.stringify(value));
  },
  get: (
    key: string,
    fallbackValue: string | number | boolean | object | null = null,
  ) => {
    const value = window.localStorage.getItem(key);
    try {
      return value !== null ? JSON.parse(value) : fallbackValue;
    } catch {
      return typeof value === "string" ? value : fallbackValue;
    }
  },
  clear: () => {
    window.localStorage.clear();
  },
};
