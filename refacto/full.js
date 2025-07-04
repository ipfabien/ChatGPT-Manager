/*
 * full.js - Point d'entrée principal du mode étendu
 * Utilise l'architecture orientée objet avec tous les modules refactorisés
 */

// Les modules sont chargés via des balises script dans le HTML
// et exposés globalement

// Import de la config globale
const debugLog = (typeof window !== 'undefined') ? window.debugLog : require('./utils/helpers.js').debugLog;

// UIManager est chargé globalement via <script> dans full.html

// Utilisation directe des classes globales sans redéclaration
const userPreferences = new window.UserPreferences();
const eventBus = new window.EventBus();
const uiManager = new window.UIManager(eventBus, 'full');
const treeManager = new window.TreeManager();
const keyboardManager = new window.KeyboardManager();

// Classe principale pour gérer l'application
class FullApplication {
  constructor() {
    this.eventBus = new window.EventBus();
    this.storageManager = new StorageManager();
    this.treeManager = new TreeManager();
    this.searchEngine = new SearchEngine();
    this.userPreferences = new UserPreferences(this.storageManager);
    this.keyboardManager = new KeyboardManager();
    this.uiManager = new window.UIManager(this.eventBus);
    
    this.isInitialized = false;
  }

  async initialize() {
    try {
      debugLog('Initialisation de l\'application...');
      
      // Initialiser les préférences utilisateur
      await this.userPreferences.loadPreferences();
      
      // Initialiser le stockage et charger les données
      await this.storageManager.initialize();
      const data = await this.storageManager.loadData();
      debugLog('Données chargées:', data);
      
      // Initialiser le gestionnaire d'arbre avec les données
      this.treeManager = new TreeManager(data);
      debugLog('TreeManager initialisé avec root:', this.treeManager.root);
      
      // Initialiser le moteur de recherche
      this.searchEngine.initialize(data);
      
      // Initialiser la navigation clavier
      this.keyboardManager.initialize();
      
      // Rendre l'arborescence
      debugLog('Rendu de l\'arbre initial...');
      this.renderTree();
      
      // Attacher les événements
      this.attachEventListeners();
      
      this.isInitialized = true;
      debugLog('Application initialisée avec succès');
      
    } catch (error) {
      debugLog('Erreur lors de l\'initialisation:', error);
    }
  }

  renderTree() {
    const treeContainer = document.getElementById('tree-container');
    if (treeContainer) {
      const data = this.treeManager.root;
      this.uiManager.renderTree(data, treeContainer);
    }
  }

  attachEventListeners() {
    // Écouter les événements de l'arbre
    this.eventBus.on('node:add', this.handleNodeAdd.bind(this));
    this.eventBus.on('node:edit', this.handleNodeEdit.bind(this));
    this.eventBus.on('node:delete', this.handleNodeDelete.bind(this));
    this.eventBus.on('node:toggle', this.handleNodeToggle.bind(this));
    this.eventBus.on('node:move', this.handleNodeMove.bind(this));
    this.eventBus.on('tree:refresh', this.renderTree.bind(this));
    
    // Écouter les événements de recherche
    this.eventBus.on('search:perform', this.handleSearch.bind(this));
    this.eventBus.on('search:clear', this.handleSearchClear.bind(this));
    this.eventBus.on('search:edit', (result, item) => {
      this.uiManager.showEditForm(result, item);
    });
    this.eventBus.on('search:delete', (result) => {
      this.handleNodeDelete(result.id, true);
    });
    
    // Écouter les événements de préférences
    this.eventBus.on('preferences:change', this.handlePreferencesChange.bind(this));
    
    // Attacher les listeners DOM
    this.attachDOMEventListeners();
  }

