// SearchEngine.js
// Service de recherche et d'indexation des chats et dossiers

class SearchEngine {
  constructor() {
    this.searchIndex = null;
    this.searchTimeout = null;
    this.isSearchMode = false;
    this.currentSearchQuery = '';
    this.config = {
      minLength: 2,
      debounceDelay: 400,
      useIndex: true,
      rebuildIndexOnChange: true
    };
  }

  /**
   * Construire l'index de recherche
   * @param {Object} tree
   */
  buildIndex(tree) {
    this.searchIndex = [];
    this._indexNode(tree, []);
  }

  /**
   * Indexer récursivement un nœud
   * @param {Object} node
   * @param {Array} path
   */
  _indexNode(node, path = []) {
    const currentPath = [...path, node.name];
    
    if (node.type === 'chat') {
      this.searchIndex.push({
        id: node.id,
        name: node.name,
        type: 'chat',
        path: currentPath,
        fullPath: currentPath,
        link: node.link,
        tag: node.tag
      });
    }
    
    if (node.children && node.children.length) {
      for (const child of node.children) {
        this._indexNode(child, currentPath);
      }
    }
  }

  /**
   * Reconstruire l'index de recherche
   * @param {Object} tree
   */
  rebuildIndex(tree) {
    if (this.config.rebuildIndexOnChange) {
      this.buildIndex(tree);
    }
  }

  /**
   * Rechercher dans l'index
   * @param {string} query
   * @returns {Array}
   */
  search(query) {
    if (!query || query.length < this.config.minLength) {
      return [];
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    return this.searchIndex.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(normalizedQuery);
      const tagMatch = item.tag && item.tag.toLowerCase().includes(normalizedQuery);
      return nameMatch || tagMatch;
    });
  }

  /**
   * Effectuer une recherche avec debounce
   * @param {string} query
   * @param {Function} callback
   */
  performSearch(query, callback) {
    // Annuler le timeout précédent
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    // Si la requête est vide, effacer la recherche
    if (!query || query.trim() === '') {
      this.clearSearch();
      if (callback) callback([]);
      return;
    }
    
    // Déclencher la recherche avec debounce
    this.searchTimeout = setTimeout(() => {
      const results = this.search(query);
      this.currentSearchQuery = query;
      this.isSearchMode = true;
      if (callback) callback(results);
    }, this.config.debounceDelay);
  }

  /**
   * Effacer la recherche
   */
  clearSearch() {
    this.isSearchMode = false;
    this.currentSearchQuery = '';
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
  }

  /**
   * Obtenir l'état de la recherche
   * @returns {Object}
   */
  getSearchState() {
    return {
      isSearchMode: this.isSearchMode,
      currentQuery: this.currentSearchQuery,
      hasIndex: this.searchIndex !== null
    };
  }

  /**
   * Initialiser le moteur de recherche avec les données
   * @param {Object} data - Données de l'arbre
   */
  initialize(data) {
    if (data) {
      this.buildIndex(data);
    }
  }
}

// Exposer globalement pour le navigateur
window.SearchEngine = SearchEngine;

// Exportation pour les tests Jest
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchEngine;
} 