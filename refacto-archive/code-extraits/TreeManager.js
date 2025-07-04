/**
 * TreeManager - Gestion de l'arborescence
 * Migré depuis l'ancien full.js
 */
import { eventBus, EVENTS, storageManager } from '../common/utils/index.js';

export class TreeManager {
  constructor() {
    this.data = null;
    this.treeContainer = null;
    this.isInitialized = false;
    this.isExtension = typeof chrome !== 'undefined' && chrome.storage;
  }

  /**
   * Initialiser le gestionnaire d'arborescence
   */
  async init() {
    if (this.isInitialized) {
      console.warn('TreeManager déjà initialisé');
      return;
    }

    try {
      // Récupérer le container de l'arborescence
      this.treeContainer = document.getElementById('tree-container');
      
      if (!this.treeContainer) {
        throw new Error('Container de l\'arborescence non trouvé');
      }

      this.isInitialized = true;
      console.log('✅ TreeManager initialisé');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de TreeManager:', error);
      throw error;
    }
  }

  /**
   * Charger les données depuis le storage
   */
  async loadData() {
    try {
      if (this.isExtension) {
        // Mode extension Chrome
        return new Promise((resolve) => {
          chrome.storage.local.get(["chatManagerData"], (result) => {
            if (!result.chatManagerData) {
              this.data = this.createDefaultData();
              this.saveData();
            } else {
              this.data = result.chatManagerData;
              if (typeof this.data.expanded === "undefined") {
                this.data.expanded = true;
              }
            }
            resolve(this.data);
          });
        });
      } else {
        // Mode navigateur web - Forcer les données de test pour la démonstration
        console.log('🌐 Mode navigateur détecté - Chargement des données de test...');
        this.data = this.createDefaultData();
        await this.saveData();
        return this.data;
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
      throw error;
    }
  }

  /**
   * Créer des données par défaut avec des exemples
   * @returns {Object} - Données par défaut
   */
  createDefaultData() {
    return {
      id: "root",
      name: "Accueil",
      type: "folder",
      children: [
        {
          id: this.generateId(),
          name: "Projets",
          type: "folder",
          children: [
            {
              id: this.generateId(),
              name: "ChatGPT Manager",
              type: "chat",
              parentId: "projets",
              createdAt: new Date().toISOString()
            },
            {
              id: this.generateId(),
              name: "Documentation",
              type: "chat",
              parentId: "projets",
              createdAt: new Date().toISOString()
            }
          ],
          expanded: true,
          parentId: "root",
          createdAt: new Date().toISOString()
        },
        {
          id: this.generateId(),
          name: "Personnel",
          type: "folder",
          children: [
            {
              id: this.generateId(),
              name: "Idées",
              type: "chat",
              parentId: "personnel",
              createdAt: new Date().toISOString()
            }
          ],
          expanded: false,
          parentId: "root",
          createdAt: new Date().toISOString()
        }
      ],
      expanded: true,
    };
  }

  /**
   * Sauvegarder les données dans le storage
   */
  async saveData() {
    try {
      if (this.isExtension) {
        // Mode extension Chrome
        return new Promise((resolve) => {
          chrome.storage.local.set({ chatManagerData: this.data }, () => {
            resolve();
          });
        });
      } else {
        // Mode navigateur web
        await storageManager.set('chatManagerData', this.data);
      }
      
      // Émettre l'événement de sauvegarde
      eventBus.emit(EVENTS.DATA_SAVED, this.data);
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      throw error;
    }
  }

  /**
   * Rendre l'arborescence
   */
  render() {
    if (!this.treeContainer || !this.data) {
      console.warn('Impossible de rendre l\'arborescence: container ou données manquants');
      return;
    }

    try {
      console.log('🌳 Rendu de l\'arborescence...');
      
      // Vider le container
      this.treeContainer.innerHTML = '';
      
      // Rendre le nœud racine
      this.renderNode(this.data, 0);
      
      // Émettre l'événement de rendu
      eventBus.emit(EVENTS.TREE_RENDERED);
      
      console.log('✅ Arborescence rendue');
      
    } catch (error) {
      console.error('❌ Erreur lors du rendu de l\'arborescence:', error);
    }
  }

  /**
   * Rendre un nœud de l'arborescence (version Material Icons, structure imbriquée)
   * @param {Object} node - Nœud à rendre
   * @param {number} level - Niveau de profondeur
   * @param {HTMLElement} parentUl - UL parent (optionnel)
   */
  renderNode(node, level = 0, parentUl = null) {
    if (!node) return;

    const isFolder = node.type === 'folder';
    const isExpanded = node.expanded !== false;
    const hasChildren = node.children && node.children.length > 0;

    // Créer le <li>
    const li = document.createElement('li');

    // Créer le <div class="tree-node-line ...">
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'tree-node-line';
    if (isFolder) nodeDiv.classList.add('folder');
    if (node.selected) nodeDiv.classList.add('keyboard-selected');
    nodeDiv.setAttribute('data-id', node.id);
    nodeDiv.setAttribute('tabindex', '0');
    nodeDiv.setAttribute('role', 'treeitem');
    if (isFolder) nodeDiv.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    nodeDiv.style.marginLeft = `${level * 16}px`;
    nodeDiv.style.border = '1px solid transparent';
    if (isFolder) nodeDiv.setAttribute('draggable', 'true');

    // Formulaire d'édition inline
    if (node.isEditing) {
      nodeDiv.innerHTML = `
        <form class="inline-form" data-form-type="edit" data-id="${node.id}">
          <input type="text" name="name" value="${node.name}" required autofocus />
          <button type="submit" title="Valider"><span class="material-icons">check</span></button>
          <button type="button" class="cancel-btn" title="Annuler"><span class="material-icons">close</span></button>
        </form>
      `;
      li.appendChild(nodeDiv);
      if (parentUl) parentUl.appendChild(li); else this.appendToMainUl(li);
      // Si dossier ouvert et enfants, on affiche aussi les enfants
      if (isFolder && isExpanded && hasChildren) {
        const ul = document.createElement('ul');
        ul.setAttribute('role', 'group');
        node.children.forEach(child => this.renderNode(child, level + 1, ul));
        li.appendChild(ul);
      }
      return;
    }

    // Icônes et nom
    let iconHtml = '';
    if (isFolder) {
      iconHtml += `<span class="material-icons toggle-icon" data-action="toggle" data-id="${node.id}" aria-label="${isExpanded ? 'Réduire' : 'Développer'} le dossier '${node.name}'" aria-hidden="true">${isExpanded ? 'expand_more' : 'chevron_right'}</span>`;
      iconHtml += `<span class="material-icons" aria-hidden="true">${level === 0 ? 'home' : 'folder'}</span>`;
    } else {
      iconHtml += `<span class="material-icons" aria-hidden="true">chat</span>`;
    }
    let nameHtml = isFolder
      ? `<span class="folder-name">${node.name}</span>`
      : `<a href="#" class="chat-link">${node.name}</a>`;
    // Compteur pour les dossiers
    let counterHtml = '';
    if (isFolder) {
      const chatCount = node.children ? node.children.filter(c => c.type === 'chat').length : 0;
      counterHtml = `<span class="folder-counter" aria-label="${chatCount} chats dans ce dossier">${chatCount}</span>`;
    }
    // Tags pour les chats (exemple)
    let tagHtml = '';
    if (node.type === 'chat' && node.tag) {
      tagHtml = `<span class="chat-tag" aria-label="Tag: ${node.tag}">${node.tag}</span>`;
    }
    // Actions d'édition (Material Icons)
    let editBtnsHtml = '';
    if (isFolder) {
      editBtnsHtml = `
        <span class="material-icons" data-action="addChat" data-id="${node.id}" title="Ajouter un chat" aria-label="Ajouter un nouveau chat dans le dossier '${node.name}'">chat_bubble_outline</span>
        <span class="material-icons" data-action="addFolder" data-id="${node.id}" title="Ajouter un dossier" aria-label="Ajouter un nouveau dossier dans '${node.name}'">folder_open</span>
        <span class="material-icons" data-action="editNode" data-id="${node.id}" title="Modifier" aria-label="Modifier le nom du dossier '${node.name}'">edit</span>
        ${level > 0 ? `<span class="material-icons" data-action="deleteNode" data-id="${node.id}" title="Supprimer" aria-label="Supprimer le dossier '${node.name}'">delete</span>` : ''}
      `;
    } else {
      editBtnsHtml = `
        <span class="material-icons" data-action="editNode" data-id="${node.id}" title="Modifier" aria-label="Modifier le chat '${node.name}'">edit</span>
        <span class="material-icons" data-action="deleteNode" data-id="${node.id}" title="Supprimer" aria-label="Supprimer le chat '${node.name}'">delete</span>
      `;
    }
    // Construction du contenu
    nodeDiv.innerHTML = `
      ${iconHtml}
      ${nameHtml}
      ${counterHtml}
      ${tagHtml}
      <div class="edit-btns">${editBtnsHtml}</div>
    `;

    li.appendChild(nodeDiv);

    // Formulaire de création de chat
    if (node.isCreatingChat) {
      const formLi = document.createElement('li');
      formLi.innerHTML = `
        <form class="inline-form" data-form-type="create-chat" data-id="${node.id}">
          <input type="text" name="name" placeholder="Nom du chat" required autofocus />
          <input type="text" name="link" placeholder="Lien du chat" required style="min-width:120px;" />
          <input type="text" name="tag" placeholder="Tag (optionnel)" style="min-width:100px;" />
          <button type="submit" title="Valider"><span class="material-icons">check</span></button>
          <button type="button" class="cancel-btn" title="Annuler"><span class="material-icons">close</span></button>
        </form>
      `;
      if (!li.querySelector('ul')) {
        const ul = document.createElement('ul');
        ul.setAttribute('role', 'group');
        li.appendChild(ul);
      }
      li.querySelector('ul').appendChild(formLi);
    }
    // Formulaire de création de dossier
    if (node.isCreatingFolder) {
      const formLi = document.createElement('li');
      formLi.innerHTML = `
        <form class="inline-form" data-form-type="create-folder" data-id="${node.id}">
          <input type="text" name="name" placeholder="Nom du dossier" required autofocus />
          <button type="submit" title="Valider"><span class="material-icons">check</span></button>
          <button type="button" class="cancel-btn" title="Annuler"><span class="material-icons">close</span></button>
        </form>
      `;
      if (!li.querySelector('ul')) {
        const ul = document.createElement('ul');
        ul.setAttribute('role', 'group');
        li.appendChild(ul);
      }
      li.querySelector('ul').appendChild(formLi);
    }

    // Rendu des enfants
    if (isFolder && isExpanded && hasChildren) {
      const ul = document.createElement('ul');
      ul.setAttribute('role', 'group');
      node.children.forEach(child => this.renderNode(child, level + 1, ul));
      li.appendChild(ul);
    }
    if (parentUl) parentUl.appendChild(li); else this.appendToMainUl(li);
  }

  /**
   * Basculer l'état d'un dossier (ouvert/fermé)
   * @param {string} folderId - ID du dossier
   */
  toggleFolder(folderId) {
    console.log('📂 toggleFolder appelé pour', folderId);
    const folder = this.findById(this.data, folderId);
    if (folder && folder.type === 'folder') {
      folder.expanded = !folder.expanded;
      this.saveData();
      this.render();
      
      // Émettre l'événement
      const eventType = folder.expanded ? EVENTS.TREE_NODE_EXPANDED : EVENTS.TREE_NODE_COLLAPSED;
      eventBus.emit(eventType, folderId);
    }
  }

  /**
   * Trouver un nœud par son ID
   * @param {Object} node - Nœud de départ
   * @param {string} id - ID à rechercher
   * @returns {Object|null} - Nœud trouvé ou null
   */
  findById(node, id) {
    if (node.id === id) return node;
    if (node.children && node.children.length) {
      for (const child of node.children) {
        const found = this.findById(child, id);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Générer un ID unique
   * @returns {string} - ID unique
   */
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Ajouter un chat
   * @param {string} parentId - ID du parent
   */
  addChat(parentId) {
    console.log('➕ addChat appelé pour', parentId);
    const parent = this.findById(this.data, parentId);
    if (!parent) return;

    const chat = {
      id: this.generateId(),
      name: "Nouveau chat",
      type: "chat",
      parentId: parentId,
      createdAt: new Date().toISOString()
    };

    if (!parent.children) parent.children = [];
    parent.children.push(chat);

    this.saveData();
    this.render();
    
    // Émettre l'événement
    eventBus.emit(EVENTS.TREE_NODE_ADDED, chat);
  }

  /**
   * Ajouter un dossier
   * @param {string} parentId - ID du parent
   */
  addFolder(parentId) {
    console.log('📁 addFolder appelé pour', parentId);
    const parent = this.findById(this.data, parentId);
    if (!parent) return;

    const folder = {
      id: this.generateId(),
      name: "Nouveau dossier",
      type: "folder",
      children: [],
      expanded: true,
      parentId: parentId,
      createdAt: new Date().toISOString()
    };

    if (!parent.children) parent.children = [];
    parent.children.push(folder);

    this.saveData();
    this.render();
    
    // Émettre l'événement
    eventBus.emit(EVENTS.TREE_NODE_ADDED, folder);
  }

  /**
   * Supprimer un nœud
   * @param {string} nodeId - ID du nœud à supprimer
   */
  deleteNode(nodeId) {
    console.log('🗑️ deleteNode appelé pour', nodeId);
    if (nodeId === 'root') {
      alert('Impossible de supprimer le dossier racine');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      this.deleteNodeById(this.data, nodeId);
      this.saveData();
      this.render();
      
      // Émettre l'événement
      eventBus.emit(EVENTS.TREE_NODE_DELETED, nodeId);
    }
  }

  /**
   * Supprimer un nœud par son ID (récursif)
   * @param {Object} parentNode - Nœud parent
   * @param {string} idToDelete - ID à supprimer
   */
  deleteNodeById(parentNode, idToDelete) {
    if (parentNode.children) {
      const index = parentNode.children.findIndex(child => child.id === idToDelete);
      if (index !== -1) {
        parentNode.children.splice(index, 1);
        return;
      }
      
      for (const child of parentNode.children) {
        this.deleteNodeById(child, idToDelete);
      }
    }
  }

  /**
   * Déplacer un nœud
   * @param {string} sourceId - ID du nœud source
   * @param {string} targetId - ID du nœud cible
   */
  async moveNode(sourceId, targetId) {
    try {
      const sourceNode = this.findById(this.data, sourceId);
      const targetNode = this.findById(this.data, targetId);
      
      if (!sourceNode || !targetNode) {
        throw new Error('Nœud source ou cible non trouvé');
      }

      if (targetNode.type !== 'folder') {
        throw new Error('Impossible de déplacer vers un chat');
      }

      // Vérifier qu'on ne déplace pas un parent dans son enfant
      if (this.isDescendant(sourceNode, targetId)) {
        throw new Error('Impossible de déplacer un dossier dans son propre sous-dossier');
      }

      // Supprimer le nœud de son emplacement actuel
      this.deleteNodeById(this.data, sourceId);
      
      // Ajouter le nœud à sa nouvelle destination
      if (!targetNode.children) targetNode.children = [];
      targetNode.children.push(sourceNode);
      sourceNode.parentId = targetId;

      await this.saveData();
      this.render();
      
      // Émettre l'événement
      eventBus.emit(EVENTS.TREE_NODE_MOVED, sourceId, targetId);
      
    } catch (error) {
      console.error('❌ Erreur lors du déplacement:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un nœud est descendant d'un autre
   * @param {Object} node - Nœud à vérifier
   * @param {string} potentialDescendantId - ID du descendant potentiel
   * @returns {boolean} - True si c'est un descendant
   */
  isDescendant(node, potentialDescendantId) {
    if (node.id === potentialDescendantId) return true;
    if (node.children) {
      for (const child of node.children) {
        if (this.isDescendant(child, potentialDescendantId)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Sélectionner un nœud
   * @param {string} nodeId - ID du nœud à sélectionner
   */
  selectNode(nodeId) {
    // Supprimer la sélection précédente
    const previousSelected = this.treeContainer.querySelector('.tree-node-line.selected');
    if (previousSelected) {
      previousSelected.classList.remove('selected');
    }

    // Sélectionner le nouveau nœud
    const nodeElement = this.treeContainer.querySelector(`[data-id="${nodeId}"]`);
    if (nodeElement) {
      nodeElement.classList.add('selected');
    }

    // Émettre l'événement
    eventBus.emit(EVENTS.TREE_NODE_SELECTED, nodeId);
  }

  /**
   * Réinitialiser les données
   */
  async resetData() {
    this.data = {
      id: "root",
      name: "Accueil",
      type: "folder",
      children: [],
      expanded: true,
    };
    await this.saveData();
    this.render();
  }

  /**
   * Obtenir l'état du gestionnaire
   * @returns {Object} - État actuel
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      hasData: !!this.data,
      nodeCount: this.data ? this.countNodes(this.data) : 0,
      folderCount: this.data ? this.countFolders(this.data) : 0,
      chatCount: this.data ? this.countChats(this.data) : 0
    };
  }

  /**
   * Compter tous les nœuds
   * @param {Object} node - Nœud de départ
   * @returns {number} - Nombre de nœuds
   */
  countNodes(node) {
    let count = 1; // Le nœud lui-même
    if (node.children) {
      for (const child of node.children) {
        count += this.countNodes(child);
      }
    }
    return count;
  }

  /**
   * Compter les dossiers
   * @param {Object} node - Nœud de départ
   * @returns {number} - Nombre de dossiers
   */
  countFolders(node) {
    let count = node.type === 'folder' ? 1 : 0;
    if (node.children) {
      for (const child of node.children) {
        count += this.countFolders(child);
      }
    }
    return count;
  }

  /**
   * Compter les chats
   * @param {Object} node - Nœud de départ
   * @returns {number} - Nombre de chats
   */
  countChats(node) {
    let count = node.type === 'chat' ? 1 : 0;
    if (node.children) {
      for (const child of node.children) {
        count += this.countChats(child);
      }
    }
    return count;
  }

  /**
   * Nettoyer les ressources
   */
  destroy() {
    if (!this.isInitialized) return;

    try {
      this.treeContainer = null;
      this.data = null;
      this.isInitialized = false;
      console.log('✅ TreeManager détruit');
      
    } catch (error) {
      console.error('❌ Erreur lors de la destruction de TreeManager:', error);
    }
  }

  /**
   * Renommer un nœud
   * @param {string} nodeId - ID du nœud à éditer
   */
  editNode(nodeId) {
    console.log('✏️ editNode appelé pour', nodeId);
    const node = this.findById(this.data, nodeId);
    if (!node) return;
    const newName = prompt('Nouveau nom pour ce nœud :', node.name);
    if (newName && newName.trim() !== '') {
      node.name = newName.trim();
      this.saveData();
      this.render();
      eventBus.emit(EVENTS.TREE_NODE_EDITED, nodeId);
    }
  }

  /**
   * Déclencher le formulaire de création de chat
   */
  startCreateChat(parentId) {
    const parent = this.findById(this.data, parentId);
    if (!parent) return;
    // On ne permet qu'un seul formulaire de création à la fois
    this.clearInlineForms(this.data);
    parent.isCreatingChat = true;
    this.render();
  }

  /**
   * Déclencher le formulaire de création de dossier
   */
  startCreateFolder(parentId) {
    const parent = this.findById(this.data, parentId);
    if (!parent) return;
    this.clearInlineForms(this.data);
    parent.isCreatingFolder = true;
    this.render();
  }

  /**
   * Déclencher le formulaire d'édition
   */
  startEditNode(nodeId) {
    const node = this.findById(this.data, nodeId);
    if (!node) return;
    this.clearInlineForms(this.data);
    node.isEditing = true;
    this.render();
  }

  /**
   * Nettoyer tous les états de formulaire inline
   */
  clearInlineForms(node) {
    if (!node) return;
    delete node.isCreatingChat;
    delete node.isCreatingFolder;
    delete node.isEditing;
    if (node.children) {
      node.children.forEach(child => this.clearInlineForms(child));
    }
  }

  /**
   * Ajout d'un chat après validation du formulaire
   */
  createChat(parentId, name, link = '', tag = '') {
    const parent = this.findById(this.data, parentId);
    if (!parent) return;
    const chat = {
      id: this.generateId(),
      name: name,
      link: link,
      tag: tag,
      type: "chat",
      parentId: parentId,
      createdAt: new Date().toISOString()
    };
    if (!parent.children) parent.children = [];
    parent.children.push(chat);
    this.clearInlineForms(this.data);
    this.saveData();
    this.render();
    eventBus.emit(EVENTS.TREE_NODE_ADDED, chat);
  }

  /**
   * Ajout d'un dossier après validation du formulaire
   */
  createFolder(parentId, name) {
    const parent = this.findById(this.data, parentId);
    if (!parent) return;
    const folder = {
      id: this.generateId(),
      name: name,
      type: "folder",
      children: [],
      expanded: true,
      parentId: parentId,
      createdAt: new Date().toISOString()
    };
    if (!parent.children) parent.children = [];
    parent.children.push(folder);
    this.clearInlineForms(this.data);
    this.saveData();
    this.render();
    eventBus.emit(EVENTS.TREE_NODE_ADDED, folder);
  }

  /**
   * Validation de l'édition
   */
  updateNodeName(nodeId, name) {
    const node = this.findById(this.data, nodeId);
    if (!node) return;
    node.name = name;
    this.clearInlineForms(this.data);
    this.saveData();
    this.render();
    eventBus.emit(EVENTS.TREE_NODE_EDITED, nodeId);
  }

  /**
   * Ajout utilitaire pour appendToMainUl
   */
  appendToMainUl(li) {
    let mainUl = this.treeContainer.querySelector('ul');
    if (!mainUl) {
      mainUl = document.createElement('ul');
      mainUl.setAttribute('role', 'tree');
      this.treeContainer.appendChild(mainUl);
    }
    mainUl.appendChild(li);
  }
} 