  attachDOMEventListeners() {
    // Barre de recherche
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query === '') {
          this.eventBus.emit('search:clear');
        } else {
          this.eventBus.emit('search:perform', query);
        }
      });
    }

    // Gestion des formulaires
    this.attachFormListeners();

    // Boutons tout ouvrir/fermer
    const btnToutOuvrir = document.querySelector('.search-bar button[title="Tout ouvrir"]');
    if (btnToutOuvrir) {
      btnToutOuvrir.addEventListener('click', () => {
        this.treeManager.expandAll();
        this.renderTree();
      });
    }

    const btnToutFermer = document.querySelector('.search-bar button[title="Tout fermer"]');
    if (btnToutFermer) {
      btnToutFermer.addEventListener('click', () => {
        this.treeManager.collapseAll();
        this.renderTree();
      });
    }

    // Boutons de debug
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ?')) {
          this.storageManager.clearData();
          this.treeManager.initialize({ id: "root", name: "Accueil", type: "folder", children: [], expanded: true });
          this.renderTree();
        }
      });
    }

    const logsBtn = document.getElementById('logsBtn');
    if (logsBtn) {
      logsBtn.style.display = (window.CONFIG && window.CONFIG.DEBUG) ? 'inline-block' : 'none';
    }

    // Boutons de thème et taille
    const toggleThemeBtn = document.getElementById('toggle-theme');
    if (toggleThemeBtn) {
      toggleThemeBtn.addEventListener('click', () => {
        const prefs = this.userPreferences.getPreferences();
        const newTheme = prefs.theme === 'light' ? 'dark' : 'light';
        this.userPreferences.setTheme(newTheme);
      });
    }

    const toggleFontSizeBtn = document.getElementById('toggle-font-size');
    if (toggleFontSizeBtn) {
      toggleFontSizeBtn.addEventListener('click', () => {
        const prefs = this.userPreferences.getPreferences();
        const newSize = prefs.fontSize === 'normal' ? 'large' : 'normal';
        this.userPreferences.setFontSize(newSize);
      });
    }
  }

  attachFormListeners() {
    debugLog('=== attachFormListeners appelé ===');
    
    // Écouter les soumissions de formulaires via event delegation
    document.addEventListener('submit', (e) => {
      debugLog('=== Événement submit détecté ===');
      debugLog('e.target:', e.target);
      
      const form = e.target;
      const formContainer = form.closest('.inline-form');
      debugLog('formContainer:', formContainer);
      
      if (formContainer) {
        e.preventDefault();
        debugLog('Formulaire inline détecté, traitement...');
        
        // Déterminer le type de formulaire basé sur le contenu
        const hasUrlInput = form.querySelector('input[type="url"]');
        const isEdit = formContainer.id.includes('edit');
        
        debugLog('hasUrlInput:', hasUrlInput);
        debugLog('isEdit:', isEdit);
        
        if (isEdit) {
          debugLog('Appel handleEditFormSubmit');
          this.handleEditFormSubmit(form);
        } else if (hasUrlInput) {
          debugLog('Appel handleChatFormSubmit');
          this.handleChatFormSubmit(form);
        } else {
          debugLog('Appel handleFolderFormSubmit');
          this.handleFolderFormSubmit(form);
        }
      } else {
        debugLog('Pas de formulaire inline détecté');
      }
    });

    // Écouter les boutons d'annulation
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('close-btn')) {
        e.preventDefault();
        this.uiManager.hideAllForms();
      }
    });
  }

  // Gestionnaires d'événements
  async handleNodeAdd(type, parentId, data) {
    try {
      // Afficher le formulaire approprié
      if (type === 'folder') {
        this.uiManager.showAddFolderForm(parentId);
      } else if (type === 'chat') {
        this.uiManager.showAddChatForm(parentId);
      }
    } catch (error) {
      this.uiManager.showNotification('Erreur lors de l\'affichage du formulaire', 'error');
    }
  }

  async handleNodeEdit(nodeId, data) {
    try {
      const node = this.treeManager.findById(this.treeManager.root, nodeId);
      if (node) {
        this.uiManager.showEditForm(node);
      }
    } catch (error) {
      this.uiManager.showNotification('Erreur lors de l\'affichage du formulaire', 'error');
    }
  }

  async handleNodeDelete(nodeId, stayInSearch = false) {
    try {
      const node = this.treeManager.findById(this.treeManager.root, nodeId);
      if (!node) return;
      if (node.type === 'folder' && node.id === 'root') {
        this.uiManager.showNotification('Le dossier racine ne peut pas être supprimé.', 'error');
        return;
      }
      const confirmMessage = node.type === 'folder' 
        ? `Êtes-vous sûr de vouloir supprimer le dossier "${node.name}" ? Les chats seront déplacés vers le dossier parent.`
        : `Êtes-vous sûr de vouloir supprimer le chat "${node.name}" ?`;
      if (confirm(confirmMessage)) {
        const success = this.treeManager.deleteNode(nodeId);
        if (success) {
          await this.storageManager.saveData(this.treeManager.getData());
          if (stayInSearch && this.uiManager.isSearchMode && this.uiManager.currentSearchQuery) {
            const results = this.searchEngine.search(this.uiManager.currentSearchQuery);
            this.uiManager.showSearchResults(results, this.uiManager.currentSearchQuery, this.uiManager.currentSearchPage);
          } else {
            this.renderTree();
          }
        } else {
          this.uiManager.showNotification('Impossible de supprimer cet élément', 'error');
        }
      }
    } catch (error) {
      this.uiManager.showNotification('Erreur lors de la suppression', 'error');
    }
  }

  handleNodeToggle(nodeId) {
    this.treeManager.toggleNode(nodeId);
    this.renderTree();
  }

  async handleNodeMove(sourceId, targetId) {
    try {
      const success = this.treeManager.moveNode(sourceId, targetId);
      if (success) {
        await this.storageManager.saveData(this.treeManager.getData());
        // Re-rendre immédiatement
        this.renderTree();
      } else {
        this.uiManager.showNotification('Impossible de déplacer cet élément', 'error');
      }
    } catch (error) {
      this.uiManager.showNotification('Erreur lors du déplacement', 'error');
    }
  }

  handleSearch(query) {
    const results = this.searchEngine.search(query);
    this.uiManager.showSearchResults(results, query, 1);
  }

  handleSearchClear() {
    this.uiManager.clearSearchResults();
    this.renderTree();
    
    // Vider la barre de recherche
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
      searchInput.value = '';
    }
  }

  async handlePreferencesChange(preferences) {
    try {
      await this.userPreferences.savePreferences(preferences);
      this.uiManager.showNotification('Préférences sauvegardées', 'success');
    } catch (error) {
      this.uiManager.showNotification('Erreur lors de la sauvegarde des préférences', 'error');
    }
  }

  // Gestionnaires de formulaires
  async handleFolderFormSubmit(form) {
    try {
      debugLog('handleFolderFormSubmit appelé');
      debugLog('form:', form);
      debugLog('currentAddParentId:', this.uiManager.currentAddParentId);
      
      const nameInput = form.querySelector('input[type="text"]');
      const name = nameInput ? nameInput.value.trim() : '';
      
      debugLog('name:', name);
      
      if (!name) {
        this.uiManager.showNotification('Le nom du dossier est requis', 'error');
        return;
      }

      const data = { name };
      debugLog('data:', data);
      debugLog('treeManager:', this.treeManager);
      
      const newNode = this.treeManager.createNode('folder', this.uiManager.currentAddParentId, data);
      debugLog('newNode:', newNode);
      
      if (newNode) {
        debugLog('Nœud créé avec succès, sauvegarde...');
        await this.storageManager.saveData(this.treeManager.getData());
        
        // S'assurer que le dossier parent est développé
        const parent = this.treeManager.findById(this.treeManager.root, this.uiManager.currentAddParentId);
        if (parent && parent.type === 'folder') {
          parent.expanded = true;
          debugLog('Dossier parent développé:', parent.name);
        }
        
        debugLog('Données sauvegardées, re-rendu de l\'arbre...');
        this.renderTree();
        debugLog('Arbre re-rendu, masquage des formulaires...');
        this.uiManager.hideAllForms();
        debugLog('Formulaires masqués');
      } else {
        this.uiManager.showNotification('Erreur lors de la création du dossier', 'error');
      }
    } catch (error) {
      debugLog('Erreur handleFolderFormSubmit:', error);
      this.uiManager.showNotification('Erreur lors de la création du dossier', 'error');
    }
  }

  async handleChatFormSubmit(form) {
    try {
      const inputs = form.querySelectorAll('input');
      const name = inputs[0] ? inputs[0].value.trim() : ''; // Premier input (nom)
      const link = inputs[1] ? inputs[1].value.trim() : ''; // Deuxième input (lien)
      const tag = inputs[2] ? inputs[2].value.trim() : '';  // Troisième input (tag)

      if (!name || !link) {
        this.uiManager.showNotification('Le nom et le lien du chat sont requis', 'error');
        return;
      }

      const data = { name, link, tag };
      const newNode = this.treeManager.createNode('chat', this.uiManager.currentAddParentId, data);
      
      if (newNode) {
        await this.storageManager.saveData(this.treeManager.getData());
        this.renderTree();
        this.uiManager.hideAllForms();
        this.searchEngine.initialize(this.treeManager.getData());
        if (this.uiManager.isSearchMode && this.uiManager.currentSearchQuery) {
          const results = this.searchEngine.search(this.uiManager.currentSearchQuery);
          this.uiManager.showSearchResults(results, this.uiManager.currentSearchQuery, 1);
        }
      } else {
        this.uiManager.showNotification('Erreur lors de la création du chat', 'error');
      }
    } catch (error) {
      debugLog('Erreur handleChatFormSubmit:', error);
      this.uiManager.showNotification('Erreur lors de la création du chat', 'error');
    }
  }

  async handleEditFormSubmit(form) {
    try {
      const inputs = form.querySelectorAll('input');
      const name = inputs[0] ? inputs[0].value.trim() : '';
      const node = this.uiManager.currentEditNode;
      if (!name) {
        this.uiManager.showNotification('Le nom est requis', 'error');
        return;
      }
      const data = { name };
      if (node.type === 'chat') {
        const link = inputs[1] ? inputs[1].value.trim() : '';
        const tag = inputs[2] ? inputs[2].value.trim() : '';
        if (!link) {
          this.uiManager.showNotification('Le lien est requis', 'error');
          return;
        }
        data.link = link;
        data.tag = tag;
      }
      const success = this.treeManager.updateNode(node.id, data);
      if (success) {
        await this.storageManager.saveData(this.treeManager.getData());
        this.searchEngine.initialize(this.treeManager.getData());
        if (this.uiManager.isSearchMode && this.uiManager.currentSearchQuery) {
          const results = this.searchEngine.search(this.uiManager.currentSearchQuery);
          this.uiManager.showSearchResults(results, this.uiManager.currentSearchQuery, this.uiManager.currentSearchPage);
        } else {
          this.renderTree();
        }
        this.uiManager.hideAllForms();
      } else {
        this.uiManager.showNotification('Erreur lors de la modification', 'error');
      }
    } catch (error) {
      debugLog('Erreur handleEditFormSubmit:', error);
      this.uiManager.showNotification('Erreur lors de la modification', 'error');
    }
  }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
  const app = new FullApplication();
  app.initialize();
});