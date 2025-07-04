// KeyboardManager.js
// Gestion de la navigation clavier et des raccourcis

class KeyboardManager {
  constructor() {
    this.selectedNodeId = null;
    this.keyboardNavigationEnabled = true;
    this.focusableElements = [];
    this.config = {
      enableNavigation: true,
      enableShortcuts: true
    };
  }

  /**
   * Initialiser la navigation clavier
   * @param {HTMLElement} container
   */
  initializeKeyboardNavigation(container) {
    if (!this.config.enableNavigation) return;
    this.focusableElements = this._getFocusableElements(container);
    this._attachKeyboardListeners(container);
  }

  /**
   * Gérer la navigation clavier
   * @param {KeyboardEvent} e
   */
  handleKeyboardNavigation(e) {
    if (!this.config.enableNavigation) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.navigateDown();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.navigateUp();
        break;
      case 'Enter':
        e.preventDefault();
        this.activateSelectedNode();
        break;
      case 'Escape':
        e.preventDefault();
        this.clearSelection();
        break;
    }
  }

  /**
   * Gérer les raccourcis clavier
   * @param {KeyboardEvent} e
   */
  handleKeyboardShortcuts(e) {
    if (!this.config.enableShortcuts) return;

    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'n':
          e.preventDefault();
          this.addChatFromShortcut();
          break;
        case 'N':
          e.preventDefault();
          this.addFolderFromShortcut();
          break;
        case 'f':
          e.preventDefault();
          this.focusSearchInput();
          break;
        case 'e':
          e.preventDefault();
          this.editSelectedNode();
          break;
      }
    } else if (e.key === 'Delete') {
      e.preventDefault();
      this.deleteSelectedNode();
    }
  }

  /**
   * Sélectionner un nœud
   * @param {string} nodeId
   */
  selectNode(nodeId) {
    this.selectedNodeId = nodeId;
    this._updateFocus();
  }

  /**
   * Effacer la sélection
   */
  clearSelection() {
    this.selectedNodeId = null;
    this._updateFocus();
  }

  /**
   * Naviguer vers le bas
   */
  navigateDown() {
    const currentElement = this._getSelectedElement();
    const nextElement = this._getNextVisibleElement(currentElement);
    if (nextElement) {
      this._selectElement(nextElement);
    }
  }

  /**
   * Naviguer vers le haut
   */
  navigateUp() {
    const currentElement = this._getSelectedElement();
    const prevElement = this._getPreviousVisibleElement(currentElement);
    if (prevElement) {
      this._selectElement(prevElement);
    }
  }

  /**
   * Activer le nœud sélectionné
   */
  activateSelectedNode() {
    const currentElement = this._getSelectedElement();
    if (currentElement) {
      currentElement.click();
    }
  }

  /**
   * Obtenir l'élément sélectionné
   * @returns {HTMLElement|null}
   */
  _getSelectedElement() {
    if (!this.selectedNodeId) return null;
    return document.querySelector(`[data-id="${this.selectedNodeId}"]`);
  }

  /**
   * Sélectionner un élément
   * @param {HTMLElement} element
   */
  _selectElement(element) {
    const nodeId = element.dataset.id;
    if (nodeId) {
      this.selectNode(nodeId);
    }
  }

  /**
   * Mettre à jour le focus visuel
   */
  _updateFocus() {
    document.querySelectorAll('.keyboard-selected').forEach(el => {
      el.classList.remove('keyboard-selected');
    });

    const selectedElement = this._getSelectedElement();
    if (selectedElement) {
      selectedElement.classList.add('keyboard-selected');
      selectedElement.focus();
    }
  }

  /**
   * Obtenir les éléments focusables
   * @param {HTMLElement} container
   * @returns {Array}
   */
  _getFocusableElements(container) {
    const selector = 'button, input, [tabindex]:not([tabindex="-1"]), .tree-node-line';
    return Array.from(container.querySelectorAll(selector));
  }

  /**
   * Attacher les écouteurs d'événements clavier
   * @param {HTMLElement} container
   */
  _attachKeyboardListeners(container) {
    container.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    container.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
  }

  // Méthodes utilitaires pour la navigation
  _getNextVisibleElement(currentElement) {
    if (!currentElement) return this.focusableElements[0];
    const currentIndex = this.focusableElements.indexOf(currentElement);
    return this.focusableElements[currentIndex + 1] || null;
  }

  _getPreviousVisibleElement(currentElement) {
    if (!currentElement) return this.focusableElements[this.focusableElements.length - 1];
    const currentIndex = this.focusableElements.indexOf(currentElement);
    return this.focusableElements[currentIndex - 1] || null;
  }

  // Méthodes pour les raccourcis
  addChatFromShortcut() {
    debugLog('Raccourci Ctrl+N : Ajouter un chat');
  }

  addFolderFromShortcut() {
    debugLog('Raccourci Ctrl+Shift+N : Ajouter un dossier');
  }

  focusSearchInput() {
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
      searchInput.focus();
    }
  }

  editSelectedNode() {
    debugLog('Raccourci Ctrl+E : Éditer le nœud sélectionné');
  }

  /**
   * Supprimer le nœud sélectionné
   */
  deleteSelectedNode() {
    if (this.selectedNodeId) {
      // Émettre un événement pour supprimer le nœud
      const event = new CustomEvent('node:delete', { detail: { nodeId: this.selectedNodeId } });
      document.dispatchEvent(event);
    }
  }

  /**
   * Initialiser le gestionnaire de clavier
   */
  initialize() {
    const container = document.getElementById('tree-container');
    if (container) {
      this.initializeKeyboardNavigation(container);
    }
  }
}

// Exposer globalement pour le navigateur
if (typeof window !== 'undefined') {
  window.KeyboardManager = KeyboardManager;
}

// Exportation pour les tests Jest
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KeyboardManager;
} 