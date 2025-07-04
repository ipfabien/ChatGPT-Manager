/**
 * SearchEngine - Moteur de recherche centralisé
 * Gère la recherche dans les chats et dossiers
 */
export class SearchEngine {
  constructor() {
    this.searchIndex = null;
    this.searchTimeout = null;
    this.config = {
      minLength: 2,
      debounceDelay: 300,
      useIndex: true,
      rebuildIndexOnChange: true
    };
  }

  /**
   * Effectuer une recherche
   * @param {string} query - Requête de recherche
   * @param {Array} data - Données à rechercher
   * @returns {Array} - Résultats de recherche
   */
  performSearch(query, data) {
    if (!query || query.trim().length < this.config.minLength) {
      return [];
    }

    const searchText = query.toLowerCase().trim();
    
    // Recherche dans les données
    const results = this.searchInData(data, searchText);
    
    return results;
  }

  /**
   * Rechercher dans les données
   * @param {Array} data - Données à parcourir
   * @param {string} searchText - Texte de recherche
   * @returns {Array} - Résultats trouvés
   */
  searchInData(data, searchText) {
    const results = [];
    
    // Fonction récursive pour parcourir l'arborescence
    const searchRecursive = (node, path = []) => {
      // Vérifier le nom du nœud
      if (node.name && node.name.toLowerCase().includes(searchText)) {
        results.push({
          ...node,
          path: path.join(' / '),
          matchType: 'name'
        });
      }

      // Vérifier les tags
      if (node.tags && Array.isArray(node.tags)) {
        const tagMatch = node.tags.some(tag => 
          tag.toLowerCase().includes(searchText)
        );
        if (tagMatch) {
          results.push({
            ...node,
            path: path.join(' / '),
            matchType: 'tag'
          });
        }
      }

      // Vérifier le chemin
      const pathText = path.join(' / ').toLowerCase();
      if (pathText.includes(searchText)) {
        results.push({
          ...node,
          path: path.join(' / '),
          matchType: 'path'
        });
      }

      // Parcourir les enfants
      if (node.children && Array.isArray(node.children)) {
        const newPath = [...path, node.name];
        node.children.forEach(child => {
          searchRecursive(child, newPath);
        });
      }
    };

    // Parcourir toutes les données
    if (Array.isArray(data)) {
      data.forEach(item => searchRecursive(item));
    } else if (data && typeof data === 'object') {
      searchRecursive(data);
    }

    return results;
  }

  /**
   * Mettre en surbrillance les correspondances dans un texte
   * @param {string} text - Texte original
   * @param {string} query - Requête de recherche
   * @returns {string} - Texte avec balises HTML pour la surbrillance
   */
  highlightMatch(text, query) {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
  }

  /**
   * Échapper les caractères spéciaux pour les regex
   * @param {string} string - Chaîne à échapper
   * @returns {string} - Chaîne échappée
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Recherche avec debounce
   * @param {string} query - Requête de recherche
   * @param {Array} data - Données à rechercher
   * @param {Function} callback - Fonction de callback
   */
  searchWithDebounce(query, data, callback) {
    // Annuler le timeout précédent
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Si la requête est vide, appeler le callback immédiatement
    if (!query || query.trim().length === 0) {
      callback([]);
      return;
    }

    // Déclencher la recherche avec debounce
    this.searchTimeout = setTimeout(() => {
      const results = this.performSearch(query, data);
      callback(results);
    }, this.config.debounceDelay);
  }

  /**
   * Construire un index de recherche
   * @param {Array} data - Données à indexer
   */
  buildSearchIndex(data) {
    this.searchIndex = new Map();
    
    const indexNode = (node, path = []) => {
      const nodePath = path.join(' / ');
      
      // Indexer le nom
      if (node.name) {
        const words = node.name.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (!this.searchIndex.has(word)) {
            this.searchIndex.set(word, []);
          }
          this.searchIndex.get(word).push({
            node,
            path: nodePath,
            matchType: 'name'
          });
        });
      }

      // Indexer les tags
      if (node.tags && Array.isArray(node.tags)) {
        node.tags.forEach(tag => {
          if (!this.searchIndex.has(tag.toLowerCase())) {
            this.searchIndex.set(tag.toLowerCase(), []);
          }
          this.searchIndex.get(tag.toLowerCase()).push({
            node,
            path: nodePath,
            matchType: 'tag'
          });
        });
      }

      // Indexer les enfants
      if (node.children && Array.isArray(node.children)) {
        const newPath = [...path, node.name];
        node.children.forEach(child => {
          indexNode(child, newPath);
        });
      }
    };

    if (Array.isArray(data)) {
      data.forEach(item => indexNode(item));
    } else if (data && typeof data === 'object') {
      indexNode(data);
    }
  }

  /**
   * Recherche rapide avec index
   * @param {string} query - Requête de recherche
   * @returns {Array} - Résultats de recherche
   */
  searchWithIndex(query) {
    if (!this.searchIndex || !query) return [];

    const searchText = query.toLowerCase().trim();
    const words = searchText.split(/\s+/);
    const results = new Map();

    words.forEach(word => {
      if (this.searchIndex.has(word)) {
        this.searchIndex.get(word).forEach(result => {
          const key = result.node.id || result.node.name;
          if (!results.has(key)) {
            results.set(key, result);
          }
        });
      }
    });

    return Array.from(results.values());
  }

  /**
   * Configurer le moteur de recherche
   * @param {Object} config - Configuration
   */
  configure(config) {
    this.config = { ...this.config, ...config };
  }
}

// Instance singleton par défaut
export const searchEngine = new SearchEngine(); 