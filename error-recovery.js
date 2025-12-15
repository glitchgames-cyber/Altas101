/**
 * Error Recovery System
 * Handles errors and attempts recovery
 */

class ErrorRecovery {
  constructor() {
    this.recoveryStrategies = new Map();
    this.errorHistory = [];
    this.maxHistorySize = 50;
    this.recoveryAttempts = new Map();
    this.maxRecoveryAttempts = 3;
  }

  /**
   * Register a recovery strategy for an error type
   * @param {string} errorType - Type of error (e.g., 'StorageError', 'NetworkError')
   * @param {Function} recoveryFunction - Function to attempt recovery
   * @param {Object} options - Configuration
   */
  registerStrategy(errorType, recoveryFunction, options = {}) {
    this.recoveryStrategies.set(errorType, {
      recover: recoveryFunction,
      retry: options.retry !== false,
      maxAttempts: options.maxAttempts || this.maxRecoveryAttempts,
      delay: options.delay || 1000
    });
  }

  /**
   * Handle an error and attempt recovery
   * @param {Error} error - The error to handle
   * @param {Object} context - Additional context
   * @returns {Promise} Recovery result
   */
  async handleError(error, context = {}) {
    // Log error
    this._logError(error, context);

    // Determine error type
    const errorType = this._classifyError(error);

    // Get recovery strategy
    const strategy = this.recoveryStrategies.get(errorType);
    if (!strategy) {
      console.error('No recovery strategy for error type:', errorType);
      return { recovered: false, error };
    }

    // Check if we've exceeded max attempts
    const attempts = this.recoveryAttempts.get(errorType) || 0;
    if (attempts >= strategy.maxAttempts) {
      console.error(`Max recovery attempts reached for ${errorType}`);
      return { recovered: false, error, attempts };
    }

    // Attempt recovery
    try {
      this.recoveryAttempts.set(errorType, attempts + 1);
      const result = await strategy.recover(error, context);
      
      if (result) {
        // Recovery successful
        this.recoveryAttempts.set(errorType, 0);
        this._notifyRecovery(errorType, context);
        return { recovered: true, result, attempts: attempts + 1 };
      } else {
        // Recovery failed, retry if enabled
        if (strategy.retry) {
          await this._delay(strategy.delay);
          return this.handleError(error, context);
        }
        return { recovered: false, error, attempts: attempts + 1 };
      }
    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError);
      if (strategy.retry && attempts < strategy.maxAttempts - 1) {
        await this._delay(strategy.delay);
        return this.handleError(error, context);
      }
      return { recovered: false, error, recoveryError, attempts: attempts + 1 };
    }
  }

  /**
   * Classify error type
   */
  _classifyError(error) {
    const message = error.message || '';
    const name = error.name || '';

    if (name.includes('Storage') || message.includes('localStorage') || message.includes('quota')) {
      return 'StorageError';
    }
    if (name.includes('Network') || message.includes('fetch') || message.includes('network')) {
      return 'NetworkError';
    }
    if (name.includes('Type') || message.includes('undefined') || message.includes('null')) {
      return 'TypeError';
    }
    if (name.includes('Reference') || message.includes('is not defined')) {
      return 'ReferenceError';
    }
    if (name.includes('Syntax')) {
      return 'SyntaxError';
    }
    if (message.includes('timeout')) {
      return 'TimeoutError';
    }

    return 'UnknownError';
  }

  /**
   * Log error to history
   */
  _logError(error, context) {
    const errorEntry = {
      type: error.name || 'Error',
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    };

    this.errorHistory.push(errorEntry);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }

    // Store in localStorage if available
    try {
      const stored = JSON.parse(localStorage.getItem('error-history') || '[]');
      stored.push(errorEntry);
      localStorage.setItem('error-history', JSON.stringify(stored.slice(-this.maxHistorySize)));
    } catch (e) {
      // Ignore storage errors
    }
  }

  /**
   * Notify about successful recovery
   */
  _notifyRecovery(errorType, context) {
    window.dispatchEvent(new CustomEvent('error-recovered', {
      detail: { errorType, context, timestamp: new Date().toISOString() }
    }));
  }

  /**
   * Delay helper
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get error history
   */
  getErrorHistory(limit = 10) {
    return this.errorHistory.slice(-limit);
  }

  /**
   * Clear error history
   */
  clearHistory() {
    this.errorHistory = [];
    this.recoveryAttempts.clear();
    try {
      localStorage.removeItem('error-history');
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Reset recovery attempts for an error type
   */
  resetAttempts(errorType) {
    this.recoveryAttempts.set(errorType, 0);
  }
}

// Create global instance
const errorRecovery = new ErrorRecovery();

// Register default recovery strategies
if (typeof window !== 'undefined') {
  // Storage error recovery
  errorRecovery.registerStrategy('StorageError', async (error, context) => {
    console.log('Attempting storage error recovery...');
    
    // Try to use backup storage
    if (window.backupStorage) {
      try {
        await window.backupStorage.init();
        // Retry the operation with backup storage
        if (context.retryFunction) {
          return await context.retryFunction();
        }
        return true;
      } catch (e) {
        console.error('Backup storage recovery failed', e);
        return false;
      }
    }
    
    return false;
  }, { maxAttempts: 2 });

  // Network error recovery
  errorRecovery.registerStrategy('NetworkError', async (error, context) => {
    console.log('Attempting network error recovery...');
    
    // Check if online
    if (!navigator.onLine) {
      return false; // Can't recover if offline
    }
    
    // Wait a bit and retry
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (context.retryFunction) {
      try {
        return await context.retryFunction();
      } catch (e) {
        return false;
      }
    }
    
    return false;
  }, { maxAttempts: 3, delay: 2000 });

  // Reference error recovery (missing dependencies)
  errorRecovery.registerStrategy('ReferenceError', async (error, context) => {
    console.log('Attempting reference error recovery...');
    
    // Try to load missing scripts
    if (context.missingScript) {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = context.missingScript;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
      });
    }
    
    return false;
  }, { maxAttempts: 1 });
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ErrorRecovery, errorRecovery };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.ErrorRecovery = ErrorRecovery;
  window.errorRecovery = errorRecovery;
}

