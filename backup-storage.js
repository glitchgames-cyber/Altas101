/**
 * Backup Storage System
 * Provides backup storage mechanisms when primary storage fails
 */

class BackupStorage {
  constructor() {
    this.primaryStorage = 'localStorage';
    this.backupStorages = ['sessionStorage', 'indexedDB', 'memory'];
    this.memoryStorage = new Map();
    this.useBackup = false;
  }

  /**
   * Initialize backup storage
   */
  async init() {
    // Test primary storage
    if (this._testStorage(this.primaryStorage)) {
      this.useBackup = false;
      return true;
    }

    // Try backup storages
    for (const storage of this.backupStorages) {
      if (await this._testBackupStorage(storage)) {
        this.useBackup = true;
        console.warn(`Using backup storage: ${storage}`);
        return true;
      }
    }

    console.error('All storage mechanisms failed');
    return false;
  }

  /**
   * Test primary storage
   */
  _testStorage(storageType) {
    try {
      if (storageType === 'localStorage') {
        const test = '__storage_test__';
        localStorage.setItem(test, 'ok');
        const result = localStorage.getItem(test) === 'ok';
        localStorage.removeItem(test);
        return result;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * Test backup storage
   */
  async _testBackupStorage(storageType) {
    try {
      if (storageType === 'sessionStorage') {
        const test = '__storage_test__';
        sessionStorage.setItem(test, 'ok');
        const result = sessionStorage.getItem(test) === 'ok';
        sessionStorage.removeItem(test);
        return result;
      } else if (storageType === 'indexedDB') {
        return await this._testIndexedDB();
      } else if (storageType === 'memory') {
        return true; // Memory always works
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * Test IndexedDB availability
   */
  async _testIndexedDB() {
    if (!window.indexedDB) return false;
    
    return new Promise((resolve) => {
      const request = indexedDB.open('__test_db__', 1);
      request.onsuccess = () => {
        request.result.close();
        indexedDB.deleteDatabase('__test_db__');
        resolve(true);
      };
      request.onerror = () => resolve(false);
      request.onblocked = () => resolve(false);
    });
  }

  /**
   * Get item from storage
   */
  async getItem(key) {
    try {
      if (!this.useBackup) {
        return localStorage.getItem(key);
      }

      // Try backup storages
      if (this._testStorage('sessionStorage')) {
        return sessionStorage.getItem(key);
      }

      if (await this._testIndexedDB()) {
        return await this._getFromIndexedDB(key);
      }

      return this.memoryStorage.get(key) || null;
    } catch (e) {
      console.error('Error getting item from storage', e);
      return this.memoryStorage.get(key) || null;
    }
  }

  /**
   * Set item in storage
   */
  async setItem(key, value) {
    try {
      if (!this.useBackup) {
        localStorage.setItem(key, value);
        return true;
      }

      // Try backup storages
      if (this._testStorage('sessionStorage')) {
        sessionStorage.setItem(key, value);
        return true;
      }

      if (await this._testIndexedDB()) {
        await this._setInIndexedDB(key, value);
        return true;
      }

      // Fallback to memory
      this.memoryStorage.set(key, value);
      return true;
    } catch (e) {
      console.error('Error setting item in storage', e);
      // Always fallback to memory
      this.memoryStorage.set(key, value);
      return true;
    }
  }

  /**
   * Remove item from storage
   */
  async removeItem(key) {
    try {
      if (!this.useBackup) {
        localStorage.removeItem(key);
      } else {
        if (this._testStorage('sessionStorage')) {
          sessionStorage.removeItem(key);
        }
        if (await this._testIndexedDB()) {
          await this._removeFromIndexedDB(key);
        }
      }
      this.memoryStorage.delete(key);
      return true;
    } catch (e) {
      console.error('Error removing item from storage', e);
      this.memoryStorage.delete(key);
      return true;
    }
  }

  /**
   * Get from IndexedDB
   */
  async _getFromIndexedDB(key) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('backupStorage', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data');
        }
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['data'], 'readonly');
        const store = transaction.objectStore('data');
        const getRequest = store.get(key);
        
        getRequest.onsuccess = () => {
          resolve(getRequest.result || null);
          db.close();
        };
        
        getRequest.onerror = () => {
          reject(getRequest.error);
          db.close();
        };
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Set in IndexedDB
   */
  async _setInIndexedDB(key, value) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('backupStorage', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data');
        }
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['data'], 'readwrite');
        const store = transaction.objectStore('data');
        const putRequest = store.put(value, key);
        
        putRequest.onsuccess = () => {
          resolve();
          db.close();
        };
        
        putRequest.onerror = () => {
          reject(putRequest.error);
          db.close();
        };
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove from IndexedDB
   */
  async _removeFromIndexedDB(key) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('backupStorage', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['data'], 'readwrite');
        const store = transaction.objectStore('data');
        const deleteRequest = store.delete(key);
        
        deleteRequest.onsuccess = () => {
          resolve();
          db.close();
        };
        
        deleteRequest.onerror = () => {
          reject(deleteRequest.error);
          db.close();
        };
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all storage
   */
  async clear() {
    try {
      if (!this.useBackup) {
        localStorage.clear();
      } else {
        if (this._testStorage('sessionStorage')) {
          sessionStorage.clear();
        }
        if (await this._testIndexedDB()) {
          await this._clearIndexedDB();
        }
      }
      this.memoryStorage.clear();
      return true;
    } catch (e) {
      console.error('Error clearing storage', e);
      this.memoryStorage.clear();
      return true;
    }
  }

  /**
   * Clear IndexedDB
   */
  async _clearIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase('backupStorage');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get storage type currently in use
   */
  getStorageType() {
    if (!this.useBackup) return 'localStorage';
    if (this._testStorage('sessionStorage')) return 'sessionStorage';
    if (window.indexedDB) return 'indexedDB';
    return 'memory';
  }
}

// Create global instance
const backupStorage = new BackupStorage();

// Initialize on load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => backupStorage.init());
  } else {
    backupStorage.init();
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BackupStorage, backupStorage };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.BackupStorage = BackupStorage;
  window.backupStorage = backupStorage;
}

