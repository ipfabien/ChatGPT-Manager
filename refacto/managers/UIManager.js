// UIManager.js
// Gestion de l'interface utilisateur (DOM, affichage, formulaires, notifications)

class UIManager {
  constructor(eventBus = null, mode = 'full') {
    this.currentEditNode = null;
    this.currentAddParentId = "root";
    this.isSearchMode = false;
    this.searchResults = [];
    this.eventBus = eventBus;
    this.currentDraggedId = null; // Stocker l'ID de l'élément en cours de drag
    this.currentSearchPage = 1;
    this.RESULTS_PER_PAGE = 8;
    this.currentSearchQuery = '';
    this.mode = mode; // 'full' ou 'popup'
    this.showDebugButton();
  }

  /**
   * Rendre l'arborescence complète
   * @param {Object} tree - L'arbre de données
   * @param {HTMLElement} container - Container pour l'affichage
   */
  renderTree(tree, container) {
    if (!container) return;
    container.innerHTML = '';
    
    const rootUl = document.createElement('ul');
    const rootLi = this._renderNode(tree, 0);
    rootUl.appendChild(rootLi);
    container.appendChild(rootUl);
  }

  /**
   * Rendre un nœud récursivement
   * @param {Object} node - Le nœud à afficher
   * @param {number} level - Niveau de profondeur
   * @returns {HTMLElement} - L'élément li créé
   */
  _renderNode(node, level = 0) {
    const li = document.createElement('li');
    const nodeElement = document.createElement('div');
    nodeElement.className = 'tree-node-line';
    nodeElement.dataset.id = node.id;
    nodeElement.style.marginLeft = `${level * 16}px`;
    nodeElement.setAttribute('tabindex', '0');
    
    // Ajouter la classe 'folder' pour les dossiers
    if (node.type === 'folder') {
      nodeElement.classList.add('folder');
      nodeElement.setAttribute('role', 'treeitem');
      nodeElement.setAttribute('aria-expanded', (node.expanded !== false).toString());
    } else {
      nodeElement.setAttribute('role', 'treeitem');
    }
    
    // Test visuel - ajouter une bordure de base pour vérifier que les styles s'appliquent
    nodeElement.style.border = '1px solid transparent';
    
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = node.expanded !== false;
    
    let html = '';
    
    if (node.type === 'folder') {
      const toggleIcon = hasChildren ? 
        (isExpanded ? 'expand_more' : 'chevron_right') : 
        'chevron_right';
      
      // Ne pas afficher le bouton de suppression pour le dossier root
      const deleteButton = node.id === 'root' ? '' : 
        `<span class="material-icons" data-action="deleteNode" data-id="${node.id}" title="Supprimer" aria-label="Supprimer le dossier '${node.name}'">delete</span>`;
      
      html += `
        <span class="material-icons toggle-icon" data-action="toggle" data-id="${node.id}" style="${hasChildren ? '' : 'opacity: 0.3;'}" aria-label="${isExpanded ? 'Réduire' : 'Développer'} le dossier '${node.name}'" aria-hidden="true">${toggleIcon}</span>
        <span class="material-icons" aria-hidden="true">${node.id === 'root' ? 'home' : 'folder'}</span>
        <span class="folder-name">${node.name}</span>
        <span class="folder-counter" aria-label="${this._countChatsInFolder(node)} chats dans ce dossier">${this._countChatsInFolder(node)}</span>
        <div class="edit-btns">
          <span class="material-icons" data-action="addChat" data-id="${node.id}" title="Ajouter un chat" aria-label="Ajouter un nouveau chat dans le dossier '${node.name}'">chat_bubble_outline</span>
          <span class="material-icons" data-action="addFolder" data-id="${node.id}" title="Ajouter un dossier" aria-label="Ajouter un nouveau dossier dans '${node.name}'">folder_open</span>
          <span class="material-icons" data-action="editNode" data-id="${node.id}" title="Modifier" aria-label="Modifier le nom du dossier '${node.name}'">edit</span>
          ${deleteButton}
        </div>
      `;
    } else {
      html += `
        <span class="material-icons" aria-hidden="true">chat</span>
        <a href="${node.link}" class="chat-link" target="_blank" aria-label="Ouvrir le chat '${node.name}'">${node.name}</a>
        ${node.tag ? `<span class="chat-tag" aria-label="Tag: ${node.tag}">${node.tag}</span>` : ''}
        <div class="edit-btns">
          <span class="material-icons" data-action="editNode" data-id="${node.id}" title="Modifier" aria-label="Modifier le chat '${node.name}'">edit</span>
          <span class="material-icons" data-action="deleteNode" data-id="${node.id}" title="Supprimer" aria-label="Supprimer le chat '${node.name}'">delete</span>
        </div>
      `;
    }
    
    nodeElement.innerHTML = html;
    
    // Ajouter les event listeners pour les boutons d'action
    this._attachActionListeners(nodeElement);
    
    // Ajouter event listener pour le focus avec Tab
    nodeElement.addEventListener('focus', () => {
      // Émettre un événement pour la sélection
      this.eventBus.emit('node:select', node.id);
    });
    
    // Ajouter le drag and drop
    this._attachDragListeners(nodeElement, node);
    
    li.appendChild(nodeElement);
    
    // Créer la liste des enfants si c'est un dossier
    if (node.type === 'folder' && hasChildren && isExpanded) {
      const ul = document.createElement('ul');
      ul.setAttribute('role', 'group');
      // Trier les enfants avant de les afficher
      const sortedChildren = this._sortChildren(node.children);
      sortedChildren.forEach(child => {
        const childLi = this._renderNode(child, level + 1);
        ul.appendChild(childLi);
      });
      li.appendChild(ul);
    }
    
    return li;
  }

