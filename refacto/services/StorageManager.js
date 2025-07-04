// StorageManager.js
// Gestion du stockage local et des préférences

class StorageManager {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Initialiser le gestionnaire de stockage
   */
  async initialize() {
    this.isInitialized = true;
  }

  /**
   * Sauvegarder des données
   * @param {Object} data - Données à sauvegarder
   * @returns {Promise}
   */
  async saveData(data) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.set({ chatManagerData: data }, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    } else {
      // Fallback localStorage
      localStorage.setItem('chatManagerData', JSON.stringify(data));
      return Promise.resolve();
    }
  }

  /**
   * Charger les données
   * @returns {Promise<Object>}
   */
  async loadData() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get(['chatManagerData'], (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(result.chatManagerData || this.getDefaultData());
          }
        });
      });
    } else {
      // Fallback localStorage
      const stored = localStorage.getItem('chatManagerData');
      return Promise.resolve(stored ? JSON.parse(stored) : this.getDefaultData());
    }
  }

  /**
   * Effacer toutes les données
   * @returns {Promise}
   */
  async clearData() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.remove(['chatManagerData'], () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    } else {
      // Fallback localStorage
      localStorage.removeItem('chatManagerData');
      return Promise.resolve();
    }
  }

  /**
   * Sauvegarder les préférences utilisateur
   * @param {Object} preferences - Préférences à sauvegarder
   * @returns {Promise}
   */
  async savePreferences(preferences) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.set(preferences, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    } else {
      // Fallback localStorage
      Object.keys(preferences).forEach(key => {
        localStorage.setItem(`pref_${key}`, JSON.stringify(preferences[key]));
      });
      return Promise.resolve();
    }
  }

  /**
   * Charger les préférences utilisateur
   * @param {Array<string>} keys - Clés des préférences à charger
   * @returns {Promise<Object>}
   */
  async loadPreferences(keys) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.get(keys, (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(result);
          }
        });
      });
    } else {
      // Fallback localStorage
      const result = {};
      keys.forEach(key => {
        const stored = localStorage.getItem(`pref_${key}`);
        if (stored) {
          result[key] = JSON.parse(stored);
        }
      });
      return Promise.resolve(result);
    }
  }

  /**
   * Obtenir les données par défaut
   * @returns {Object}
   */
  getDefaultData() {
    return {
      id: "root",
      name: "Accueil",
      type: "folder",
      children: [],
      expanded: true
    };
  }
}

// Exposer globalement pour le navigateur
window.StorageManager = StorageManager;

// Exportation pour les tests Jest
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
} 