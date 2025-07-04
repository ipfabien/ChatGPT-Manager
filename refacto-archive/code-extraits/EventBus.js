/**
 * EventBus - Gestionnaire d'événements centralisé
 * Permet la communication entre les différents modules
 */
export const EVENTS = {
  // Événements généraux
  INIT_STARTED: 'init:started',
  INIT_COMPLETED: 'init:completed',
  ERROR_OCCURRED: 'error:occurred',
  
  // Événements de données
  DATA_LOADED: 'data:loaded',
  DATA_SAVED: 'data:saved',
  DATA_CHANGED: 'data:changed',
  
  // Événements de l'arborescence
  TREE_RENDERED: 'tree:rendered',
  TREE_NODE_SELECTED: 'tree:node:selected',
  TREE_NODE_ADDED: 'tree:node:added',
  TREE_NODE_DELETED: 'tree:node:deleted',
  TREE_NODE_EDITED: 'tree:node:edited',
  TREE_NODE_MOVED: 'tree:node:moved',
  TREE_NODE_EXPANDED: 'tree:node:expanded',
  TREE_NODE_COLLAPSED: 'tree:node:collapsed',
  
  // Événements de recherche
  SEARCH_STARTED: 'search:started',
  SEARCH_COMPLETED: 'search:completed',
  SEARCH_RESULTS_UPDATED: 'search:results:updated',
  SEARCH_CLEARED: 'search:cleared',
  
  // Événements de drag & drop
  DRAG_STARTED: 'drag:started',
  DRAG_ENDED: 'drag:ended',
  DROP_OCCURRED: 'drop:occurred',
  
  // Événements clavier
  KEYBOARD_SHORTCUT: 'keyboard:shortcut',
  
  // Événements UI
  UI_UPDATE_REQUESTED: 'ui:update:requested',
  NOTIFICATION_SHOW: 'notification:show',
  
  // Événements des gestionnaires
  FULL_MANAGER_READY: 'full:manager:ready',
  POPUP_MANAGER_READY: 'popup:manager:ready'
};

class EventBus {
  constructor() {
    this.events = {};
    this.isInitialized = false;
  }

  /**
   * Initialiser l'EventBus
   */
  init() {
    if (this.isInitialized) {
      console.warn('EventBus déjà initialisé');
      return;
    }

    this.events = {};
    this.isInitialized = true;
    console.log('✅ EventBus initialisé');
  }

  /**
   * S'abonner à un événement
   * @param {string} event - Nom de l'événement
   * @param {Function} callback - Fonction de callback
   * @returns {Function} - Fonction de désabonnement
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(callback);
    
    // Retourner une fonction pour se désabonner
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Se désabonner d'un événement
   * @param {string} event - Nom de l'événement
   * @param {Function} callback - Fonction de callback à retirer
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
   * @param {...any} args - Arguments à passer aux callbacks
   */
  emit(event, ...args) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`❌ Erreur dans le callback de l'événement ${event}:`, error);
        // Émettre un événement d'erreur
        this.emit(EVENTS.ERROR_OCCURRED, error, event);
      }
    });
  }

  /**
   * S'abonner à un événement une seule fois
   * @param {string} event - Nom de l'événement
   * @param {Function} callback - Fonction de callback
   */
  once(event, callback) {
    const onceCallback = (...args) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    
    this.on(event, onceCallback);
  }

  /**
   * Supprimer tous les abonnements d'un événement
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
   * Obtenir le nombre d'abonnés pour un événement
   * @param {string} event - Nom de l'événement
   * @returns {number} - Nombre d'abonnés
   */
  listenerCount(event) {
    return this.events[event] ? this.events[event].length : 0;
  }

  /**
   * Obtenir la liste des événements actifs
   * @returns {string[]} - Liste des événements
   */
  getEventNames() {
    return Object.keys(this.events);
  }

  /**
   * Obtenir l'état de l'EventBus
   * @returns {Object} - État actuel
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      eventCount: Object.keys(this.events).length,
      totalListeners: Object.values(this.events).reduce((sum, listeners) => sum + listeners.length, 0),
      events: this.getEventNames()
    };
  }

  /**
   * Nettoyer les ressources
   */
  destroy() {
    if (!this.isInitialized) return;

    try {
      this.clear();
      this.isInitialized = false;
      console.log('✅ EventBus détruit');
      
    } catch (error) {
      console.error('❌ Erreur lors de la destruction de EventBus:', error);
    }
  }
}

// Instance singleton
export const eventBus = new EventBus(); 