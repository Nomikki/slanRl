export const storage = {
  set: (key: string, value: string | number | boolean | object) => {
    return window.localStorage.setItem(key, JSON.stringify(value));
  },
  get: (key: string) => {
    const value = window.localStorage.getItem(key);
    try {
      return value !== null ? JSON.parse(value) : null;
    } catch {
      return value !== null ? value : null;
    }
  },
  clear: () => {
    window.localStorage.clear();
  },
};
