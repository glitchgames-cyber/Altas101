/**
 * Critical System Fallbacks
 * Provides fallback implementations for critical systems
 */

// Fallback for localStorage
const fallbackLocalStorage = {
  _storage: new Map(),
  
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return this._storage.get(key) || null;
    }
  },
  
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
      this._storage.set(key, value); // Backup in memory
    } catch (e) {
      this._storage.set(key, value);
    }
  },
  
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Ignore
    }
    this._storage.delete(key);
  },
  
  clear() {
    try {
      localStorage.clear();
    } catch (e) {
      // Ignore
    }
    this._storage.clear();
  }
};

// Fallback for fetch API
const fallbackFetch = async (url, options = {}) => {
  // Try native fetch first
  if (window.fetch) {
    try {
      return await fetch(url, options);
    } catch (e) {
      console.warn('Native fetch failed, trying XMLHttpRequest fallback');
    }
  }
  
  // Fallback to XMLHttpRequest
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method || 'GET', url);
    
    // Set headers
    if (options.headers) {
      Object.keys(options.headers).forEach(key => {
        xhr.setRequestHeader(key, options.headers[key]);
      });
    }
    
    xhr.onload = () => {
      const response = {
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        statusText: xhr.statusText,
        headers: new Headers(),
        text: () => Promise.resolve(xhr.responseText),
        json: () => Promise.resolve(JSON.parse(xhr.responseText)),
        blob: () => Promise.resolve(new Blob([xhr.response]))
      };
      resolve(response);
    };
    
    xhr.onerror = () => reject(new Error('Network request failed'));
    xhr.ontimeout = () => reject(new Error('Request timeout'));
    
    if (options.timeout) {
      xhr.timeout = options.timeout;
    }
    
    xhr.send(options.body);
  });
};

// Fallback for JSON.parse
const fallbackJSONParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error('JSON.parse failed, attempting recovery');
    // Try to fix common issues
    try {
      // Remove BOM if present
      const cleaned = str.replace(/^\uFEFF/, '');
      return JSON.parse(cleaned);
    } catch (e2) {
      throw new Error('Failed to parse JSON even with fallback');
    }
  }
};

// Fallback for JSON.stringify
const fallbackJSONStringify = (obj) => {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    console.error('JSON.stringify failed, attempting recovery');
    // Try with replacer to handle circular references
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    });
  }
};

// Fallback for document.querySelector
const fallbackQuerySelector = (selector) => {
  try {
    return document.querySelector(selector);
  } catch (e) {
    console.warn('querySelector failed, trying getElementById fallback');
    // If selector is an ID, try getElementById
    if (selector.startsWith('#')) {
      return document.getElementById(selector.substring(1));
    }
    return null;
  }
};

// Fallback for addEventListener
const fallbackAddEventListener = (element, event, handler) => {
  try {
    element.addEventListener(event, handler);
  } catch (e) {
    // Fallback to attachEvent for old IE
    if (element.attachEvent) {
      element.attachEvent('on' + event, handler);
    } else {
      // Last resort: assign to on* property
      const prop = 'on' + event;
      if (element[prop]) {
        const oldHandler = element[prop];
        element[prop] = function(e) {
          oldHandler.call(this, e);
          handler.call(this, e);
        };
      } else {
        element[prop] = handler;
      }
    }
  }
};

// Initialize critical fallbacks
function initCriticalFallbacks() {
  // Wrap localStorage if it fails
  if (typeof Storage === 'undefined' || !window.localStorage) {
    console.warn('localStorage not available, using fallback');
    window.localStorage = fallbackLocalStorage;
  } else {
    // Test localStorage
    try {
      const test = '__test__';
      localStorage.setItem(test, 'ok');
      localStorage.removeItem(test);
    } catch (e) {
      console.warn('localStorage failed, using fallback');
      window.localStorage = fallbackLocalStorage;
    }
  }

  // Wrap fetch if it fails
  if (!window.fetch) {
    console.warn('fetch not available, using XMLHttpRequest fallback');
    window.fetch = fallbackFetch;
  }

  // Wrap JSON methods
  if (!window.JSON || !window.JSON.parse) {
    window.JSON = window.JSON || {};
    window.JSON.parse = fallbackJSONParse;
  }
  
  if (!window.JSON || !window.JSON.stringify) {
    window.JSON = window.JSON || {};
    window.JSON.stringify = fallbackJSONStringify;
  }

  // Make fallback functions available globally
  window.fallbackLocalStorage = fallbackLocalStorage;
  window.fallbackFetch = fallbackFetch;
  window.fallbackJSONParse = fallbackJSONParse;
  window.fallbackJSONStringify = fallbackJSONStringify;
  window.fallbackQuerySelector = fallbackQuerySelector;
  window.fallbackAddEventListener = fallbackAddEventListener;
}

// Initialize on load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCriticalFallbacks);
  } else {
    initCriticalFallbacks();
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fallbackLocalStorage,
    fallbackFetch,
    fallbackJSONParse,
    fallbackJSONStringify,
    fallbackQuerySelector,
    fallbackAddEventListener,
    initCriticalFallbacks
  };
}

