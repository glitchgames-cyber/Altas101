/**
 * Storage Manager Utility
 * Manages localStorage operations with error handling and fallbacks
 */

const StorageManager = {
  /**
   * Set item in localStorage with error handling
   */
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return { success: true };
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get item from localStorage with error handling
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return defaultValue;
    }
  },

  /**
   * Remove item from localStorage
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return { success: true };
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Clear all localStorage
   */
  clear() {
    try {
      localStorage.clear();
      return { success: true };
    } catch (error) {
      console.error('Error clearing storage:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check if key exists
   */
  has(key) {
    return localStorage.getItem(key) !== null;
  },

  /**
   * Get all keys with a specific prefix
   */
  getKeysByPrefix(prefix) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    return keys;
  },

  /**
   * Get storage size estimate
   */
  getSizeEstimate() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return {
      bytes: total,
      kb: (total / 1024).toFixed(2),
      mb: (total / (1024 * 1024)).toFixed(2)
    };
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}

