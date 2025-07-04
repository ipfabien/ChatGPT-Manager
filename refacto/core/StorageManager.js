// StorageManager.js
// Service de persistance des données et préférences utilisateur (chrome.storage.local)

class StorageManager {
  constructor(storage = null) {
    // Permet d'injecter un mock pour les tests
    this.storage = storage !== undefined ? storage : (typeof chrome !== 'undefined' ? chrome.storage.local : null);
  }

  /**
   * Sauvegarder les données principales
   * @param {Object} data
   * @returns {Promise<void>}
   */
  saveData(data) {
    if (!this.storage) return Promise.reject('Storage non disponible');
    return new Promise((resolve, reject) => {
      this.storage.set({ chatManagerData: data }, () => {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Charger les données principales
   * @returns {Promise<Object>}
   */
  loadData() {
    if (!this.storage) return Promise.reject('Storage non disponible');
    return new Promise((resolve, reject) => {
      this.storage.get(["chatManagerData"], (result) => {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result.chatManagerData);
        }
      });
    });
  }

  /**
   * Réinitialiser toutes les données
   * @returns {Promise<void>}
   */
  resetData() {
    if (!this.storage) return Promise.reject('Storage non disponible');
    return new Promise((resolve, reject) => {
      this.storage.remove(["chatManagerData"], () => {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Sauvegarder les préférences utilisateur
   * @param {Object} prefs
   * @returns {Promise<void>}
   */
  savePreferences(prefs) {
    if (!this.storage) return Promise.reject('Storage non disponible');
    return new Promise((resolve, reject) => {
      this.storage.set({ chatManagerPrefs: prefs }, () => {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Charger les préférences utilisateur
   * @returns {Promise<Object>}
   */
  loadPreferences() {
    if (!this.storage) return Promise.reject('Storage non disponible');
    return new Promise((resolve, reject) => {
      this.storage.get(["chatManagerPrefs"], (result) => {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result.chatManagerPrefs);
        }
      });
    });
  }
}

module.exports = StorageManager; 