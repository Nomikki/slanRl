export const storage = {
  set: (key: string, value: string | number | boolean | object) => {
    return window.localStorage.setItem(key, JSON.stringify(value));
  },
  get: (key: string) => {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  clear: () => {
    window.localStorage.clear();
  },
};
