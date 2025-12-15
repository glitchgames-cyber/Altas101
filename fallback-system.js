/**
 * Fallback System
 * Orchestrates fallback mechanisms when main systems fail
 */

class FallbackSystem {
  constructor() {
    this.fallbacks = new Map();
    this.healthStatus = new Map();
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Register a fallback for a critical system
   * @param {string} systemName - Name of the system
   * @param {Function} mainFunction - Main function to try
   * @param {Function} fallbackFunction - Fallback function if main fails
   * @param {Object} options - Configuration options
   */
  register(systemName, mainFunction, fallbackFunction, options = {}) {
    this.fallbacks.set(systemName, {
      main: mainFunction,
      fallback: fallbackFunction,
      options: {
        retry: options.retry !== false,
        timeout: options.timeout || 5000,
        critical: options.critical !== false,
        ...options
      }
    });
    this.healthStatus.set(systemName, 'unknown');
    this.retryAttempts.set(systemName, 0);
  }

  /**
   * Execute a system with fallback
   * @param {string} systemName - Name of the system to execute
   * @param {Array} args - Arguments to pass to the function
   * @returns {Promise} Result of the execution
   */
  async execute(systemName, ...args) {
    const system = this.fallbacks.get(systemName);
    if (!system) {
      console.error(`System ${systemName} not registered`);
      return null;
    }

    // Try main function first
    try {
      const result = await this._tryExecute(system.main, system.options.timeout, ...args);
      this.healthStatus.set(systemName, 'healthy');
      this.retryAttempts.set(systemName, 0);
      return result;
    } catch (error) {
      console.warn(`Main system ${systemName} failed:`, error);
      this.healthStatus.set(systemName, 'degraded');

      // Retry if enabled
      if (system.options.retry && this.retryAttempts.get(systemName) < this.maxRetries) {
        this.retryAttempts.set(systemName, this.retryAttempts.get(systemName) + 1);
        await this._delay(this.retryDelay);
        return this.execute(systemName, ...args);
      }

      // Use fallback
      try {
        console.log(`Using fallback for ${systemName}`);
        const result = await this._tryExecute(system.fallback, system.options.timeout, ...args);
        this.healthStatus.set(systemName, 'fallback');
        return result;
      } catch (fallbackError) {
        console.error(`Fallback for ${systemName} also failed:`, fallbackError);
        this.healthStatus.set(systemName, 'failed');
        
        if (system.options.critical) {
          this._handleCriticalFailure(systemName, fallbackError);
        }
        
        throw new Error(`Both main and fallback failed for ${systemName}`);
      }
    }
  }

  /**
   * Try to execute a function with timeout
   */
  async _tryExecute(fn, timeout, ...args) {
    return Promise.race([
      Promise.resolve(fn(...args)),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Execution timeout')), timeout)
      )
    ]);
  }

  /**
   * Delay helper
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle critical system failure
   */
  _handleCriticalFailure(systemName, error) {
    console.error(`CRITICAL: System ${systemName} has completely failed`, error);
    
    // Store error for recovery
    try {
      const failures = JSON.parse(localStorage.getItem('system-failures') || '[]');
      failures.push({
        system: systemName,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('system-failures', JSON.stringify(failures.slice(-10))); // Keep last 10
    } catch (e) {
      console.error('Failed to log critical failure', e);
    }

    // Dispatch event for other systems to handle
    window.dispatchEvent(new CustomEvent('critical-system-failure', {
      detail: { system: systemName, error }
    }));
  }

  /**
   * Get health status of a system
   */
  getHealth(systemName) {
    return this.healthStatus.get(systemName) || 'unknown';
  }

  /**
   * Get health status of all systems
   */
  getAllHealth() {
    const health = {};
    this.healthStatus.forEach((status, system) => {
      health[system] = status;
    });
    return health;
  }

  /**
   * Reset a system's retry attempts
   */
  reset(systemName) {
    this.retryAttempts.set(systemName, 0);
    this.healthStatus.set(systemName, 'unknown');
  }

  /**
   * Check if a system is available
   */
  isAvailable(systemName) {
    const status = this.healthStatus.get(systemName);
    return status === 'healthy' || status === 'fallback';
  }
}

// Create global instance
const fallbackSystem = new FallbackSystem();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FallbackSystem, fallbackSystem };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.FallbackSystem = FallbackSystem;
  window.fallbackSystem = fallbackSystem;
}

