/**
 * FullManager - Gestionnaire principal du mode étendu
 * Orchestre tous les autres gestionnaires
 */
import { eventBus, EVENTS, storageManager } from '../common/utils/index.js';
import { TreeManager } from './TreeManager.js';
import { SearchManager } from './SearchManager.js';
import { DragDropManager } from './DragDropManager.js';
import { KeyboardManager } from './KeyboardManager.js';
import { UIManager } from './UIManager.js';

export class FullManager {
  constructor() {
    this.treeManager = new TreeManager();
    this.searchManager = new SearchManager();
    this.dragDropManager = new DragDropManager();
    this.keyboardManager = new KeyboardManager();
    this.uiManager = new UIManager();
    
    this.isInitialized = false;
    this.isExtension = typeof chrome !== 'undefined' && chrome.storage;
  }

  /**
   * Initialiser le gestionnaire principal
   */
  async init() {
    if (this.isInitialized) {
      console.warn('FullManager déjà initialisé');
      return;
    }

    try {
      console.log('🚀 Initialisation de FullManager...');

      // Initialiser les gestionnaires dans l'ordre
      await this.treeManager.init();
      await this.searchManager.init();
      await this.dragDropManager.init();
      await this.keyboardManager.init();
      await this.uiManager.init();

      // Charger les données
      await this.treeManager.loadData();

      // Rendre l'arborescence
      this.treeManager.render();

      // Configurer les événements
      this.setupEventListeners();

      // Exposer les fonctions globales
      this.exposeGlobalFunctions();

      this.isInitialized = true;
      console.log('✅ FullManager initialisé avec succès');
      
      // Émettre l'événement d'initialisation
      eventBus.emit(EVENTS.FULL_MANAGER_READY);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de FullManager:', error);
      throw error;
    }
  }

  /**
   * Configurer les écouteurs d'événements
   */
  setupEventListeners() {
    // Événements de l'arborescence
    eventBus.on(EVENTS.TREE_RENDERED, () => {
      console.log('📋 Arborescence rendue, mise à jour de l\'interface...');
      this.uiManager.updateStatus();
    });

    eventBus.on(EVENTS.TREE_NODE_SELECTED, (nodeId) => {
      console.log('🎯 Nœud sélectionné:', nodeId);
      this.uiManager.updateSelection(nodeId);
    });

    eventBus.on(EVENTS.TREE_NODE_ADDED, (node) => {
      console.log('➕ Nœud ajouté:', node.name);
      this.uiManager.showNotification(`Nœud "${node.name}" ajouté`);
    });

    eventBus.on(EVENTS.TREE_NODE_DELETED, (nodeId) => {
      console.log('🗑️ Nœud supprimé:', nodeId);
      this.uiManager.showNotification('Nœud supprimé');
    });

    eventBus.on(EVENTS.DATA_SAVED, (data) => {
      console.log('💾 Données sauvegardées');
      this.uiManager.updateStatus();
    });
  }

  /**
   * Exposer les fonctions globales pour l'interface HTML
   */
  exposeGlobalFunctions() {
    // Fonctions de l'arborescence
    window.addChat = (parentId) => {
      this.treeManager.addChat(parentId);
    };

    window.addFolder = (parentId) => {
      this.treeManager.addFolder(parentId);
    };

    window.editNode = (nodeId) => {
      this.editNode(nodeId);
    };

    window.deleteNode = (nodeId) => {
      this.treeManager.deleteNode(nodeId);
    };

    // Fonctions de navigation
    window.resetData = () => {
      this.resetData();
    };

    window.loadTestData = () => {
      this.loadTestData();
    };

    window.exportData = () => {
      this.exportData();
    };

    window.importData = () => {
      this.importData();
    };

    console.log('🌐 Fonctions globales exposées');
  }

  /**
   * Éditer un nœud
   * @param {string} nodeId - ID du nœud à éditer
   */
  editNode(nodeId) {
    const node = this.treeManager.findById(this.treeManager.data, nodeId);
    if (!node) return;

    const newName = prompt('Nouveau nom:', node.name);
    if (newName && newName.trim() !== '') {
      node.name = newName.trim();
      this.treeManager.saveData();
      this.treeManager.render();
      
      eventBus.emit(EVENTS.TREE_NODE_EDITED, nodeId);
      this.uiManager.showNotification(`Nœud renommé en "${newName}"`);
    }
  }

  /**
   * Réinitialiser les données
   */
  async resetData() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
      await this.treeManager.resetData();
      this.uiManager.showNotification('Données réinitialisées');
    }
  }

  /**
   * Exporter les données
   */
  exportData() {
    try {
      const data = this.treeManager.data;
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-manager-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.uiManager.showNotification('Données exportées');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'export:', error);
      this.uiManager.showNotification('Erreur lors de l\'export', 'error');
    }
  }

  /**
   * Importer les données
   */
  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Validation basique
        if (!data || !data.id || !data.type) {
          throw new Error('Format de fichier invalide');
        }

        this.treeManager.data = data;
        await this.treeManager.saveData();
        this.treeManager.render();
        
        this.uiManager.showNotification('Données importées avec succès');
        
      } catch (error) {
        console.error('❌ Erreur lors de l\'import:', error);
        this.uiManager.showNotification('Erreur lors de l\'import: ' + error.message, 'error');
      }
    };

    input.click();
  }

  /**
   * Charger les données de test
   */
  async loadTestData() {
    try {
      console.log('🧪 Chargement des données de test...');
      
      // Forcer la création de données de test
      this.treeManager.data = this.treeManager.createDefaultData();
      await this.treeManager.saveData();
      this.treeManager.render();
      
      this.uiManager.showNotification('Données de test chargées');
      console.log('✅ Données de test chargées');
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données de test:', error);
      this.uiManager.showNotification('Erreur lors du chargement des données de test', 'error');
    }
  }

  /**
   * Obtenir l'état du gestionnaire
   * @returns {Object} - État actuel
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      treeManager: this.treeManager.getState(),
      searchManager: this.searchManager.getState(),
      dragDropManager: this.dragDropManager.getState(),
      keyboardManager: this.keyboardManager.getState(),
      uiManager: this.uiManager.getState()
    };
  }

  /**
   * Nettoyer les ressources
   */
  destroy() {
    if (!this.isInitialized) return;

    try {
      // Nettoyer les gestionnaires
      this.treeManager.destroy();
      this.searchManager.destroy();
      this.dragDropManager.destroy();
      this.keyboardManager.destroy();
      this.uiManager.destroy();

      // Supprimer les fonctions globales
      delete window.addChat;
      delete window.addFolder;
      delete window.editNode;
      delete window.deleteNode;
      delete window.resetData;
      delete window.loadTestData;
      delete window.exportData;
      delete window.importData;

      this.isInitialized = false;
      console.log('✅ FullManager détruit');
      
    } catch (error) {
      console.error('❌ Erreur lors de la destruction de FullManager:', error);
    }
  }
} 