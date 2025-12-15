/**
 * Error Handler Utility
 * Centralized error handling and logging
 */

const ErrorHandler = {
  /**
   * Log error with context
   */
  log(error, context = {}) {
    const errorInfo = {
      message: error.message || String(error),
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Error:', errorInfo);

    // Store errors in localStorage (last 10 errors)
    try {
      const errors = this.getStoredErrors();
      errors.unshift(errorInfo);
      if (errors.length > 10) {
        errors.pop();
      }
      localStorage.setItem('app-errors', JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to store error:', e);
    }

    return errorInfo;
  },

  /**
   * Get stored errors
   */
  getStoredErrors() {
    try {
      const stored = localStorage.getItem('app-errors');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  /**
   * Clear stored errors
   */
  clearStoredErrors() {
    localStorage.removeItem('app-errors');
  },

  /**
   * Handle async errors
   */
  async handleAsync(fn, errorMessage = 'An error occurred') {
    try {
      return await fn();
    } catch (error) {
      this.log(error, { customMessage: errorMessage });
      throw error;
    }
  },

  /**
   * Wrap function with error handling
   */
  wrap(fn, errorMessage = 'Function error') {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        this.log(error, { customMessage: errorMessage, args });
        throw error;
      }
    };
  }
};

// Global error handler
window.addEventListener('error', (event) => {
  ErrorHandler.log(event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  ErrorHandler.log(event.reason, {
    type: 'unhandledRejection'
  });
});

// Export
if (typeof window !== 'undefined') {
  window.ErrorHandler = ErrorHandler;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorHandler;
}

