// TreeManager.js
// Gestion de l'arborescence des dossiers et chats (CRUD, tri, drag & drop)

class TreeManager {
  constructor(root = null) {
    // Structure de l'arbre (racine)
    this.root = root || {
      id: 'root',
      name: 'Accueil',
      type: 'folder',
      children: [],
      expanded: true,
    };
  }

  /**
   * Trouver un noeud par son id
   * @param {Object} node
   * @param {string} id
   * @returns {Object|null}
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
   * Ajouter un noeud (chat ou dossier) à un parent
   * @param {string} parentId
   * @param {Object} newNode
   * @returns {boolean}
   */
  addNode(parentId, newNode) {
    const parent = this.findById(this.root, parentId);
    if (!parent) return false;
    if (!parent.children) {
      parent.children = [];
    }
    parent.children.push(newNode);
    return true;
  }

  /**
   * Modifier un noeud
   * @param {string} nodeId
   * @param {Object} data
   * @returns {boolean}
   */
  editNode(nodeId, data) {
    const node = this.findById(this.root, nodeId);
    if (!node) return false;
    Object.assign(node, data);
    return true;
  }

  /**
   * Supprimer un noeud par son id (récursif)
   * @param {string} nodeId
   * @returns {boolean}
   */
  deleteNode(nodeId) {
    if (this.root.id === nodeId) return false; // Ne pas supprimer la racine
    return this._deleteNodeById(this.root, nodeId);
  }

  _deleteNodeById(parentNode, idToDelete) {
    if (!parentNode.children) return false;
    const index = parentNode.children.findIndex(c => c.id === idToDelete);
    if (index !== -1) {
      parentNode.children.splice(index, 1);
      return true;
    }
    for (const child of parentNode.children) {
      if (child.type === 'folder') {
        const deleted = this._deleteNodeById(child, idToDelete);
        if (deleted) return true;
      }
    }
    return false;
  }

  /**
   * Déplacer un noeud (drag & drop)
   * @param {string} sourceId
   * @param {string} targetId
   * @returns {boolean}
   */
  moveNode(sourceId, targetId) {
    if (sourceId === 'root' || sourceId === targetId) return false;
    const sourceNode = this.findById(this.root, sourceId);
    const targetNode = this.findById(this.root, targetId);
    if (!sourceNode || !targetNode || !targetNode.children) return false;
    // Vérifier qu'on ne déplace pas dans un descendant de soi-même
    if (this._isDescendant(sourceNode, targetId)) return false;
    // Supprimer de l'ancien parent
    this.deleteNode(sourceId);
    // Ajouter au nouveau parent
    targetNode.children.push(sourceNode);
    return true;
  }

  _isDescendant(node, potentialDescendantId) {
    if (!node.children) return false;
    for (const child of node.children) {
      if (child.id === potentialDescendantId) return true;
      if (child.type === 'folder' && this._isDescendant(child, potentialDescendantId)) return true;
    }
    return false;
  }

  /**
   * Trier les enfants d'un dossier (dossiers puis chats, ordre alpha)
   * @param {Array} children
   * @returns {Array}
   */
  sortChildren(children) {
    if (!children || children.length === 0) return children;
    const folders = children.filter(child => child.type === 'folder');
    const chats = children.filter(child => child.type === 'chat');
    folders.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
    chats.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
    return [...folders, ...chats];
  }

  /**
   * Compter le nombre de chats dans un dossier (récursif)
   * @param {Object} folder
   * @returns {number}
   */
  countChatsInFolder(folder) {
    let count = 0;
    if (!folder.children) return count;
    for (const child of folder.children) {
      if (child.type === 'chat') {
        count++;
      } else if (child.type === 'folder') {
        count += this.countChatsInFolder(child);
      }
    }
    return count;
  }

  /**
   * Créer et ajouter un nœud avec type et données
   * @param {string} type - 'folder' ou 'chat'
   * @param {string} parentId
   * @param {Object} data
   * @returns {Object|null}
   */
  createNode(type, parentId, data) {
    const parent = this.findById(this.root, parentId);
    
    if (!parent) {
      return null;
    }

    const newNode = {
      id: this.generateId(),
      type: type,
      name: data.name,
      ...data
    };

    if (type === 'folder') {
      newNode.children = [];
      newNode.expanded = false;
    }

    if (!parent.children) {
      parent.children = [];
    }

    parent.children.push(newNode);
    return newNode;
  }

  /**
   * Mettre à jour un nœud
   * @param {string} nodeId
   * @param {Object} data
   * @returns {boolean}
   */
  updateNode(nodeId, data) {
    return this.editNode(nodeId, data);
  }

  /**
   * Basculer l'état d'expansion d'un dossier
   * @param {string} nodeId
   * @returns {boolean}
   */
  toggleNode(nodeId) {
    const node = this.findById(this.root, nodeId);
    if (!node || node.type !== 'folder') return false;
    node.expanded = !node.expanded;
    return true;
  }

  /**
   * Développer tous les dossiers
   */
  expandAll() {
    this._expandNode(this.root);
  }

  _expandNode(node) {
    if (node.type === 'folder') {
      node.expanded = true;
      if (node.children) {
        node.children.forEach(child => this._expandNode(child));
      }
    }
  }

  /**
   * Réduire tous les dossiers
   */
  collapseAll() {
    this._collapseNode(this.root);
  }

  _collapseNode(node) {
    if (node.type === 'folder') {
      node.expanded = false;
      if (node.children) {
        node.children.forEach(child => this._collapseNode(child));
      }
    }
  }

  /**
   * Obtenir les données de l'arbre
   * @returns {Object}
   */
  getData() {
    return this.root;
  }

  /**
   * Générer un ID unique
   * @returns {string}
   */
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

if (typeof window !== 'undefined') {
  window.TreeManager = TreeManager;
}

// Exportation pour les tests Jest
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TreeManager;
} 