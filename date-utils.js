/**
 * Date Utilities
 * Helper functions for date formatting and manipulation
 */

const DateUtils = {
  /**
   * Format date to Indian format
   */
  formatIndian(date, options = {}) {
    const d = new Date(date);
    const defaultOptions = {
      dateStyle: 'medium',
      timeStyle: 'short',
      ...options
    };
    return d.toLocaleString('en-IN', defaultOptions);
  },

  /**
   * Format date to relative time (e.g., "2 hours ago")
   */
  formatRelative(date) {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return this.formatIndian(date);
  },

  /**
   * Get start of day
   */
  startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  /**
   * Get end of day
   */
  endOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  },

  /**
   * Add days to date
   */
  addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  },

  /**
   * Get difference in days
   */
  diffInDays(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * Check if date is today
   */
  isToday(date) {
    const d = new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  },

  /**
   * Check if date is in past
   */
  isPast(date) {
    return new Date(date) < new Date();
  },

  /**
   * Check if date is in future
   */
  isFuture(date) {
    return new Date(date) > new Date();
  }
};

// Export
if (typeof window !== 'undefined') {
  window.DateUtils = DateUtils;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DateUtils;
}