  /**
   * Attacher les listeners d'action aux boutons
   * @param {HTMLElement} nodeElement
   */
  _attachActionListeners(nodeElement) {
    const actionButtons = nodeElement.querySelectorAll('[data-action]');
    actionButtons.forEach(button => {
      const action = button.dataset.action;
      const id = button.dataset.id;
      
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        
        switch(action) {
          case 'toggle':
            this.eventBus.emit('node:toggle', id);
            break;
          case 'addChat':
            this.eventBus.emit('node:add', 'chat', id);
            break;
          case 'addFolder':
            this.eventBus.emit('node:add', 'folder', id);
            break;
          case 'editNode':
            this.eventBus.emit('node:edit', id);
            break;
          case 'deleteNode':
            this.eventBus.emit('node:delete', id);
            break;
        }
      });
    });
  }

  /**
   * Trier les enfants d'un dossier
   * @param {Array} children
   * @returns {Array}
   */
  _sortChildren(children) {
    if (!children || children.length === 0) return children;
    const folders = children.filter(child => child.type === 'folder');
    const chats = children.filter(child => child.type === 'chat');
    folders.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
    chats.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
    return [...folders, ...chats];
  }

  /**
   * Compter les chats dans un dossier
   * @param {Object} folder
   * @returns {number}
   */
  _countChatsInFolder(folder) {
    let count = 0;
    if (!folder.children) return count;
    
    for (const child of folder.children) {
      if (child.type === "chat") {
        count++;
      } else if (child.type === "folder") {
        count += this._countChatsInFolder(child);
      }
    }
    return count;
  }

  /**
   * Afficher un formulaire d'ajout de dossier
   * @param {string} parentId
   */
  showAddFolderForm(parentId) {
    this.currentAddParentId = parentId;
    this._showForm('folder');
  }

  /**
   * Afficher un formulaire d'ajout de chat
   * @param {string} parentId
   */
  showAddChatForm(parentId) {
    this.currentAddParentId = parentId;
    this._showForm('chat');
  }

  /**
   * Afficher un formulaire d'édition
   * @param {Object} node
   */
  showEditForm(node, item = null) {
    this.currentEditNode = node;
    // Si on est en mode recherche et qu'on a l'item DOM, insérer le formulaire juste après
    if (this.isSearchMode && item) {
      this._showForm('edit', node, item);
    } else {
      this._showForm('edit', node);
    }
  }

  /**
   * Afficher un formulaire
   * @param {string} type - 'folder', 'chat', ou 'edit'
   * @param {Object} node - Nœud à éditer (pour type 'edit')
   */
  _showForm(type, node = null, afterElement = null) {
    // Masquer tous les formulaires existants
    this.hideAllForms();
    // Créer le formulaire inline
    const formContainer = document.createElement('div');
    formContainer.className = 'inline-form';
    formContainer.setAttribute('role', 'form');
    let formHTML = '';
    let ariaLabel = '';
    let formId = '';
    if (type === 'folder') {
      ariaLabel = node ? `Modifier le dossier '${node.name}'` : 'Créer un nouveau dossier';
      formId = 'folder-form';
      formHTML = `
        <form id="folder-form">
          <input id="folder-name" type="text" placeholder="Nom du dossier" value="${node ? node.name : ''}" required aria-label="Nom du dossier" />
          <button type="submit" aria-label="Valider"><span class="material-icons" aria-hidden="true">check</span></button>
          <button type="button" class="close-btn" aria-label="Annuler"><span class="material-icons" aria-hidden="true">close</span></button>
        </form>
      `;
    } else if (type === 'chat') {
      ariaLabel = node ? `Modifier le chat '${node.name}'` : 'Créer un nouveau chat';
      formId = 'chat-form';
      formHTML = `
        <form id="chat-form">
          <input id="chat-name" type="text" placeholder="Nom du chat" value="${node ? node.name : ''}" required aria-label="Nom du chat" />
          <input id="chat-link" type="url" placeholder="Lien vers le chat" value="${node ? node.link : ''}" required aria-label="Lien vers le chat" />
          <input id="chat-tag" type="text" placeholder="Tag (optionnel)" value="${node && node.tag ? node.tag : ''}" aria-label="Tag optionnel" />
          <button type="submit" aria-label="Valider"><span class="material-icons" aria-hidden="true">check</span></button>
          <button type="button" class="close-btn" aria-label="Annuler"><span class="material-icons" aria-hidden="true">close</span></button>
        </form>
      `;
    } else if (type === 'edit') {
      ariaLabel = `Modifier ${node.type === 'folder' ? 'le dossier' : 'le chat'} '${node.name}'`;
      formId = 'edit-form';
      if (node.type === 'folder') {
        formHTML = `
          <form id="edit-form">
            <input id="edit-name" type="text" placeholder="Nom du dossier" value="${node && node.type === 'folder' ? node.name : ''}" required aria-label="Nom du dossier" />
            <button type="submit" aria-label="Valider"><span class="material-icons" aria-hidden="true">check</span></button>
            <button type="button" class="close-btn" aria-label="Annuler"><span class="material-icons" aria-hidden="true">close</span></button>
          </form>
        `;
      } else {
        formHTML = `
          <form id="edit-form">
            <input id="edit-name" type="text" placeholder="Nom du chat" value="${node.name}" required aria-label="Nom du chat" />
            <input id="edit-link" type="url" placeholder="Lien du chat" value="${node.link || ''}" required aria-label="Lien du chat" />
            <input id="edit-tag" type="text" placeholder="Tag" value="${node.tag || ''}" aria-label="Tag" />
            <button type="submit" aria-label="Valider"><span class="material-icons" aria-hidden="true">check</span></button>
            <button type="button" class="close-btn" aria-label="Annuler"><span class="material-icons" aria-hidden="true">close</span></button>
          </form>
        `;
      }
    }
    formContainer.setAttribute('aria-label', ariaLabel);
    if (formId) formContainer.id = formId;
    formContainer.innerHTML = formHTML;
    formContainer.style.display = 'block';
    // Insérer le formulaire juste après l'élément concerné si afterElement est fourni
    if (afterElement) {
      afterElement.insertAdjacentElement('afterend', formContainer);
    } else if (type === 'edit') {
      document.body.appendChild(formContainer);
    } else {
      const parentElement = document.querySelector(`[data-id="${this.currentAddParentId}"]`);
      if (parentElement) {
        const parentLi = parentElement.closest('li');
        const parentUl = parentLi ? parentLi.querySelector('ul') : null;
        if (parentUl) {
          parentUl.insertBefore(formContainer, parentUl.firstChild);
        } else if (parentLi) {
          parentLi.appendChild(formContainer);
        } else {
          document.body.appendChild(formContainer);
        }
      } else {
        document.body.appendChild(formContainer);
      }
    }
    // Ajouter l'event listener pour le bouton de fermeture
    const closeBtn = formContainer.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.currentEditNode = null;
        this.hideAllForms();
        if (this.eventBus) {
          this.eventBus.emit('tree:refresh');
        }
      });
    }
    // Focus sur le premier champ
    const firstInput = formContainer.querySelector('input');
    if (firstInput) {
      firstInput.focus();
      if (!node) firstInput.select();
    }
  }

  /**
   * Masquer tous les formulaires
   */
  hideAllForms() {
    // Masquer les formulaires inline au lieu de les supprimer
    const inlineForms = document.querySelectorAll('.inline-form');
    inlineForms.forEach(form => {
      form.style.display = 'none';
    });
    // Masquer les anciens formulaires
    const forms = document.querySelectorAll('.form-inline-box, #folder-form, #chat-form, #edit-form');
    forms.forEach(form => {
      form.style.display = 'none';
    });
  }

  /**
   * Afficher une notification
   * @param {string} message
   * @param {string} type - 'success', 'error', 'info'
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-suppression après 3 secondes
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  /**
   * Afficher la zone de debug
   * @param {boolean} show
   */
  showDebugArea(show = true) {
    const debugArea = document.getElementById('debug-area');
    if (debugArea) {
      debugArea.style.display = show ? 'block' : 'none';
    }
  }

  /**
   * Ajouter un log dans la zone de debug
   * @param {string} message
   */
  addLog(message) {
    const debugContent = document.getElementById('debug-content');
    if (debugContent) {
      const logEntry = document.createElement('div');
      logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
      debugContent.appendChild(logEntry);
      debugContent.scrollTop = debugContent.scrollHeight;
    }
  }

  /**
   * Afficher les résultats de recherche avec pagination (mutualisé popup/étendue)
   * @param {Array} results
   * @param {string} query
   * @param {number} page
   */
  async showSearchResults(results, query, page = 1) {
    this.isSearchMode = true;
    this.currentSearchQuery = query;
    this.currentSearchPage = page;
    // Mettre à jour la propriété searchResults avec les résultats complets
    this.searchResults = results;
    
    // Choix du conteneur selon le mode
    let container = null;
    if (this.mode === 'popup') {
      container = document.getElementById('popup-search-results');
      if (container) container.style.display = '';
    } else {
      container = document.getElementById('tree-container');
    }
    if (!container) return;
    container.innerHTML = '';
    const RESULTS_PER_PAGE = this.RESULTS_PER_PAGE || 8;
    
    // Trier les résultats par ordre alphabétique
    const sortedResults = [...results].sort((a, b) => 
      a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
    );
    
    const totalResults = sortedResults.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / RESULTS_PER_PAGE));
    const startIdx = (page - 1) * RESULTS_PER_PAGE;
    const pagedResults = sortedResults.slice(startIdx, startIdx + RESULTS_PER_PAGE);

    // Header
    const headerHtml = await window.loadAndRenderTemplate('templates/common/search-header.html', {
      query,
      count: totalResults
    });
    
    // Barre de recherche
    const barHtml = await window.loadAndRenderTemplate('templates/common/search-bar.html', {
      query
    });
    
    // Résultats - utiliser le template officiel
    let resultsHtml = '';
    if (pagedResults.length > 0) {
      resultsHtml = pagedResults.map(result => {
        // Vérification de la disponibilité du template
        if (window.Templates && typeof window.Templates.renderSearchResultItem === 'function') {
          return window.Templates.renderSearchResultItem(result, { modePopup: this.mode === 'popup' });
        } else {
          console.error('Templates.renderSearchResultItem non disponible');
          return '';
        }
      }).join('');
    } else {
      resultsHtml = '<div class="no-results">Aucun résultat trouvé pour "' + query + '"</div>';
    }
    
    const resultsListHtml = await window.loadAndRenderTemplate('templates/common/search-results.html', {
      results: resultsHtml
    });
    
    // Pagination
    const paginationHtml = await window.loadAndRenderTemplate('templates/common/search-pagination.html', {
      currentPage: page,
      totalPages,
      prevDisabled: page <= 1 ? 'disabled' : '',
      nextDisabled: page >= totalPages ? 'disabled' : ''
    });
    
    // Bloc principal
    const blockHtml = await window.loadAndRenderTemplate(
      this.mode === 'popup' ? 'templates/popup/search-block.html' : 'templates/full/search-block.html',
      {}
    );
    container.innerHTML = blockHtml;
    
    // Correction pour les tests : injecter directement si les sous-divs n'existent pas
    let headerDiv = document.getElementById('search-header');
    let resultsDiv = document.getElementById('search-results');
    let paginationDiv = document.getElementById('search-pagination');
    
    if (!headerDiv || !resultsDiv || !paginationDiv) {
      container.innerHTML = headerHtml + resultsListHtml + paginationHtml;
    } else {
      headerDiv.innerHTML = headerHtml;
      resultsDiv.innerHTML = resultsListHtml;
      paginationDiv.innerHTML = paginationHtml;
    }
    
    if (this.mode === 'popup') {
      // Mesurer la hauteur totale des actions visibles avant de les masquer
      const quickActions = document.querySelector('.quick-actions');
      const actionsBar = document.querySelector('.actions-bar');
      let actionsHeight = 0;
      if (quickActions && quickActions.style.display !== 'none') {
        actionsHeight += quickActions.getBoundingClientRect().height;
      }
      if (actionsBar && actionsBar.style.display !== 'none') {
        actionsHeight += actionsBar.getBoundingClientRect().height;
      }
      const popupContentArea = document.querySelector('.popup-content-area');
      if (popupContentArea && !popupContentArea.dataset.fixedHeight) {
        popupContentArea.style.height = actionsHeight + 'px';
        popupContentArea.dataset.fixedHeight = '1';
      }
      // Ensuite masquer les autres blocs sous la barre de recherche
      if (quickActions) quickActions.style.display = 'none';
      if (actionsBar) actionsBar.style.display = 'none';
      container.style.display = 'block';
      container.style.height = 'auto';
      container.style.overflow = 'visible';
    } else {
      container = document.getElementById('tree-container');
    }
    
    // Listeners pagination
    const prevBtn = document.querySelector('.pagination-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentSearchPage > 1) {
          this.showSearchResults(results, query, this.currentSearchPage - 1);
        }
      });
    }
    const nextBtn = document.querySelector('.pagination-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentSearchPage < totalPages) {
          this.showSearchResults(results, query, this.currentSearchPage + 1);
        }
      });
    }
    
    // Listener clear search
    const clearBtn = document.querySelector('.clear-search-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.eventBus.emit('search:clear');
      });
    }
    
    // Listeners sur les boutons d'action des résultats
    document.querySelectorAll('[data-action="editNode"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        const result = pagedResults.find(r => r.id == id);
        this.eventBus.emit('search:edit', result, btn.closest('.search-result-item'));
      });
    });
    document.querySelectorAll('[data-action="deleteNode"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        const result = pagedResults.find(r => r.id == id);
        this.eventBus.emit('search:delete', result);
      });
    });
    
    // Focus/blur sur les items
    document.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('focus', () => { item.classList.add('search-result-item-hover'); });
      item.addEventListener('blur', () => { item.classList.remove('search-result-item-hover'); });
    });
  }

  /**
   * Attacher les listeners de drag and drop
   * @param {HTMLElement} nodeElement
   * @param {Object} node
   */
  _attachDragListeners(nodeElement, node) {
    // Ne pas permettre le drag du dossier root, mais permettre le drop dessus
    if (node.id === 'root') {
      // Ajouter seulement les listeners de drop pour le dossier racine
      this._attachDropListeners(nodeElement, node);
      return;
    }
    
    // Marquer comme draggable
    nodeElement.setAttribute('draggable', 'true');
    nodeElement.classList.add('draggable');
    
    // Drag start
    nodeElement.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', node.id);
      this.currentDraggedId = node.id; // Stocker l'ID
      nodeElement.classList.add('dragging');
      if (node.type === 'folder') {
        nodeElement.classList.add('dragging-folder');
      } else {
        nodeElement.classList.add('dragging-chat');
      }
      debugLog('=== DRAG START ===');
      debugLog('currentDraggedId:', this.currentDraggedId);
    });
    
    // Drag end
    nodeElement.addEventListener('dragend', (e) => {
      nodeElement.classList.remove('dragging', 'dragging-folder', 'dragging-chat');
      this.currentDraggedId = null; // Réinitialiser l'ID
      // Supprimer tous les indicateurs de drop
      this._removeAllDropIndicators();
      debugLog('=== DRAG END ===');
      debugLog('currentDraggedId réinitialisé');
    });
    
    // Ajouter les listeners de drop pour tous les dossiers
    if (node.type === 'folder') {
      this._attachDropListeners(nodeElement, node);
    }
  }

  /**
   * Attacher les listeners de drop pour un dossier
   * @param {HTMLElement} nodeElement
   * @param {Object} node
   */
  _attachDropListeners(nodeElement, node) {
    // Drag over
    nodeElement.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      debugLog('=== DRAG OVER ===');
      debugLog('this.currentDraggedId:', this.currentDraggedId);
      debugLog('node.id:', node.id);
      debugLog('nodeElement:', nodeElement);
      
      if (this.currentDraggedId && this.currentDraggedId !== node.id) {
        if (!nodeElement.classList.contains('drag-over')) {
          debugLog('Ajout des classes drag-over');
          nodeElement.classList.add('drag-over');
          // Ajouter la classe selon le type d'élément en cours de drag
          const draggedElement = document.querySelector(`[data-id="${this.currentDraggedId}"]`);
          if (draggedElement && draggedElement.classList.contains('folder')) {
            nodeElement.classList.add('drag-over-folder');
            debugLog('Classe drag-over-folder ajoutée');
          } else {
            nodeElement.classList.add('drag-over-chat');
            debugLog('Classe drag-over-chat ajoutée');
          }
          debugLog('Classes actuelles:', nodeElement.className);
        }
      }
    });
    
    // Drag leave
    nodeElement.addEventListener('dragleave', (e) => {
      debugLog('=== DRAG LEAVE ===');
      debugLog('relatedTarget:', e.relatedTarget);
      debugLog('nodeElement:', nodeElement);
      
      if (!nodeElement.contains(e.relatedTarget)) {
        debugLog('Suppression des classes drag-over');
        nodeElement.classList.remove('drag-over', 'drag-over-folder', 'drag-over-chat');
      }
    });
    
    // Drop
    nodeElement.addEventListener('drop', (e) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData('text/plain');
      
      if (draggedId && draggedId !== node.id) {
        // Vérifier si le dossier est fermé et l'ouvrir si nécessaire
        if (node.type === 'folder' && node.expanded === false) {
          debugLog('Dossier fermé détecté, ouverture automatique');
          this.eventBus.emit('node:toggle', node.id);
        }
        
        // Émettre l'événement de déplacement
        this.eventBus.emit('node:move', draggedId, node.id);
      }
      
      nodeElement.classList.remove('drag-over', 'drag-over-folder', 'drag-over-chat');
    });
  }

  /**
   * Ajouter un indicateur de ligne de drop
   * @param {HTMLElement} dropZone
   */
  _addDropLineIndicator(dropZone) {
    this._removeDropLineIndicator(dropZone);
    
    const indicator = document.createElement('div');
    indicator.className = 'drop-line-indicator';
    dropZone.appendChild(indicator);
    
    // Animer l'apparition
    requestAnimationFrame(() => {
      indicator.classList.add('show');
    });
  }

  /**
   * Supprimer un indicateur de ligne de drop
   * @param {HTMLElement} dropZone
   */
  _removeDropLineIndicator(dropZone) {
    const existingIndicator = dropZone.querySelector('.drop-line-indicator');
    if (existingIndicator) {
      existingIndicator.classList.remove('show');
      setTimeout(() => {
        if (existingIndicator.parentNode) {
          existingIndicator.parentNode.removeChild(existingIndicator);
        }
      }, 300);
    }
  }

  /**
   * Supprimer tous les indicateurs de drop
   */
  _removeAllDropIndicators() {
    const indicators = document.querySelectorAll('.drop-line-indicator');
    indicators.forEach(indicator => {
      indicator.classList.remove('show');
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 300);
    });
  }

  /**
   * Effacer les résultats de recherche
   */
  clearSearchResults() {
    // Réinitialiser l'état de recherche
    this.isSearchMode = false;
    this.searchResults = [];
    this.currentSearchQuery = '';
    this.currentSearchPage = 1;
    
    const container = this.mode === 'popup'
      ? document.getElementById('popup-search-results')
      : document.getElementById('tree-container');
    if (container) {
      container.innerHTML = '';
      if (this.mode === 'popup') {
        container.style.display = 'none';
        // Réafficher les autres blocs
        const quickActions = document.querySelector('.quick-actions');
        if (quickActions) quickActions.style.display = '';
        const actionsBar = document.querySelector('.actions-bar');
        if (actionsBar) actionsBar.style.display = '';
        // Relâcher la hauteur de .popup-content-area
        const popupContentArea = document.querySelector('.popup-content-area');
        if (popupContentArea) {
          popupContentArea.style.height = '';
          delete popupContentArea.dataset.fixedHeight;
        }
      }
    }
    
    // Effacer le champ de recherche
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.value = '';
    }
  }

  showDebugButton() {
    const logsBtn = document.getElementById('logsBtn');
    if (logsBtn) {
      logsBtn.style.display = (window.CONFIG && window.CONFIG.DEBUG) ? 'inline-block' : 'none';
    }
  }
}

// Exposer globalement pour le navigateur
if (typeof window !== 'undefined') {
  window.UIManager = UIManager;
}

// Exportation pour les tests Jest
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIManager;
} 