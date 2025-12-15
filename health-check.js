/**
 * Health Check System
 * Monitors system health and detects failures
 */

class HealthChecker {
  constructor() {
    this.checks = new Map();
    this.status = new Map();
    this.interval = null;
    this.checkInterval = 30000; // 30 seconds
    this.listeners = [];
  }

  /**
   * Register a health check
   * @param {string} name - Name of the check
   * @param {Function} checkFunction - Function that returns true/false or Promise
   * @param {Object} options - Configuration
   */
  register(name, checkFunction, options = {}) {
    this.checks.set(name, {
      check: checkFunction,
      critical: options.critical !== false,
      timeout: options.timeout || 5000,
      interval: options.interval || this.checkInterval
    });
    this.status.set(name, { healthy: true, lastCheck: null, error: null });
  }

  /**
   * Run a specific health check
   */
  async check(name) {
    const checkConfig = this.checks.get(name);
    if (!checkConfig) {
      console.warn(`Health check ${name} not registered`);
      return false;
    }

    try {
      const result = await Promise.race([
        Promise.resolve(checkConfig.check()),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), checkConfig.timeout)
        )
      ]);

      const healthy = result === true || result === undefined;
      this.status.set(name, {
        healthy,
        lastCheck: new Date().toISOString(),
        error: healthy ? null : (result || 'Check returned false')
      });

      if (!healthy && checkConfig.critical) {
        this._notifyFailure(name, this.status.get(name).error);
      }

      return healthy;
    } catch (error) {
      this.status.set(name, {
        healthy: false,
        lastCheck: new Date().toISOString(),
        error: error.message
      });

      if (checkConfig.critical) {
        this._notifyFailure(name, error.message);
      }

      return false;
    }
  }

  /**
   * Run all health checks
   */
  async checkAll() {
    const results = {};
    const promises = [];

    for (const [name] of this.checks) {
      promises.push(
        this.check(name).then(healthy => {
          results[name] = healthy;
        })
      );
    }

    await Promise.all(promises);
    return results;
  }

  /**
   * Start automatic health checking
   */
  start() {
    if (this.interval) {
      this.stop();
    }

    // Run initial check
    this.checkAll();

    // Set up interval
    this.interval = setInterval(() => {
      this.checkAll();
    }, this.checkInterval);
  }

  /**
   * Stop automatic health checking
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Get status of a check
   */
  getStatus(name) {
    return this.status.get(name) || { healthy: false, lastCheck: null, error: 'Not registered' };
  }

  /**
   * Get all statuses
   */
  getAllStatus() {
    const statuses = {};
    this.status.forEach((status, name) => {
      statuses[name] = status;
    });
    return statuses;
  }

  /**
   * Check if all critical systems are healthy
   */
  areCriticalSystemsHealthy() {
    for (const [name, checkConfig] of this.checks) {
      if (checkConfig.critical) {
        const status = this.status.get(name);
        if (!status || !status.healthy) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Notify listeners of failure
   */
  _notifyFailure(name, error) {
    this.listeners.forEach(listener => {
      try {
        listener({ name, error, timestamp: new Date().toISOString() });
      } catch (e) {
        console.error('Error in health check listener', e);
      }
    });

    // Dispatch event
    window.dispatchEvent(new CustomEvent('health-check-failure', {
      detail: { name, error, timestamp: new Date().toISOString() }
    }));
  }

  /**
   * Add failure listener
   */
  onFailure(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove failure listener
   */
  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }
}

// Create global instance
const healthChecker = new HealthChecker();

// Register default health checks
if (typeof window !== 'undefined') {
  // Check localStorage
  healthChecker.register('localStorage', () => {
    try {
      const test = '__health_check__';
      localStorage.setItem(test, 'ok');
      const result = localStorage.getItem(test) === 'ok';
      localStorage.removeItem(test);
      return result;
    } catch (e) {
      return false;
    }
  }, { critical: true });

  // Check sessionStorage
  healthChecker.register('sessionStorage', () => {
    try {
      const test = '__health_check__';
      sessionStorage.setItem(test, 'ok');
      const result = sessionStorage.getItem(test) === 'ok';
      sessionStorage.removeItem(test);
      return result;
    } catch (e) {
      return false;
    }
  }, { critical: false });

  // Check if DOM is ready
  healthChecker.register('dom', () => {
    return document.readyState === 'complete' || document.readyState === 'interactive';
  }, { critical: true });

  // Check network connectivity (if online API available)
  healthChecker.register('network', async () => {
    if (!navigator.onLine) return false;
    try {
      const response = await fetch('/api/health', { method: 'HEAD', cache: 'no-cache' });
      return response.ok;
    } catch (e) {
      // Network check is optional, don't fail if API doesn't exist
      return navigator.onLine;
    }
  }, { critical: false, timeout: 3000 });

  // Start health checking
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => healthChecker.start());
  } else {
    healthChecker.start();
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HealthChecker, healthChecker };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.HealthChecker = HealthChecker;
  window.healthChecker = healthChecker;
}

