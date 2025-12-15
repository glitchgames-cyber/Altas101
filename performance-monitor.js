/**
 * Performance Monitor Utility
 * Tracks and reports performance metrics
 */

const PerformanceMonitor = {
  metrics: {
    pageLoad: null,
    domContentLoaded: null,
    firstPaint: null,
    firstContentfulPaint: null
  },

  /**
   * Initialize performance monitoring
   */
  init() {
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }

    // Track page load time
    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      this.metrics.pageLoad = perfData.loadEventEnd - perfData.navigationStart;
      this.metrics.domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart;
    });

    // Track paint metrics
    if (window.performance.getEntriesByType) {
      const paintEntries = window.performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-paint') {
          this.metrics.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
        }
      });
    }
  },

  /**
   * Get all metrics
   */
  getMetrics() {
    return { ...this.metrics };
  },

  /**
   * Measure function execution time
   */
  measure(fn, label = 'Function') {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;
    
    console.log(`${label} took ${duration.toFixed(2)}ms`);
    
    return {
      result,
      duration,
      label
    };
  },

  /**
   * Measure async function execution time
   */
  async measureAsync(fn, label = 'Async Function') {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const duration = end - start;
    
    console.log(`${label} took ${duration.toFixed(2)}ms`);
    
    return {
      result,
      duration,
      label
    };
  },

  /**
   * Get memory usage (if available)
   */
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
        total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
        limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
      };
    }
    return null;
  }
};

// Auto-initialize
if (typeof window !== 'undefined') {
  PerformanceMonitor.init();
  window.PerformanceMonitor = PerformanceMonitor;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitor;
}

