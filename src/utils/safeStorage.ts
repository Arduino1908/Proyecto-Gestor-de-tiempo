/**
 * Safe LocalStorage wrapper with in-memory fallback.
 * Prevents DOMException in sandboxed iframes, private browsing,
 * third-party contexts, or restricted cookie environments.
 */

const memoryFallback: Record<string, string> = {};

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // SecurityError or restricted environment
    }
    return memoryFallback[key] ?? null;
  },

  setItem(key: string, value: string): boolean {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return true;
      }
    } catch (e) {
      // SecurityError or QuotaExceededError
    }
    memoryFallback[key] = value;
    return true;
  },

  removeItem(key: string): boolean {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return true;
      }
    } catch (e) {
      // Restricted environment
    }
    delete memoryFallback[key];
    return true;
  },

  getJSON<T>(key: string, fallback: T): T {
    try {
      const raw = this.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch (e) {
      return fallback;
    }
  },

  setJSON<T>(key: string, value: T): boolean {
    try {
      return this.setItem(key, JSON.stringify(value));
    } catch (e) {
      return false;
    }
  }
};
