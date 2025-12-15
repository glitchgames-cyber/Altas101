# Fallback Systems Documentation

This document describes the fallback and error recovery systems that ensure critical functionality continues even when main systems fail.

## Overview

The fallback system consists of 5 main components:

1. **critical-fallback.js** - Provides fallback implementations for critical browser APIs
2. **backup-storage.js** - Backup storage mechanisms when localStorage fails
3. **error-recovery.js** - Automatic error recovery strategies
4. **health-check.js** - System health monitoring
5. **fallback-system.js** - Main orchestrator for fallback mechanisms

## Components

### 1. Critical Fallbacks (critical-fallback.js)

Automatically provides fallbacks for:
- **localStorage** → Memory storage if localStorage fails
- **fetch API** → XMLHttpRequest fallback
- **JSON.parse/stringify** → Enhanced error handling
- **querySelector** → getElementById fallback for IDs

**Usage:**
```javascript
// Automatically initialized on page load
// localStorage is automatically wrapped if it fails
localStorage.setItem('key', 'value'); // Uses fallback if needed
```

### 2. Backup Storage (backup-storage.js)

Provides multiple storage backends:
- Primary: localStorage
- Backups: sessionStorage, IndexedDB, Memory

**Usage:**
```javascript
// Initialize
await backupStorage.init();

// Use like localStorage
await backupStorage.setItem('key', 'value');
const value = await backupStorage.getItem('key');
await backupStorage.removeItem('key');

// Check which storage is being used
const storageType = backupStorage.getStorageType(); // 'localStorage', 'sessionStorage', 'indexedDB', or 'memory'
```

### 3. Error Recovery (error-recovery.js)

Automatically recovers from common errors:
- Storage errors → Switches to backup storage
- Network errors → Retries with delays
- Reference errors → Attempts to load missing scripts

**Usage:**
```javascript
// Register custom recovery strategy
errorRecovery.registerStrategy('CustomError', async (error, context) => {
  // Your recovery logic
  return true; // Return true if recovered
});

// Handle errors with recovery
try {
  // Your code that might fail
} catch (error) {
  const result = await errorRecovery.handleError(error, {
    retryFunction: async () => {
      // Function to retry
    }
  });
  
  if (result.recovered) {
    console.log('Recovery successful!');
  }
}

// Get error history
const errors = errorRecovery.getErrorHistory(10);
```

### 4. Health Check (health-check.js)

Monitors system health continuously:
- Checks localStorage, sessionStorage, DOM, Network
- Runs every 30 seconds
- Notifies on critical failures

**Usage:**
```javascript
// Register custom health check
healthChecker.register('mySystem', async () => {
  // Return true if healthy, false otherwise
  return mySystem.isWorking();
}, { critical: true });

// Run check manually
const isHealthy = await healthChecker.check('mySystem');

// Check all systems
const allStatus = await healthChecker.checkAll();

// Get status
const status = healthChecker.getStatus('mySystem');

// Listen for failures
healthChecker.onFailure(({ name, error }) => {
  console.error(`System ${name} failed:`, error);
});

// Check if critical systems are healthy
if (!healthChecker.areCriticalSystemsHealthy()) {
  console.warn('Critical systems are down!');
}
```

### 5. Fallback System (fallback-system.js)

Orchestrates main/fallback function execution:
- Tries main function first
- Automatically switches to fallback on failure
- Retries with exponential backoff
- Handles timeouts

**Usage:**
```javascript
// Register a system with fallback
fallbackSystem.register(
  'dataStorage',
  // Main function
  async (key, value) => {
    localStorage.setItem(key, value);
    return true;
  },
  // Fallback function
  async (key, value) => {
    // Use backup storage
    await backupStorage.setItem(key, value);
    return true;
  },
  {
    critical: true,
    timeout: 5000,
    retry: true
  }
);

// Execute with automatic fallback
const result = await fallbackSystem.execute('dataStorage', 'myKey', 'myValue');

// Check health
const health = fallbackSystem.getHealth('dataStorage'); // 'healthy', 'degraded', 'fallback', or 'failed'

// Check if available
if (fallbackSystem.isAvailable('dataStorage')) {
  // System is working (either main or fallback)
}
```

## Integration Example

Here's how to integrate these systems in your code:

```javascript
// 1. Register critical system with fallback
fallbackSystem.register(
  'saveLogbookEntry',
  // Main: Use localStorage
  async (entry) => {
    const entries = JSON.parse(localStorage.getItem('logbook') || '[]');
    entries.push(entry);
    localStorage.setItem('logbook', JSON.stringify(entries));
    return true;
  },
  // Fallback: Use backup storage
  async (entry) => {
    const entries = JSON.parse(await backupStorage.getItem('logbook') || '[]');
    entries.push(entry);
    await backupStorage.setItem('logbook', JSON.stringify(entries));
    return true;
  },
  { critical: true }
);

// 2. Use with automatic fallback
async function saveEntry(entry) {
  try {
    await fallbackSystem.execute('saveLogbookEntry', entry);
    console.log('Entry saved successfully');
  } catch (error) {
    // Both main and fallback failed
    const recovery = await errorRecovery.handleError(error, {
      retryFunction: async () => {
        // Last resort: save to memory
        window.memoryLogbook = window.memoryLogbook || [];
        window.memoryLogbook.push(entry);
        return true;
      }
    });
    
    if (!recovery.recovered) {
      alert('Failed to save entry. Please try again.');
    }
  }
}

// 3. Monitor health
healthChecker.onFailure(({ name, error }) => {
  if (name === 'localStorage') {
    console.warn('localStorage failed, using backup storage');
    backupStorage.init();
  }
});
```

## Automatic Features

These systems work automatically:

1. **Critical fallbacks** initialize on page load
2. **Health checks** start automatically and run every 30 seconds
3. **Error recovery** handles common errors automatically
4. **Backup storage** activates when primary storage fails

## Event Listeners

Listen for system events:

```javascript
// Critical system failure
window.addEventListener('critical-system-failure', (event) => {
  console.error('Critical system failed:', event.detail.system);
});

// Health check failure
window.addEventListener('health-check-failure', (event) => {
  console.warn('Health check failed:', event.detail.name);
});

// Error recovered
window.addEventListener('error-recovered', (event) => {
  console.log('Error recovered:', event.detail.errorType);
});
```

## Best Practices

1. **Register critical systems** with fallbackSystem for automatic failover
2. **Use backupStorage** for important data that must persist
3. **Monitor health** for critical systems using healthChecker
4. **Handle errors** with errorRecovery for automatic retry
5. **Test fallbacks** by simulating failures (disable localStorage, etc.)

## Testing Fallbacks

To test fallback systems:

```javascript
// Disable localStorage to test backup storage
Object.defineProperty(window, 'localStorage', {
  value: null,
  writable: false
});

// Trigger health check
await healthChecker.check('localStorage');

// Should automatically switch to backup storage
```

## File Loading Order

The fallback systems should load in this order (already configured in index.html):

1. critical-fallback.js (first - provides basic fallbacks)
2. backup-storage.js (storage fallbacks)
3. error-recovery.js (error handling)
4. health-check.js (monitoring)
5. fallback-system.js (orchestration)

This ensures each system can use the fallbacks provided by earlier systems.

