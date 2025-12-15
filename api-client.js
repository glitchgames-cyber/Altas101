/**
 * API Client Utility
 * Handles API requests with retry logic and error handling
 */

const ApiClient = {
  /**
   * Default configuration
   */
  config: {
    baseURL: '',
    timeout: 10000,
    retries: 3,
    retryDelay: 1000
  },

  /**
   * Set configuration
   */
  setConfig(config) {
    this.config = { ...this.config, ...config };
  },

  /**
   * Make GET request
   */
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  },

  /**
   * Make POST request
   */
  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  },

  /**
   * Make request with retry logic
   */
  async request(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseURL}${url}`;
    const { retries = this.config.retries, retryDelay = this.config.retryDelay } = options;
    
    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        const response = await fetch(fullUrl, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        }
        
        return await response.text();
      } catch (error) {
        lastError = error;
        
        if (attempt < retries) {
          await this.delay(retryDelay * (attempt + 1));
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError;
  },

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

// Export
if (typeof window !== 'undefined') {
  window.ApiClient = ApiClient;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiClient;
}

