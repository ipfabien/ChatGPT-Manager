const debugLog = (typeof window !== 'undefined') ? window.debugLog : require('./utils/helpers.js').debugLog;

const eventBus = new window.EventBus();
const uiManager = new window.UIManager(eventBus, 'popup');

// Import de la config globale
let CONFIG;
try {
  CONFIG = require('./config');
} catch (e) {
  CONFIG = window.CONFIG;
}

document.addEventListener("DOMContentLoaded", () => {
  const treeContainer = document.getElementById("tree-container");

  // Écouteurs d'événements pour les nouvelles fonctionnalités (mode statique)
  const toggleThemeBtn = document.getElementById("toggle-theme");
  if (toggleThemeBtn) {
    toggleThemeBtn.addEventListener("click", function() {
      const body = document.body;
      if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        toggleThemeBtn.querySelector('.material-icons').textContent = 'dark_mode';
      } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        toggleThemeBtn.querySelector('.material-icons').textContent = 'light_mode';
      }
    });
  }

  const fullscreenBtn = document.getElementById("fullscreen-btn");
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", function() {
      // Fonctionnalité à implémenter plus tard
      alert('Fonctionnalité plein écran à implémenter dans une prochaine version');
    });
  }

  // Barre de recherche (mode statique)
  const searchInput = document.querySelector('.search-bar input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const query = this.value.trim();
      
      // Annuler le timeout précédent
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      // Si la requête est vide, effacer la recherche
      if (query === '') {
        const resultsBlock = document.getElementById('popup-search-results');
        if (resultsBlock) {
          resultsBlock.style.display = 'none';
          resultsBlock.innerHTML = '';
        }
        const quickActions = document.querySelector('.quick-actions');
        if (quickActions) quickActions.style.display = '';
        const actionsBar = document.querySelector('.actions-bar');
        if (actionsBar) actionsBar.style.display = '';
        return;
      }
      
      // Déclencher la recherche avec debounce
      searchTimeout = setTimeout(() => {
        const results = searchEngine.search(query);
        uiManager.showSearchResults(results, query, 1);
      }, SEARCH_CONFIG.debounceDelay);
    });
  }

  // Boutons tout ouvrir/fermer (mode statique)
  const expandAllBtn = document.querySelector('.search-bar button[title="Tout ouvrir"]');
  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', function() {
      expandAllFolders();
    });
  }

  const collapseAllBtn = document.querySelector('.search-bar button[title="Tout fermer"]');
  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', function() {
      collapseAllFolders();
    });
  }

  // Event listeners pour les boutons de debug
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ?')) {
        chrome.storage.local.remove(['chatManagerData'], () => {
          location.reload();
        });
      }
    });
  }

  const logsBtn = document.getElementById('logsBtn');
  if (logsBtn) {
    logsBtn.addEventListener('click', () => {
      const logsContainer = document.getElementById('logs-container');
      if (logsContainer.style.display === 'none' || logsContainer.style.display === '') {
        logsContainer.style.display = 'block';
        addLog('Zone de logs ouverte');
      } else {
        logsContainer.style.display = 'none';
      }
    });
  }

  // Test des effets visuels
  function testVisualEffects() {
    const firstElement = document.querySelector('.tree-node-line');
    if (firstElement) {
      debugLog('Test des effets visuels sur:', firstElement.dataset.id);
      debugLog('Classes avant:', firstElement.className);
      
      // Tester l'effet dragging
      firstElement.classList.add('dragging');
      debugLog('Classes après dragging:', firstElement.className);
      
      setTimeout(() => {
        firstElement.classList.remove('dragging');
        firstElement.classList.add('drag-over');
        debugLog('Classes après drag-over:', firstElement.className);
        
        setTimeout(() => {
          firstElement.classList.remove('drag-over');
          debugLog('Test terminé');
        }, 2000);
      }, 2000);
    }
  }

  // Variables globales
  let data = null;
  let currentEditNode = null;
  let currentAddParentId = "root";

  // Variables pour le drag and drop
  let draggedElement = null;
  let draggedNode = null;
  let dropTarget = null;
  let currentDraggedId = null; // Variable pour stocker l'ID de l'élément dragué

  // Variables pour la recherche
  let searchIndex = null;
  let searchTimeout = null;
  let isSearchMode = false;
  let currentSearchQuery = '';
  let currentSearchPage = 1;
  const RESULTS_PER_PAGE = 10;

  // Variables pour la navigation clavier
  let selectedNodeId = null;
  let keyboardNavigationEnabled = true;
  let focusableElements = [];

  // Configuration de la recherche
  const SEARCH_CONFIG = {
    minLength: 2,
    debounceDelay: 400,
    useIndex: true,
    rebuildIndexOnChange: true
  };

  // Configuration de la navigation clavier
  const KEYBOARD_CONFIG = {
    enableNavigation: true,
    enableShortcuts: true
  };

  // Initialisation des classes globales
  const UserPreferences = window.UserPreferences;
  const userPreferences = new UserPreferences();

  const SearchEngine = window.SearchEngine;
  const searchEngine = new SearchEngine();

  function saveData() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ chatManagerData: data });
      // Reconstruire l'index de recherche si nécessaire
      if (SEARCH_CONFIG.rebuildIndexOnChange) {
        rebuildSearchIndex();
      }
    } else {
      // Fallback localStorage
      localStorage.setItem('chatManagerData', JSON.stringify(data));
      if (SEARCH_CONFIG.rebuildIndexOnChange) {
        rebuildSearchIndex();
      }
    }
  }

  function loadData() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(["chatManagerData"], (result) => {
          if (!result.chatManagerData) {
            data = {
              id: "root",
              name: "Accueil",
              type: "folder",
              children: [],
              expanded: true,
            };
            saveData();
          } else {
            data = result.chatManagerData;
            if (typeof data.expanded === "undefined") data.expanded = true;
          }
          // Initialiser le moteur de recherche avec les données
          searchEngine.initialize(data);
          resolve();
        });
      } else {
        // Fallback localStorage
        const stored = localStorage.getItem('chatManagerData');
        if (!stored) {
          data = {
            id: "root",
            name: "Accueil",
            type: "folder",
            children: [],
            expanded: true,
          };
          saveData();
        } else {
          data = JSON.parse(stored);
          if (typeof data.expanded === "undefined") data.expanded = true;
        }
        // Initialiser le moteur de recherche avec les données
        searchEngine.initialize(data);
        resolve();
      }
    });
  }

  function findById(node, id) {
    if (node.id === id) return node;
    if (node.children && node.children.length) {
      for (const child of node.children) {
        const found = findById(child, id);
        if (found) return found;
      }
    }
    return null;
  }

  function generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Fonction pour trier les enfants d'un dossier
  function sortChildren(children) {
    if (!children || children.length === 0) return children;
    
    // Séparer les dossiers et les chats
    const folders = children.filter(child => child.type === 'folder');
    const chats = children.filter(child => child.type === 'chat');
    
    // Trier les dossiers par ordre alphabétique
    folders.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
    
    // Trier les chats par ordre alphabétique
    chats.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
    
    // Retourner d'abord les dossiers, puis les chats
    return [...folders, ...chats];
  }

  function countChatsInFolder(folder) {
    let count = 0;
    if (!folder.children) return count;
    
    for (const child of folder.children) {
      if (child.type === "chat") {
        count++;
      } else if (child.type === "folder") {
        count += countChatsInFolder(child);
      }
    }
    return count;
  }

  function deleteNodeById(parentNode, idToDelete) {
    if (!parentNode.children) return false;
    const index = parentNode.children.findIndex(c => c.id === idToDelete);
    if (index !== -1) {
      parentNode.children.splice(index, 1);
      return true;
    }
    for (const child of parentNode.children) {
      if (child.type === "folder") {
        const deleted = deleteNodeById(child, idToDelete);
        if (deleted) return true;
      }
    }
    return false;
  }

  // Fonction pour déplacer tous les chats d'un dossier vers son parent
  function moveAllChatsToParent(folderNode, parentNode) {
    if (!folderNode.children) return;
    
    for (const child of folderNode.children) {
      if (child.type === "chat") {
        // Déplacer le chat vers le parent
        if (!parentNode.children) {
          parentNode.children = [];
        }
        parentNode.children.push(child);
      } else if (child.type === "folder") {
        // Récursivement déplacer les chats des sous-dossiers vers le parent
        moveAllChatsToParent(child, parentNode);
      }
    }
  }

  function findParentNode(node, targetId) {
    if (!node.children) return null;
    for (const child of node.children) {
      if (child.id === targetId) return node;
      const found = findParentNode(child, targetId);
      if (found) return found;
    }
    return null;
  }

  function moveNode(sourceNodeId, targetNodeId) {
    if (sourceNodeId === targetNodeId) {
      return false;
    }

    if (sourceNodeId === "root") {
      return false;
    }

    const sourceNode = findById(data, sourceNodeId);
    const targetNode = findById(data, targetNodeId);

    if (!sourceNode || !targetNode) {
      return false;
    }

    const sourceParent = findParentNode(data, sourceNodeId);
    if (targetNode.id !== "root" && sourceParent && sourceParent.id === targetNodeId) {
      return false;
    }

    function isDescendant(node, potentialDescendantId) {
      if (!node.children) return false;
      for (const child of node.children) {
        if (child.id === potentialDescendantId) return true;
        if (isDescendant(child, potentialDescendantId)) return true;
      }
      return false;
    }

    if (isDescendant(sourceNode, targetNodeId)) {
      return false;
    }

    if (!sourceParent) {
      return false;
    }

    const sourceIndex = sourceParent.children.findIndex(c => c.id === sourceNodeId);
    if (sourceIndex === -1) {
      return false;
    }

    const [movedNode] = sourceParent.children.splice(sourceIndex, 1);

    if (targetNode.type === "folder" || targetNode.id === "root") {
      if (!targetNode.children) {
        targetNode.children = [];
      }
      targetNode.children.push(movedNode);
    } else {
      const targetParent = findParentNode(data, targetNodeId);
      if (targetParent) {
        if (!targetParent.children) {
          targetParent.children = [];
        }
        targetParent.children.push(movedNode);
      } else {
        sourceParent.children.splice(sourceIndex, 0, movedNode);
        return false;
      }
    }

    return true;
  }

  function getTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  }

  function attachDragListeners() {
    const nodes = document.querySelectorAll('.tree-node-line');
    if (!nodes || nodes.length === 0) return;
    nodes.forEach(node => {
      if (node && node._dragStartHandler) {
        node.addEventListener('dragstart', node._dragStartHandler);
        // ... autres listeners ...
      }
    });
  }

  function renderTree() {
    const treeContainer = document.getElementById('tree-container');
    if (!treeContainer) return;
    treeContainer.innerHTML = '';
    
    function renderNode(node, level = 0) {
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
                <span class="folder-counter" aria-label="${countChatsInFolder(node)} chats dans ce dossier">${countChatsInFolder(node)}</span>
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
        const actionButtons = nodeElement.querySelectorAll('[data-action]');
        debugLog(`Attachement des boutons d'action pour ${node.id}:`, actionButtons.length, 'boutons trouvés');
        actionButtons.forEach(button => {
            const action = button.dataset.action;
            const id = button.dataset.id;
            debugLog(`Attachement du bouton ${action} pour l'ID ${id}`);
            
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                debugLog(`Clic sur le bouton ${action} pour l'ID ${id}`);
                
                switch(action) {
                    case 'toggle':
                        toggleFolder(id);
                        break;
                    case 'addChat':
                        addChat(id);
                        break;
                    case 'addFolder':
                        addFolder(id);
                        break;
                    case 'editNode':
                        editNode(id);
                        break;
                    case 'deleteNode':
                        deleteNode(id);
                        break;
                }
            });
        });
        
        // Ajouter event listener pour le focus avec Tab
        nodeElement.addEventListener('focus', () => {
            selectNode(node.id);
        });
        
        // Ajouter event listener pour la perte de focus
        nodeElement.addEventListener('blur', () => {
            // Ne pas effacer la sélection immédiatement pour éviter les clignotements
            // La sélection sera effacée quand un autre élément aura le focus
        });
        
        li.appendChild(nodeElement);
        
        // Créer la liste des enfants si c'est un dossier
        if (node.type === 'folder' && hasChildren && isExpanded) {
            const ul = document.createElement('ul');
            ul.setAttribute('role', 'group');
            // Trier les enfants avant de les afficher
            const sortedChildren = sortChildren(node.children);
            sortedChildren.forEach(child => {
                const childLi = renderNode(child, level + 1);
                ul.appendChild(childLi);
            });
            li.appendChild(ul);
        }
        
        return li;
    }
    
    const rootUl = document.createElement('ul');
    const rootLi = renderNode(data);
    rootUl.appendChild(rootLi);
    treeContainer.appendChild(rootUl);
  }

  function hideForms() {
    // Supprimer les formulaires inline
    const inlineForms = document.querySelectorAll('.inline-form');
    inlineForms.forEach(form => {
      form.remove();
    });
  }

  function openEditFolderForm(node) {
    hideForms();
    
    // Créer le formulaire inline
    const formContainer = document.createElement('div');
    formContainer.className = 'inline-form';
    formContainer.id = 'inline-folder-form';
    formContainer.setAttribute('role', 'form');
    formContainer.setAttribute('aria-label', node ? `Modifier le dossier '${node.name}'` : 'Créer un nouveau dossier');
    
    const formHtml = `
      <form>
        <input type="text" placeholder="Nom du dossier" value="${node ? node.name : ''}" required aria-label="Nom du dossier" />
        <button type="submit" aria-label="Valider"><span class="material-icons" aria-hidden="true">check</span></button>
        <button type="button" class="close-btn" aria-label="Annuler"><span class="material-icons" aria-hidden="true">close</span></button>
      </form>
    `;
    
    formContainer.innerHTML = formHtml;
    
    // Insérer le formulaire dans l'arbre
    const parentElement = document.querySelector(`[data-id="${currentAddParentId}"]`);
    if (parentElement) {
      const parentLi = parentElement.closest('li');
      const parentUl = parentLi.querySelector('ul');
      
      if (parentUl) {
        // Insérer après le premier enfant (après le dossier parent)
        parentUl.insertBefore(formContainer, parentUl.firstChild);
      } else {
        // Créer une nouvelle liste si elle n'existe pas
        const newUl = document.createElement('ul');
        newUl.appendChild(formContainer);
        parentLi.appendChild(newUl);
      }
    }
    
    // Ajouter l'event listener pour le bouton de fermeture
    const closeBtn = formContainer.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
      currentEditNode = null;
      hideForms();
      renderTree();
    });
    
    // Focus sur le champ de saisie
    const nameInput = formContainer.querySelector('input');
    nameInput.focus();
    if (!node) nameInput.select();

    // Gestionnaire de soumission
    formContainer.querySelector('form').onsubmit = (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      if (!name) return alert("Le nom du dossier est obligatoire.");

      if (currentEditNode) {
        currentEditNode.name = name;
      } else {
        const parent = findById(data, currentAddParentId);
        if (!parent || parent.type !== "folder") {
          alert("Dossier parent introuvable.");
          return;
        }
        // Ouvrir le dossier parent s'il est fermé
        if (parent.expanded === false) {
          parent.expanded = true;
          addLog(`Ouverture automatique du dossier: ${parent.name}`);
        }
        parent.children.push({
          id: generateId(),
          name,
          type: "folder",
          children: [],
          expanded: true,
        });
      }
      saveData();
      currentEditNode = null;
      hideForms();
      renderTree();
    };
  }

  function openEditChatForm(node) {
    hideForms();
    
    // Créer le formulaire inline
    const formContainer = document.createElement('div');
    formContainer.className = 'inline-form';
    formContainer.id = 'inline-chat-form';
    formContainer.setAttribute('role', 'form');
    formContainer.setAttribute('aria-label', node ? `Modifier le chat '${node.name}'` : 'Créer un nouveau chat');
    
    const formHtml = `
      <form>
        <input type="text" placeholder="Nom du chat" value="${node ? node.name : ''}" required aria-label="Nom du chat" />
        <input type="url" placeholder="Lien vers le chat" value="${node ? node.link : ''}" required aria-label="Lien vers le chat" />
        <input type="text" placeholder="Tag (optionnel)" value="${node && node.tag ? node.tag : ''}" aria-label="Tag optionnel" />
        <button type="submit" aria-label="Valider"><span class="material-icons" aria-hidden="true">check</span></button>
        <button type="button" class="close-btn" aria-label="Annuler"><span class="material-icons" aria-hidden="true">close</span></button>
      </form>
    `;
    
    formContainer.innerHTML = formHtml;
    
    // Insérer le formulaire dans l'arbre
    const parentElement = document.querySelector(`[data-id="${currentAddParentId}"]`);
    if (parentElement) {
      const parentLi = parentElement.closest('li');
      const parentUl = parentLi.querySelector('ul');
      
      if (parentUl) {
        // Insérer après le premier enfant (après le dossier parent)
        parentUl.insertBefore(formContainer, parentUl.firstChild);
      } else {
        // Créer une nouvelle liste si elle n'existe pas
        const newUl = document.createElement('ul');
        newUl.appendChild(formContainer);
        parentLi.appendChild(newUl);
      }
    }
    
    // Ajouter l'event listener pour le bouton de fermeture
    const closeBtn = formContainer.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
      currentEditNode = null;
      hideForms();
      renderTree();
    });
    
    // Focus sur le premier champ
    const nameInput = formContainer.querySelector('input[type="text"]');
    nameInput.focus();
    if (!node) nameInput.select();

    // Gestionnaire de soumission
    formContainer.querySelector('form').onsubmit = (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const link = formContainer.querySelector('input[type="url"]').value.trim();
      const tag = formContainer.querySelector('input[type="text"]:last-of-type').value.trim();
      if (!name || !link) return alert("Le nom et le lien du chat sont obligatoires.");

      if (currentEditNode) {
        currentEditNode.name = name;
        currentEditNode.link = link;
        currentEditNode.tag = tag || null; // Stocker null si le tag est vide
      } else {
        const parent = findById(data, currentAddParentId);
        if (!parent || parent.type !== "folder") {
          alert("Dossier parent introuvable.");
          return;
        }
        // Ouvrir le dossier parent s'il est fermé
        if (parent.expanded === false) {
          parent.expanded = true;
          addLog(`Ouverture automatique du dossier: ${parent.name}`);
        }
        parent.children.push({
          id: generateId(),
          name,
          link,
          tag: tag || null, // Stocker null si le tag est vide
          type: "chat",
        });
      }
      saveData();
      hideForms();
      renderTree();
    };
  }

  loadData().then(() => {
    renderTree();
    
    // Ajouter les event listeners de drag & drop au niveau du conteneur
    attachDragListeners();
    
    // Initialiser la navigation clavier
    initializeKeyboardNavigation();
    initializeKeyboardShortcuts();
    
    // Charger les préférences utilisateur
    loadUserPreferences();
    
    // Event listeners pour les boutons d'action
    const toggleThemeBtn = document.getElementById('toggle-theme');
    if (toggleThemeBtn) {
      toggleThemeBtn.addEventListener('click', () => {
        const newTheme = userPreferences.theme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
        saveUserPreferences();
        addLog(`Thème basculé vers: ${newTheme}`);
      });
    }
    
    const toggleFontSizeBtn = document.getElementById('toggle-font-size');
    if (toggleFontSizeBtn) {
      toggleFontSizeBtn.addEventListener('click', () => {
        const newSize = userPreferences.fontSize === 'normal' ? 'large' : 'normal';
        applyFontSize(newSize);
        saveUserPreferences();
        addLog(`Taille de police basculée vers: ${newSize}`);
      });
    }

    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        window.open('full.html', '_blank', 'width=800,height=600');
        addLog('Ouverture en mode plein écran');
      });
    }
    
    // Event listeners pour les boutons de debug
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ?')) {
          chrome.storage.local.clear(() => {
            location.reload();
          });
        }
      });
    }
    
    const logsBtn = document.getElementById('logsBtn');
    if (logsBtn) {
      logsBtn.addEventListener('click', () => {
        const logsContainer = document.getElementById('logs-container');
        logsContainer.style.display = logsContainer.style.display === 'none' ? 'block' : 'none';
      });
    }

    // Listener pour la fermeture des résultats de recherche (mutualisé)
    eventBus.on('search:clear', () => {
      const resultsBlock = document.getElementById('popup-search-results');
      if (resultsBlock) {
        resultsBlock.style.display = 'none';
        resultsBlock.innerHTML = '';
      }
      const quickActions = document.querySelector('.quick-actions');
      if (quickActions) quickActions.style.display = '';
      const actionsBar = document.querySelector('.actions-bar');
      if (actionsBar) actionsBar.style.display = '';
      
      // Vider la barre de recherche
      const searchInput = document.querySelector('#popup-search-input');
      if (searchInput) {
        searchInput.value = '';
      }
      
      debugLog('[popup] Résultats de recherche fermés via eventBus');
    });
  });

  function addLog(message) {
    const logsContent = document.getElementById('logs-content');
    if (logsContent) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.textContent = `[${timestamp}] ${message}`;
        logsContent.appendChild(logEntry);
        logsContent.scrollTop = logsContent.scrollHeight;
    }
  }

  function logMessage(message) {
    addLog(message);
  }

  // Fonctions pour les boutons d'action
  function addChat(parentId) {
    debugLog('Fonction addChat appelée avec parentId:', parentId);
    currentAddParentId = parentId;
    openEditChatForm();
  }

  function addFolder(parentId) {
    debugLog('Fonction addFolder appelée avec parentId:', parentId);
    currentAddParentId = parentId;
    openEditFolderForm();
  }

  function editNode(nodeId) {
    debugLog('Fonction editNode appelée avec nodeId:', nodeId);
    const node = findById(data, nodeId);
    if (!node) return;
    
    // Trouver le parent de l'élément à éditer
    const parent = findParentNode(data, nodeId);
    if (parent) {
      currentAddParentId = parent.id;
    }
    
    currentEditNode = node;
    if (node.type === 'folder') {
      openEditFolderForm(node);
    } else {
      openEditChatForm(node);
    }
  }

  function deleteNode(nodeId) {
    debugLog('Fonction deleteNode appelée avec nodeId:', nodeId);
    const node = findById(data, nodeId);
    if (!node) return;
    
    if (node.type === 'folder' && node.id === 'root') {
      alert('Le dossier racine ne peut pas être supprimé.');
      return;
    }
    
    const confirmMessage = node.type === 'folder' 
      ? `Êtes-vous sûr de vouloir supprimer le dossier "${node.name}" ? Les chats seront déplacés vers le dossier parent.`
      : `Êtes-vous sûr de vouloir supprimer le chat "${node.name}" ?`;
    
    if (confirm(confirmMessage)) {
      const parent = findParentNode(data, nodeId);
      if (parent) {
        if (node.type === 'folder') {
          // Déplacer tous les chats vers le parent avant de supprimer le dossier
          moveAllChatsToParent(node, parent);
        }
        deleteNodeById(parent, nodeId);
        saveData();
        renderTree();
        addLog(`Suppression: ${node.name}`);
      }
    }
  }

  function toggleFolder(folderId) {
    debugLog('Fonction toggleFolder appelée avec folderId:', folderId);
    const folder = findById(data, folderId);
    debugLog('Dossier trouvé:', folder);
    
    if (folder && folder.type === 'folder') {
      const wasExpanded = folder.expanded;
      folder.expanded = !folder.expanded;
      debugLog(`Dossier ${folder.name}: ${wasExpanded} -> ${folder.expanded}`);
      
      saveData();
      renderTree();
      addLog(`Toggle dossier: ${folder.name} - ${folder.expanded ? 'ouvert' : 'fermé'}`);
    } else {
      debugLog('Dossier non trouvé ou pas un dossier:', folder);
      addLog(`Erreur toggle: dossier ${folderId} non trouvé`);
    }
  }

  function addDropLineIndicator(dropZone) {
    // Supprimer l'ancien indicateur s'il existe
    removeDropLineIndicator(dropZone);
    
    // Créer un nouvel indicateur
    const indicator = document.createElement('div');
    indicator.className = 'drop-line-indicator';
    indicator.style.top = '0';
    
    // Ajouter l'indicateur au début de la zone de drop
    dropZone.insertBefore(indicator, dropZone.firstChild);
    
    // Animer l'apparition
    setTimeout(() => {
        indicator.classList.add('show');
    }, 10);
  }

  function removeDropLineIndicator(dropZone) {
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

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    debugLog('handleDragOver appelé sur:', e.target.closest('.tree-node-line')?.dataset.id);
  }

  // Fonction pour ouvrir tous les dossiers
  function expandAllFolders() {
    function expandNode(node) {
      if (node.type === 'folder') {
        node.expanded = true;
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => expandNode(child));
        }
      }
    }
    
    expandNode(data);
    saveData();
    renderTree();
    addLog('Tous les dossiers ont été ouverts');
  }

  // Fonction pour fermer tous les dossiers
  function collapseAllFolders() {
    function collapseNode(node) {
      if (node.type === 'folder') {
        node.expanded = false;
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => collapseNode(child));
        }
      }
    }
    
    collapseNode(data);
    saveData();
    renderTree();
    addLog('Tous les dossiers ont été fermés');
  }

  // Fonctions pour la navigation clavier
  function initializeKeyboardNavigation() {
    if (!KEYBOARD_CONFIG.enableNavigation) return;
    // Rendre le conteneur focusable
    const treeContainer = document.getElementById('tree-container');
    if (!treeContainer) return;
    treeContainer.setAttribute('tabindex', '0');
    treeContainer.addEventListener('keydown', handleKeyboardNavigation);
    // Initialiser la sélection sur le premier élément
    setTimeout(() => {
      selectFirstNode();
    }, 100);
    addLog('Navigation clavier initialisée');
  }

  function handleKeyboardNavigation(e) {
    if (!keyboardNavigationEnabled) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        navigateDown();
        break;
      case 'ArrowUp':
        e.preventDefault();
        navigateUp();
        break;
      case 'ArrowRight':
        e.preventDefault();
        expandOrNavigateRight();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        collapseOrNavigateLeft();
        break;
      case 'Enter':
        e.preventDefault();
        activateSelectedNode();
        break;
      case 'Escape':
        e.preventDefault();
        clearSelection();
        break;
    }
  }

  function selectFirstNode() {
    const firstNode = document.querySelector('.tree-node-line');
    if (firstNode) {
      firstNode.setAttribute('tabindex', '0');
      selectNode(firstNode.dataset.id);
    }
  }

  function selectNode(nodeId) {
    // Retirer la sélection précédente
    clearSelection();
    
    // Sélectionner le nouveau nœud
    const nodeElement = document.querySelector(`[data-id="${nodeId}"]`);
    if (nodeElement) {
      nodeElement.classList.add('keyboard-selected');
      selectedNodeId = nodeId;
      
      // Faire défiler vers l'élément si nécessaire
      nodeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      addLog(`Élément sélectionné: ${nodeId}`);
    }
  }

  function clearSelection() {
    const selectedElements = document.querySelectorAll('.keyboard-selected');
    selectedElements.forEach(el => el.classList.remove('keyboard-selected'));
    selectedNodeId = null;
  }

  function navigateDown() {
    if (!selectedNodeId) {
      selectFirstNode();
      return;
    }
    
    const currentElement = document.querySelector(`[data-id="${selectedNodeId}"]`);
    if (!currentElement) return;
    
    const nextElement = getNextVisibleElement(currentElement);
    if (nextElement) {
      selectNode(nextElement.dataset.id);
    }
  }

  function navigateUp() {
    if (!selectedNodeId) {
      selectFirstNode();
      return;
    }
    
    const currentElement = document.querySelector(`[data-id="${selectedNodeId}"]`);
    if (!currentElement) return;
    
    const prevElement = getPreviousVisibleElement(currentElement);
    if (prevElement) {
      selectNode(prevElement.dataset.id);
    }
  }

  function expandOrNavigateRight() {
    if (!selectedNodeId) return;
    
    const node = findById(data, selectedNodeId);
    if (!node) return;
    
    if (node.type === 'folder') {
      if (!node.expanded) {
        toggleFolder(selectedNodeId);
      } else {
        // Naviguer vers le premier enfant
        const firstChild = getFirstChild(node);
        if (firstChild) {
          selectNode(firstChild.id);
        }
      }
    }
  }

  function collapseOrNavigateLeft() {
    if (!selectedNodeId) return;
    
    const node = findById(data, selectedNodeId);
    if (!node) return;
    
    if (node.type === 'folder' && node.expanded) {
      toggleFolder(selectedNodeId);
    } else {
      // Naviguer vers le parent
      const parent = findParentNode(data, selectedNodeId);
      if (parent && parent.id !== 'root') {
        selectNode(parent.id);
      }
    }
  }

  function activateSelectedNode() {
    if (!selectedNodeId) return;
    
    const node = findById(data, selectedNodeId);
    if (!node) return;
    
    if (node.type === 'chat') {
      // Ouvrir le chat
      window.open(node.link, '_blank');
      addLog(`Chat ouvert: ${node.name}`);
    } else if (node.type === 'folder') {
      // Toggle le dossier
      toggleFolder(selectedNodeId);
    }
  }

  function getNextVisibleElement(currentElement) {
    const allElements = Array.from(document.querySelectorAll('.tree-node-line'));
    const currentIndex = allElements.indexOf(currentElement);
    
    for (let i = currentIndex + 1; i < allElements.length; i++) {
      const element = allElements[i];
      if (isElementVisible(element)) {
        return element;
      }
    }
    return null;
  }

  function getPreviousVisibleElement(currentElement) {
    const allElements = Array.from(document.querySelectorAll('.tree-node-line'));
    const currentIndex = allElements.indexOf(currentElement);
    
    for (let i = currentIndex - 1; i >= 0; i--) {
      const element = allElements[i];
      if (isElementVisible(element)) {
        return element;
      }
    }
    return null;
  }

  function isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    const container = document.getElementById('tree-container');
    const containerRect = container.getBoundingClientRect();
    
    return rect.top >= containerRect.top && rect.bottom <= containerRect.bottom;
  }

  function getFirstChild(folder) {
    if (!folder.children || folder.children.length === 0) return null;
    return folder.children[0];
  }

  // Raccourcis clavier globaux
  function initializeKeyboardShortcuts() {
    if (!KEYBOARD_CONFIG.enableShortcuts) return;
    
    document.addEventListener('keydown', handleKeyboardShortcuts);
    addLog('Raccourcis clavier initialisés');
  }

  function handleKeyboardShortcuts(e) {
    // Ne pas intercepter si on est dans un input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    
    // Ctrl+N : Nouveau chat
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      addChatFromShortcut();
    }
    
    // Ctrl+F : Focus sur la recherche
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      focusSearchInput();
    }
    
    // Ctrl+Shift+N : Nouveau dossier
    if (e.ctrlKey && e.shiftKey && e.key === 'N') {
      e.preventDefault();
      addFolderFromShortcut();
    }
    
    // Ctrl+E : Modifier l'élément sélectionné
    if (e.ctrlKey && e.key === 'e') {
      e.preventDefault();
      editSelectedNode();
    }
    
    // Delete : Supprimer l'élément sélectionné
    if (e.key === 'Delete') {
      e.preventDefault();
      deleteSelectedNode();
    }
  }

  function addChatFromShortcut() {
    if (selectedNodeId) {
      const node = findById(data, selectedNodeId);
      if (node && node.type === 'folder') {
        addChat(selectedNodeId);
        addLog('Nouveau chat ajouté via raccourci Ctrl+N');
      } else {
        // Ajouter dans le dossier parent
        const parent = findParentNode(data, selectedNodeId);
        if (parent) {
          addChat(parent.id);
          addLog('Nouveau chat ajouté via raccourci Ctrl+N');
        }
      }
    } else {
      // Ajouter dans le dossier racine
      addChat('root');
      addLog('Nouveau chat ajouté via raccourci Ctrl+N');
    }
  }

  function addFolderFromShortcut() {
    if (selectedNodeId) {
      const node = findById(data, selectedNodeId);
      if (node && node.type === 'folder') {
        addFolder(selectedNodeId);
        addLog('Nouveau dossier ajouté via raccourci Ctrl+Shift+N');
      } else {
        // Ajouter dans le dossier parent
        const parent = findParentNode(data, selectedNodeId);
        if (parent) {
          addFolder(parent.id);
          addLog('Nouveau dossier ajouté via raccourci Ctrl+Shift+N');
        }
      }
    } else {
      // Ajouter dans le dossier racine
      addFolder('root');
      addLog('Nouveau dossier ajouté via raccourci Ctrl+Shift+N');
    }
  }

  function focusSearchInput() {
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
      addLog('Focus sur la barre de recherche via Ctrl+F');
    }
  }

  function editSelectedNode() {
    if (selectedNodeId) {
      editNode(selectedNodeId);
      addLog('Édition via raccourci Ctrl+E');
    }
  }

  function deleteSelectedNode() {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
      addLog('Suppression via raccourci Delete');
    }
  }

  // Charger les préférences utilisateur
  async function loadUserPreferences() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        const result = await chrome.storage.sync.get(['theme', 'fontSize']);
        userPreferences.theme = result.theme || 'light';
        userPreferences.fontSize = result.fontSize || 'normal';
      } else {
        // Fallback localStorage
        const storedTheme = localStorage.getItem('userTheme');
        const storedFontSize = localStorage.getItem('userFontSize');
        userPreferences.theme = storedTheme || 'light';
        userPreferences.fontSize = storedFontSize || 'normal';
      }
      
      // Appliquer les préférences
      applyTheme(userPreferences.theme);
      applyFontSize(userPreferences.fontSize);
      
      addLog('Préférences utilisateur chargées');
    } catch (error) {
      debugLog('Erreur lors du chargement des préférences:', error);
      // Valeurs par défaut en cas d'erreur
      userPreferences.theme = 'light';
      userPreferences.fontSize = 'normal';
      applyTheme('light');
      applyFontSize('normal');
    }
  }

  // Sauvegarder les préférences utilisateur
  async function saveUserPreferences() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        await chrome.storage.sync.set({
          theme: userPreferences.theme,
          fontSize: userPreferences.fontSize
        });
      } else {
        // Fallback localStorage
        localStorage.setItem('userTheme', userPreferences.theme);
        localStorage.setItem('userFontSize', userPreferences.fontSize);
      }
      addLog('Préférences utilisateur sauvegardées');
    } catch (error) {
      debugLog('Erreur lors de la sauvegarde des préférences:', error);
    }
  }

  // Appliquer le thème
  function applyTheme(theme) {
    const body = document.body;
    if (theme === 'dark') {
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
    } else {
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
    }
    userPreferences.theme = theme;
  }

  // Appliquer la taille de police
  function applyFontSize(size) {
    const body = document.body;
    if (size === 'large') {
      body.classList.add('large-font');
    } else {
      body.classList.remove('large-font');
    }
    userPreferences.fontSize = size;
  }

  // Remplacer l'écouteur sur la barre de recherche par :
  const popupSearchInput = document.getElementById('popup-search-input');
  if (popupSearchInput) {
    popupSearchInput.addEventListener('input', function (e) {
      const query = e.target.value.trim();
      debugLog('[popup] Recherche input:', query);
      if (query.length >= 2) {
        const results = searchEngine.search(query);
        debugLog('[popup] Résultats trouvés:', results);
        uiManager.showSearchResults(results, query, 1);
      } else {
        const resultsBlock = document.getElementById('popup-search-results');
        if (resultsBlock) {
          resultsBlock.style.display = 'none';
          resultsBlock.innerHTML = '';
        }
        document.querySelector('.quick-actions').style.display = '';
        document.querySelector('.actions-bar').style.display = '';
      }
    });
  }
});