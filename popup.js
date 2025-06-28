document.addEventListener("DOMContentLoaded", () => {
  const treeContainer = document.getElementById("tree-container");
  const addFolderForm = document.getElementById("folder-form");
  const addChatForm = document.getElementById("chat-form");
  const cancelFolderBtn = document.getElementById("cancel-folder");
  const cancelChatBtn = document.getElementById("cancel-chat");
  const folderNameInput = document.getElementById("folder-name");
  const chatNameInput = document.getElementById("chat-name");
  const chatLinkInput = document.getElementById("chat-link");

  // Écouteurs d'événements pour les nouvelles fonctionnalités (mode statique)
  document.getElementById("toggle-theme").addEventListener("click", function() {
    const body = document.body;
    if (body.classList.contains('light-mode')) {
      body.classList.remove('light-mode');
      body.classList.add('dark-mode');
      this.querySelector('.material-icons').textContent = 'dark_mode';
    } else {
      body.classList.remove('dark-mode');
      body.classList.add('light-mode');
      this.querySelector('.material-icons').textContent = 'light_mode';
    }
  });

  document.getElementById("fullscreen-btn").addEventListener("click", function() {
    // Fonctionnalité à implémenter plus tard
    alert('Fonctionnalité plein écran à implémenter dans une prochaine version');
  });

  // Barre de recherche (mode statique)
  const searchInput = document.querySelector('.search-bar input');
  searchInput.addEventListener('input', function() {
    // Fonctionnalité à implémenter plus tard
    console.log('Recherche:', this.value);
  });

  // Boutons tout ouvrir/fermer (mode statique)
  document.querySelector('.search-bar button[title="Tout ouvrir"]').addEventListener('click', function() {
    // Fonctionnalité à implémenter plus tard
    alert('Fonctionnalité "Tout ouvrir" à implémenter');
  });

  document.querySelector('.search-bar button[title="Tout fermer"]').addEventListener('click', function() {
    // Fonctionnalité à implémenter plus tard
    alert('Fonctionnalité "Tout fermer" à implémenter');
  });

  // Event listeners pour les boutons de debug
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ?')) {
      chrome.storage.local.remove(['chatManagerData'], () => {
        location.reload();
      });
    }
  });

  document.getElementById('logsBtn').addEventListener('click', () => {
    const logsContainer = document.getElementById('logs-container');
    if (logsContainer.style.display === 'none' || logsContainer.style.display === '') {
      logsContainer.style.display = 'block';
      addLog('Zone de logs ouverte');
    } else {
      logsContainer.style.display = 'none';
    }
  });

  // Test des effets visuels
  function testVisualEffects() {
    const firstElement = document.querySelector('.tree-node-line');
    if (firstElement) {
      console.log('Test des effets visuels sur:', firstElement.dataset.id);
      console.log('Classes avant:', firstElement.className);
      
      // Tester l'effet dragging
      firstElement.classList.add('dragging');
      console.log('Classes après dragging:', firstElement.className);
      
      setTimeout(() => {
        firstElement.classList.remove('dragging');
        firstElement.classList.add('drag-over');
        console.log('Classes après drag-over:', firstElement.className);
        
        setTimeout(() => {
          firstElement.classList.remove('drag-over');
          console.log('Test terminé');
        }, 2000);
      }, 2000);
    }
  }

  // Ajouter un bouton de test temporaire
  const testBtn = document.createElement('button');
  testBtn.textContent = 'Test Effets';
  testBtn.style.position = 'fixed';
  testBtn.style.top = '10px';
  testBtn.style.right = '10px';
  testBtn.style.zIndex = '1000';
  testBtn.onclick = testVisualEffects;
  document.body.appendChild(testBtn);

  // Variables globales
  let data = null;
  let currentEditNode = null;
  let currentAddParentId = "root";

  // Variables pour le drag and drop
  let draggedElement = null;
  let draggedNode = null;
  let dropTarget = null;
  let currentDraggedId = null; // Variable pour stocker l'ID de l'élément dragué

  function saveData() {
    chrome.storage.local.set({ chatManagerData: data });
  }

  function loadData() {
    return new Promise((resolve) => {
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
        resolve();
      });
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
    console.log('Attachement des listeners drag...');
    
    // Attendre que le DOM soit prêt
    setTimeout(() => {
        document.querySelectorAll('.tree-node-line').forEach(node => {
            const nodeId = node.dataset.id;
            console.log(`Attachement des listeners pour le nœud: ${nodeId}`);
            
            // Marquer comme draggable
            node.setAttribute('draggable', 'true');
            node.classList.add('draggable');
        });
        
        // Utiliser la délégation d'événements au niveau du conteneur
        const treeContainer = document.getElementById('tree-container');
        
        // Supprimer les anciens listeners en utilisant removeEventListener
        // (on va utiliser une fonction nommée pour pouvoir les supprimer)
        if (treeContainer._dragStartHandler) {
            treeContainer.removeEventListener('dragstart', treeContainer._dragStartHandler);
        }
        if (treeContainer._dragOverHandler) {
            treeContainer.removeEventListener('dragover', treeContainer._dragOverHandler);
        }
        if (treeContainer._dragEnterHandler) {
            treeContainer.removeEventListener('dragenter', treeContainer._dragEnterHandler);
        }
        if (treeContainer._dragLeaveHandler) {
            treeContainer.removeEventListener('dragleave', treeContainer._dragLeaveHandler);
        }
        if (treeContainer._dropHandler) {
            treeContainer.removeEventListener('drop', treeContainer._dropHandler);
        }
        if (treeContainer._dragEndHandler) {
            treeContainer.removeEventListener('dragend', treeContainer._dragEndHandler);
        }
        
        // Créer les nouveaux handlers
        treeContainer._dragStartHandler = (e) => {
            const draggedNode = e.target.closest('.tree-node-line');
            if (!draggedNode) return;
            
            const nodeId = draggedNode.dataset.id;
            console.log(`[${getTime()}] Drag start sur: ${nodeId}`);
            e.dataTransfer.setData('text/plain', nodeId);
            e.dataTransfer.effectAllowed = 'move';
            draggedNode.classList.add('dragging');
            
            // Ajouter une classe selon le type d'élément
            if (draggedNode.classList.contains('folder')) {
                draggedNode.classList.add('dragging-folder');
            } else {
                draggedNode.classList.add('dragging-chat');
            }
            
            // Stocker l'ID de l'élément dragué
            currentDraggedId = nodeId;
            
            // Récupérer le nom de l'élément
            const folderName = draggedNode.querySelector('.folder-name');
            const chatLink = draggedNode.querySelector('.chat-link');
            const elementName = folderName ? folderName.textContent : (chatLink ? chatLink.textContent : 'élément');
            logMessage(`Début du drag: ${elementName}`);
            
            console.log(`[${getTime()}] Classe dragging ajoutée à ${nodeId}, classes actuelles:`, draggedNode.className);
        };
        
        treeContainer._dragOverHandler = (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            const targetNode = e.target.closest('.tree-node-line');
            if (!targetNode) {
                console.log(`[${getTime()}] Drag over - aucun nœud trouvé`);
                return;
            }
            
            const nodeId = targetNode.dataset.id;
            
            console.log(`[${getTime()}] Drag over - target: ${nodeId}, dragged: ${currentDraggedId}, isFolder: ${targetNode.classList.contains('folder')}`);
            
            if (currentDraggedId && currentDraggedId !== nodeId && targetNode.classList.contains('folder')) {
                if (!targetNode.classList.contains('drag-over')) {
                    console.log(`[${getTime()}] Drag over sur dossier: ${nodeId}`);
                    targetNode.classList.add('drag-over');
                    
                    // Ajouter la classe selon le type d'élément en cours de drag
                    const draggedNode = document.querySelector(`[data-id="${currentDraggedId}"]`);
                    if (draggedNode && draggedNode.classList.contains('folder')) {
                        targetNode.classList.add('drag-over-folder');
                    } else {
                        targetNode.classList.add('drag-over-chat');
                    }
                    
                    console.log(`[${getTime()}] Classe drag-over ajoutée à ${nodeId}, classes actuelles:`, targetNode.className);
                    logMessage(`Survol zone: ${nodeId}`);
                }
            } else if (currentDraggedId && currentDraggedId !== nodeId && !targetNode.classList.contains('folder')) {
                console.log(`[${getTime()}] Drag over sur non-dossier: ${nodeId}`);
            }
        };
        
        treeContainer._dragEnterHandler = (e) => {
            e.preventDefault();
            const targetNode = e.target.closest('.tree-node-line');
            if (!targetNode) return;
            
            const nodeId = targetNode.dataset.id;
            console.log(`[${getTime()}] Drag enter sur: ${nodeId}`);
            
            if (currentDraggedId && currentDraggedId !== nodeId && targetNode.classList.contains('folder')) {
                targetNode.classList.add('drag-over');
                
                // Ajouter la classe selon le type d'élément en cours de drag
                const draggedNode = document.querySelector(`[data-id="${currentDraggedId}"]`);
                if (draggedNode && draggedNode.classList.contains('folder')) {
                    targetNode.classList.add('drag-over-folder');
                } else {
                    targetNode.classList.add('drag-over-chat');
                }
                
                logMessage(`Entrée zone: ${nodeId}`);
            }
        };
        
        treeContainer._dragLeaveHandler = (e) => {
            e.preventDefault();
            const targetNode = e.target.closest('.tree-node-line');
            if (!targetNode) return;
            
            const nodeId = targetNode.dataset.id;
            console.log(`[${getTime()}] Drag leave sur: ${nodeId}`);
            
            // Vérifier si on quitte vraiment l'élément
            const rect = targetNode.getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;
            
            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                targetNode.classList.remove('drag-over');
                targetNode.classList.remove('drag-over-folder');
                targetNode.classList.remove('drag-over-chat');
                logMessage(`Sortie zone: ${nodeId}`);
            }
        };
        
        treeContainer._dropHandler = (e) => {
            e.preventDefault();
            const targetNode = e.target.closest('.tree-node-line');
            if (!targetNode) return;
            
            const nodeId = targetNode.dataset.id;
            console.log(`[${getTime()}] Drop sur: ${nodeId}`);
            
            if (currentDraggedId && currentDraggedId !== nodeId && targetNode.classList.contains('folder')) {
                const success = moveNode(currentDraggedId, nodeId);
                if (success) {
                    logMessage(`Déplacement réussi: ${currentDraggedId} vers ${nodeId}`);
                    saveData();
                    renderTree();
                    attachDragListeners(); // Réattacher les listeners après le rendu
                } else {
                    logMessage(`Échec du déplacement: ${currentDraggedId} vers ${nodeId}`);
                }
            }
            
            // Nettoyer les classes
            document.querySelectorAll('.tree-node-line').forEach(n => {
                n.classList.remove('drag-over');
                n.classList.remove('drag-over-folder');
                n.classList.remove('drag-over-chat');
            });
        };
        
        treeContainer._dragEndHandler = (e) => {
            const draggedNode = e.target.closest('.tree-node-line');
            if (!draggedNode) return;
            
            const nodeId = draggedNode.dataset.id;
            console.log(`[${getTime()}] Drag end sur: ${nodeId}`);
            draggedNode.classList.remove('dragging');
            draggedNode.classList.remove('dragging-folder');
            draggedNode.classList.remove('dragging-chat');
            logMessage('Fin du drag');
            
            // Réinitialiser l'ID de l'élément dragué
            currentDraggedId = null;
            
            // Nettoyer les classes
            document.querySelectorAll('.tree-node-line').forEach(n => {
                n.classList.remove('drag-over');
            });
        };
        
        // Attacher les nouveaux listeners
        treeContainer.addEventListener('dragstart', treeContainer._dragStartHandler);
        treeContainer.addEventListener('dragover', treeContainer._dragOverHandler);
        treeContainer.addEventListener('dragenter', treeContainer._dragEnterHandler);
        treeContainer.addEventListener('dragleave', treeContainer._dragLeaveHandler);
        treeContainer.addEventListener('drop', treeContainer._dropHandler);
        treeContainer.addEventListener('dragend', treeContainer._dragEndHandler);
        
        console.log('Listeners drag attachés avec succès (délégation)');
    }, 100);
  }

  function renderTree() {
    const treeContainer = document.getElementById('tree-container');
    treeContainer.innerHTML = '';
    
    function renderNode(node, level = 0) {
        const li = document.createElement('li');
        const nodeElement = document.createElement('div');
        nodeElement.className = 'tree-node-line';
        nodeElement.dataset.id = node.id;
        nodeElement.style.marginLeft = `${level * 16}px`;
        
        // Ajouter la classe 'folder' pour les dossiers
        if (node.type === 'folder') {
            nodeElement.classList.add('folder');
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
                `<span class="material-icons" data-action="deleteNode" data-id="${node.id}" title="Supprimer">delete</span>`;
            
            html += `
                <span class="material-icons toggle-icon" data-action="toggle" data-id="${node.id}" style="${hasChildren ? '' : 'opacity: 0.3;'}">${toggleIcon}</span>
                <span class="material-icons">${node.id === 'root' ? 'home' : 'folder'}</span>
                <span class="folder-name">${node.name}</span>
                <span class="folder-counter">${countChatsInFolder(node)}</span>
                <div class="edit-btns">
                    <span class="material-icons" data-action="addChat" data-id="${node.id}" title="Ajouter un chat">chat_bubble_outline</span>
                    <span class="material-icons" data-action="addFolder" data-id="${node.id}" title="Ajouter un dossier">folder_open</span>
                    <span class="material-icons" data-action="editNode" data-id="${node.id}" title="Modifier">edit</span>
                    ${deleteButton}
                </div>
            `;
        } else {
            html += `
                <span class="material-icons">chat</span>
                <a href="${node.link}" class="chat-link" target="_blank">${node.name}</a>
                <div class="edit-btns">
                    <span class="material-icons" data-action="editNode" data-id="${node.id}" title="Modifier">edit</span>
                    <span class="material-icons" data-action="deleteNode" data-id="${node.id}" title="Supprimer">delete</span>
                </div>
            `;
        }
        
        nodeElement.innerHTML = html;
        
        // Ajouter les event listeners pour les boutons d'action
        const actionButtons = nodeElement.querySelectorAll('[data-action]');
        console.log(`Attachement des boutons d'action pour ${node.id}:`, actionButtons.length, 'boutons trouvés');
        actionButtons.forEach(button => {
            const action = button.dataset.action;
            const id = button.dataset.id;
            console.log(`Attachement du bouton ${action} pour l'ID ${id}`);
            
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log(`Clic sur le bouton ${action} pour l'ID ${id}`);
                
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
        
        li.appendChild(nodeElement);
        
        // Créer la liste des enfants si c'est un dossier
        if (node.type === 'folder' && hasChildren && isExpanded) {
            const ul = document.createElement('ul');
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
    addFolderForm.style.display = "none";
    addChatForm.style.display = "none";
  }

  function openEditFolderForm(node) {
    hideForms();
    addFolderForm.style.display = "block";
    
    if (node) {
      folderNameInput.value = node.name;
    } else {
      folderNameInput.value = "";
    }
    folderNameInput.focus();

    addFolderForm.querySelector('form').onsubmit = (e) => {
      e.preventDefault();
      const name = folderNameInput.value.trim();
      if (!name) return alert("Le nom du dossier est obligatoire.");

      if (currentEditNode) {
        currentEditNode.name = name;
      } else {
        const parent = findById(data, currentAddParentId);
        if (!parent || parent.type !== "folder") {
          alert("Dossier parent introuvable.");
          return;
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
    addChatForm.style.display = "block";
    if (node) {
      chatNameInput.value = node.name;
      chatLinkInput.value = node.link;
    } else {
      chatNameInput.value = "";
      chatLinkInput.value = "";
    }
    chatNameInput.focus();

    addChatForm.querySelector('form').onsubmit = (e) => {
      e.preventDefault();
      const name = chatNameInput.value.trim();
      const link = chatLinkInput.value.trim();
      if (!name || !link) return alert("Le nom et le lien du chat sont obligatoires.");

      if (currentEditNode) {
        currentEditNode.name = name;
        currentEditNode.link = link;
      } else {
        const parent = findById(data, currentAddParentId);
        if (!parent || parent.type !== "folder") {
          alert("Dossier parent introuvable.");
          return;
        }
        parent.children.push({
          id: generateId(),
          name,
          link,
          type: "chat",
        });
      }
      saveData();
      hideForms();
      renderTree();
    };
  }

  cancelFolderBtn.addEventListener("click", () => {
    hideForms();
  });

  cancelChatBtn.addEventListener("click", () => {
    hideForms();
  });

  loadData().then(() => {
    renderTree();
    
    // Ajouter les event listeners de drag & drop au niveau du conteneur
    attachDragListeners();
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
    console.log('Fonction addChat appelée avec parentId:', parentId);
    currentAddParentId = parentId;
    openEditChatForm();
  }

  function addFolder(parentId) {
    console.log('Fonction addFolder appelée avec parentId:', parentId);
    currentAddParentId = parentId;
    openEditFolderForm();
  }

  function editNode(nodeId) {
    console.log('Fonction editNode appelée avec nodeId:', nodeId);
    const node = findById(data, nodeId);
    if (!node) return;
    
    currentEditNode = node;
    if (node.type === 'folder') {
      openEditFolderForm(node);
    } else {
      openEditChatForm(node);
    }
  }

  function deleteNode(nodeId) {
    console.log('Fonction deleteNode appelée avec nodeId:', nodeId);
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
    console.log('Fonction toggleFolder appelée avec folderId:', folderId);
    const folder = findById(data, folderId);
    console.log('Dossier trouvé:', folder);
    
    if (folder && folder.type === 'folder') {
      const wasExpanded = folder.expanded;
      folder.expanded = !folder.expanded;
      console.log(`Dossier ${folder.name}: ${wasExpanded} -> ${folder.expanded}`);
      
      saveData();
      renderTree();
      addLog(`Toggle dossier: ${folder.name} - ${folder.expanded ? 'ouvert' : 'fermé'}`);
    } else {
      console.log('Dossier non trouvé ou pas un dossier:', folder);
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
    console.log('handleDragOver appelé sur:', e.target.closest('.tree-node-line')?.dataset.id);
  }
});