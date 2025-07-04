/**
 * full.js - Point d'entrée principal du mode étendu
 * Utilise l'architecture orientée objet avec FullManager
 */

import { FullManager } from './FullManager.js';
import { eventBus, EVENTS } from '../common/utils/index.js';

// Créer une instance du gestionnaire principal
const fullManager = new FullManager();

// Initialisation du mode étendu
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('🚀 Initialisation du mode étendu...');
    
    // Initialiser le gestionnaire principal
    await fullManager.init();
    
    // Configurer les event listeners globaux
    setupGlobalEventListeners();
    
    console.log('✅ Mode étendu initialisé avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation du mode étendu:', error);
    
    // Afficher une notification d'erreur
    showErrorNotification('Erreur lors de l\'initialisation du mode étendu');
  }

  // Gestion centralisée des clics sur l'arborescence
  const treeContainer = document.getElementById('tree-container');
  if (treeContainer) {
    treeContainer.addEventListener('click', (e) => {
      const actionEl = e.target.closest('[data-action]');
      if (actionEl) {
        const action = actionEl.getAttribute('data-action');
        const nodeId = actionEl.getAttribute('data-id');
        if (!action || !nodeId) return;
        switch (action) {
          case 'addChat':
            fullManager.treeManager.startCreateChat(nodeId);
            break;
          case 'addFolder':
            fullManager.treeManager.startCreateFolder(nodeId);
            break;
          case 'editNode':
            fullManager.treeManager.startEditNode(nodeId);
            break;
          case 'deleteNode':
            fullManager.treeManager.deleteNode(nodeId);
            break;
          case 'toggle':
            fullManager.treeManager.toggleFolder(nodeId);
            break;
        }
        e.stopPropagation();
        e.preventDefault();
      }
      // Gestion annulation formulaire inline
      if (e.target.closest('.cancel-btn')) {
        fullManager.treeManager.clearInlineForms(fullManager.treeManager.data);
        fullManager.treeManager.render();
        e.stopPropagation();
        e.preventDefault();
      }
    });
    // Gestion soumission des formulaires inline
    treeContainer.addEventListener('submit', (e) => {
      const form = e.target.closest('form.inline-form');
      if (form) {
        const formType = form.getAttribute('data-form-type');
        const nodeId = form.getAttribute('data-id');
        const name = form.elements['name'].value.trim();
        if (!name) return;
        switch (formType) {
          case 'create-chat': {
            const link = form.elements['link'] ? form.elements['link'].value.trim() : '';
            const tag = form.elements['tag'] ? form.elements['tag'].value.trim() : '';
            if (!link) return;
            fullManager.treeManager.createChat(nodeId, name, link, tag);
            break;
          }
          case 'create-folder':
            fullManager.treeManager.createFolder(nodeId, name);
            break;
          case 'edit':
            fullManager.treeManager.updateNodeName(nodeId, name);
            break;
        }
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }
});

/**
 * Configurer les event listeners globaux
 */
function setupGlobalEventListeners() {
  // Événements de l'arborescence
  eventBus.on(EVENTS.TREE_NODE_ADDED, (node) => {
    console.log('➕ Nœud ajouté:', node.name);
  });

  eventBus.on(EVENTS.TREE_NODE_EDITED, (nodeId) => {
    console.log('✏️ Nœud édité:', nodeId);
  });

  eventBus.on(EVENTS.TREE_NODE_DELETED, (nodeId) => {
    console.log('🗑️ Nœud supprimé:', nodeId);
  });

  eventBus.on(EVENTS.TREE_NODE_MOVED, (sourceId, targetId) => {
    console.log('🔄 Nœud déplacé:', sourceId, '→', targetId);
  });

  eventBus.on(EVENTS.TREE_RENDERED, () => {
    console.log('🌳 Arborescence rendue');
  });

  // Événements de recherche
  eventBus.on(EVENTS.SEARCH_STARTED, (query) => {
    console.log('🔍 Recherche démarrée:', query);
  });

  eventBus.on(EVENTS.SEARCH_RESULTS_UPDATED, (results) => {
    console.log('📋 Résultats de recherche:', results.length);
  });

  // Événements de drag & drop
  eventBus.on(EVENTS.DRAG_STARTED, (nodeId) => {
    console.log('🎯 Drag démarré:', nodeId);
  });

  eventBus.on(EVENTS.DROP_OCCURRED, (sourceId, targetId) => {
    console.log('🎯 Drop effectué:', sourceId, '→', targetId);
  });

  // Événements de navigation clavier
  eventBus.on(EVENTS.KEYBOARD_SHORTCUT, (shortcut) => {
    console.log('⌨️ Raccourci clavier:', shortcut);
  });

  // Événement d'initialisation complète
  eventBus.on(EVENTS.FULL_MANAGER_READY, () => {
    console.log('🎉 Mode étendu complètement initialisé');
    
    // Afficher une notification de succès
    showSuccessNotification('Mode étendu prêt !');
    
    // Masquer l'indicateur de chargement si présent
    hideLoadingIndicator();
    
    // Configurer les boutons de debug
    setupDebugButtons();
  });
}

/**
 * Configurer les boutons de debug
 */
function setupDebugButtons() {
  // Bouton Reset
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (fullManager) {
        fullManager.resetData();
      }
    });
  }

  // Bouton Test Data
  const testDataBtn = document.getElementById('testDataBtn');
  if (testDataBtn) {
    testDataBtn.addEventListener('click', () => {
      if (fullManager) {
        fullManager.loadTestData();
      }
    });
  }

  // Bouton Logs
  const logsBtn = document.getElementById('logsBtn');
  if (logsBtn) {
    logsBtn.addEventListener('click', () => {
      const debugArea = document.getElementById('debug-area');
      if (debugArea) {
        debugArea.style.display = debugArea.style.display === 'none' ? 'block' : 'none';
      }
    });
  }
}

/**
 * Afficher une notification d'erreur
 * @param {string} message - Message d'erreur
 */
function showErrorNotification(message) {
  if (fullManager && fullManager.uiManager) {
    fullManager.uiManager.showNotification(message, 'error');
  } else {
    alert(`Erreur: ${message}`);
  }
}

/**
 * Afficher une notification de succès
 * @param {string} message - Message de succès
 */
function showSuccessNotification(message) {
  if (fullManager && fullManager.uiManager) {
    fullManager.uiManager.showNotification(message, 'success', 3000);
  }
}

/**
 * Masquer l'indicateur de chargement
 */
function hideLoadingIndicator() {
  const loader = document.getElementById('loading-indicator');
  if (loader) {
    loader.style.display = 'none';
  }
}

/**
 * Nettoyer les ressources lors de la fermeture
 */
window.addEventListener('beforeunload', () => {
  console.log('🧹 Nettoyage des ressources du mode étendu...');
  
  if (fullManager) {
    fullManager.destroy();
  }
});

// Exposer le gestionnaire pour le débogage
window.fullManager = fullManager;

console.log('📦 Mode étendu chargé - Architecture orientée objet active'); 