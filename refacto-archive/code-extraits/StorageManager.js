/**
 * StorageManager - Gestion centralisée du storage
 * Fonctionne dans les contextes extension Chrome et navigateur web
 */
export class StorageManager {
  constructor() {
    this.isExtension = typeof chrome !== 'undefined' && chrome.storage;
    this.storage = this.isExtension ? chrome.storage.local : null;
    this.prefix = 'chatgpt_manager_';
  }

  /**
   * Récupérer une valeur du storage
   * @param {string|string[]} key - Clé ou tableau de clés
   * @returns {Promise<any>} - Valeur(s) récupérée(s)
   */
  async get(key) {
    if (this.isExtension) {
      return new Promise((resolve) => {
        this.storage.get(key, (result) => {
          resolve(result);
        });
      });
    } else {
      // Mode navigateur web - utiliser localStorage
      if (Array.isArray(key)) {
        const result = {};
        key.forEach(k => {
          const value = localStorage.getItem(this.prefix + k);
          if (value !== null) {
            try {
              result[k] = JSON.parse(value);
            } catch {
              result[k] = value;
            }
          }
        });
        return result;
      } else if (key === null) {
        // Récupérer toutes les clés
        const result = {};
        for (let i = 0; i < localStorage.length; i++) {
          const storageKey = localStorage.key(i);
          if (storageKey && storageKey.startsWith(this.prefix)) {
            const cleanKey = storageKey.replace(this.prefix, '');
            const value = localStorage.getItem(storageKey);
            try {
              result[cleanKey] = JSON.parse(value);
            } catch {
              result[cleanKey] = value;
            }
          }
        }
        return result;
      } else {
        const value = localStorage.getItem(this.prefix + key);
        if (value !== null) {
          try {
            return { [key]: JSON.parse(value) };
          } catch {
            return { [key]: value };
          }
        }
        return {};
      }
    }
  }

  /**
   * Sauvegarder une valeur dans le storage
   * @param {string} key - Clé
   * @param {any} value - Valeur à sauvegarder
   * @returns {Promise<void>}
   */
  async set(key, value) {
    if (this.isExtension) {
      return new Promise((resolve) => {
        this.storage.set({ [key]: value }, () => {
          resolve();
        });
      });
    } else {
      // Mode navigateur web
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return Promise.resolve();
    }
  }

  /**
   * Supprimer une clé du storage
   * @param {string|string[]} key - Clé(s) à supprimer
   * @returns {Promise<void>}
   */
  async remove(key) {
    if (this.isExtension) {
      return new Promise((resolve) => {
        this.storage.remove(key, () => {
          resolve();
        });
      });
    } else {
      // Mode navigateur web
      if (Array.isArray(key)) {
        key.forEach(k => localStorage.removeItem(this.prefix + k));
      } else {
        localStorage.removeItem(this.prefix + key);
      }
      return Promise.resolve();
    }
  }

  /**
   * Vider tout le storage
   * @returns {Promise<void>}
   */
  async clear() {
    if (this.isExtension) {
      return new Promise((resolve) => {
        this.storage.clear(() => {
          resolve();
        });
      });
    } else {
      // Mode navigateur web - supprimer seulement nos clés
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return Promise.resolve();
    }
  }

  /**
   * Récupérer toutes les données du storage
   * @returns {Promise<Object>} - Toutes les données
   */
  async getAll() {
    return this.get(null);
  }

  /**
   * Vérifier si une clé existe
   * @param {string} key - Clé à vérifier
   * @returns {Promise<boolean>} - True si la clé existe
   */
  async hasKey(key) {
    if (this.isExtension) {
      const result = await this.get(key);
      return result.hasOwnProperty(key);
    } else {
      return localStorage.getItem(this.prefix + key) !== null;
    }
  }

  /**
   * Obtenir le type de contexte d'exécution
   * @returns {string} - 'extension' ou 'web'
   */
  getContext() {
    return this.isExtension ? 'extension' : 'web';
  }

  /**
   * Obtenir l'état du storage
   * @returns {Object} - Informations sur le storage
   */
  getState() {
    return {
      context: this.getContext(),
      prefix: this.prefix,
      isExtension: this.isExtension
    };
  }
}

// Instance singleton par défaut
export const storageManager = new StorageManager(); 