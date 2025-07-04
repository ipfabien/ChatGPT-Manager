// UserPreferences.js
// Service de gestion des préférences utilisateur (thème, taille de police)

class UserPreferences {
  constructor(storageManager = null) {
    this.storageManager = storageManager;
    this.defaultPreferences = {
      theme: 'light',
      fontSize: 'normal'
    };
    this.currentPreferences = { ...this.defaultPreferences };
  }

  /**
   * Charger les préférences utilisateur
   * @returns {Promise<Object>}
   */
  async loadPreferences() {
    try {
      if (!this.storageManager) {
        console.warn('StorageManager non disponible, utilisation des préférences par défaut');
        return this.defaultPreferences;
      }
      
      const savedPrefs = await this.storageManager.loadPreferences(['theme', 'fontSize']);
      if (savedPrefs) {
        this.currentPreferences = { ...this.defaultPreferences, ...savedPrefs };
      }
      return this.currentPreferences;
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
      return this.defaultPreferences;
    }
  }

  /**
   * Sauvegarder les préférences utilisateur
   * @param {Object} preferences
   * @returns {Promise<void>}
   */
  async savePreferences(preferences) {
    try {
      this.currentPreferences = { ...this.currentPreferences, ...preferences };
      
      if (this.storageManager) {
        await this.storageManager.savePreferences(this.currentPreferences);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
    }
  }

  /**
   * Obtenir les préférences actuelles
   * @returns {Object}
   */
  getPreferences() {
    return { ...this.currentPreferences };
  }

  /**
   * Définir le thème
   * @param {string} theme - 'light' ou 'dark'
   * @returns {Promise<void>}
   */
  async setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
      throw new Error('Thème invalide. Utilisez "light" ou "dark"');
    }
    await this.savePreferences({ theme });
  }

  /**
   * Définir la taille de police
   * @param {string} fontSize - 'normal' ou 'large'
   * @returns {Promise<void>}
   */
  async setFontSize(fontSize) {
    if (fontSize !== 'normal' && fontSize !== 'large') {
      throw new Error('Taille de police invalide. Utilisez "normal" ou "large"');
    }
    await this.savePreferences({ fontSize });
  }

  /**
   * Appliquer les préférences au DOM
   * @param {HTMLElement} element - Élément racine (optionnel, par défaut document.body)
   */
  applyPreferences(element = document.body) {
    if (!element) return;

    // Appliquer le thème
    element.classList.remove('light-mode', 'dark-mode');
    element.classList.add(`${this.currentPreferences.theme}-mode`);

    // Appliquer la taille de police
    element.classList.remove('font-normal', 'font-large');
    element.classList.add(`font-${this.currentPreferences.fontSize}`);

    // Mettre à jour l'icône du thème si elle existe
    const themeIcon = element.querySelector('#toggle-theme .material-icons');
    if (themeIcon) {
      themeIcon.textContent = this.currentPreferences.theme === 'light' ? 'light_mode' : 'dark_mode';
    }
  }

  /**
   * Réinitialiser les préférences aux valeurs par défaut
   * @returns {Promise<void>}
   */
  async resetPreferences() {
    this.currentPreferences = { ...this.defaultPreferences };
    await this.savePreferences(this.currentPreferences);
  }
}

// Exposer globalement pour le navigateur
if (typeof window !== 'undefined') {
  window.UserPreferences = UserPreferences;
}

// Exportation pour les tests Jest
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UserPreferences;
} 