// EventBus.js
// Gestionnaire d'événements centralisé

class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * Enregistrer un listener pour un événement
   * @param {string} event - Nom de l'événement
   * @param {Function} callback - Fonction à appeler
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  /**
   * Désenregistrer un listener
   * @param {string} event - Nom de l'événement
   * @param {Function} callback - Fonction à retirer
   */
  off(event, callback) {
    if (!this.events[event]) return;
    
    const index = this.events[event].indexOf(callback);
    if (index > -1) {
      this.events[event].splice(index, 1);
    }
  }

  /**
   * Émettre un événement
   * @param {string} event - Nom de l'événement
   * @param {...any} args - Arguments à passer aux listeners
   */
  emit(event, ...args) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Erreur dans le listener de l'événement ${event}:`, error);
      }
    });
  }

  /**
   * Supprimer tous les listeners d'un événement
   * @param {string} event - Nom de l'événement
   */
  clear(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }

  /**
   * Obtenir le nombre de listeners pour un événement
   * @param {string} event - Nom de l'événement
   * @returns {number}
   */
  listenerCount(event) {
    if (!this.events[event]) return 0;
    return this.events[event].length;
  }
}

// Export global pour compatibilité version étendue (si pas module)
if (typeof window !== 'undefined') {
  window.EventBus = EventBus;
}

// Export CommonJS pour compatibilité tests Jest
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventBus;
} 