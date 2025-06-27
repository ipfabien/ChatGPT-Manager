document.addEventListener("DOMContentLoaded", () => {
  const treeContainer = document.getElementById("tree-container");
  const addFolderForm = document.getElementById("add-folder-form");
  const addChatForm = document.getElementById("add-chat-form");
  const cancelFolderBtn = document.getElementById("cancel-folder");
  const cancelChatBtn = document.getElementById("cancel-chat");
  const folderNameInput = document.getElementById("folder-name");
  const chatNameInput = document.getElementById("chat-name");
  const chatLinkInput = document.getElementById("chat-link");

  // Ajout du listener pour le bouton Reset
  const btnReset = document.getElementById('btn-reset');
  if (btnReset) btnReset.addEventListener('click', resetData);

  // Ajout du listener pour le bouton Logs
  const btnLogs = document.getElementById('btn-logs');
  if (btnLogs) btnLogs.addEventListener('click', toggleDebugZone);

  let data = null;
  let currentEditNode = null;
  let currentAddParentId = "root"; // dossier où on ajoute un nouvel élément

  // Variables pour le drag and drop
  let draggedElement = null;
  let draggedNode = null;
  let dropTarget = null;
  let dragOffset = { x: 0, y: 0 };

  function saveData() {
    chrome.storage.local.set({ chatManagerData: data });
  }

  function resetData() {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action supprimera tous vos dossiers et chats et ne peut pas être annulée.")) {
      // Supprimer toutes les données du localStorage
      chrome.storage.local.clear(() => {
        // Réinitialiser la variable data avec les valeurs par défaut
        data = {
          id: "root",
          name: "🏠 Accueil",
          type: "folder",
          children: [],
          expanded: true,
        };
        
        // Sauvegarder les données par défaut
        saveData();
        
        // Recharger l'interface
        renderTree();
        
        // Masquer les formulaires s'ils sont ouverts
        hideForms();
        
        // Afficher un message de confirmation
        alert("Extension réinitialisée avec succès ! Vous pouvez maintenant recommencer à organiser vos chats.");
      });
    }
  }

  function loadData() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["chatManagerData"], (result) => {
        if (!result.chatManagerData) {
          data = {
            id: "root",
            name: "🏠 Accueil",
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

  // Fonctions pour le drag and drop
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

    // Empêcher de déplacer le dossier racine
    if (sourceNodeId === "root") {
      return false;
    }

    const sourceNode = findById(data, sourceNodeId);
    const targetNode = findById(data, targetNodeId);

    if (!sourceNode || !targetNode) {
      return false;
    }

    // Empêcher de déplacer un élément dans son parent actuel (inutile)
    const sourceParent = findParentNode(data, sourceNodeId);
    if (targetNode.id !== "root" && sourceParent && sourceParent.id === targetNodeId) {
      return false;
    }

    // Vérifier que la cible n'est pas un descendant de la source
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

    // Ajouter le nœud au nouveau parent
    if (targetNode.type === "folder" || targetNode.id === "root") {
      if (!targetNode.children) {
        targetNode.children = [];
      }
      targetNode.children.push(movedNode);
    } else {
      // Si la cible est un chat, on l'ajoute au parent du chat
      const targetParent = findParentNode(data, targetNodeId);
      if (targetParent) {
        if (!targetParent.children) {
          targetParent.children = [];
        }
        targetParent.children.push(movedNode);
      } else {
        // Si pas de parent trouvé, remettre le nœud à sa place
        sourceParent.children.splice(sourceIndex, 0, movedNode);
        return false;
      }
    }

    return true;
  }

  function handleDragStart(e) {
    // Empêcher le drag si on clique sur un bouton ou un lien
    if (e.target.tagName === 'BUTTON' || e.target.closest('button') || 
        e.target.tagName === 'A' || e.target.closest('a') ||
        e.target.classList.contains('chat-name') || e.target.classList.contains('folder-name') ||
        e.target.classList.contains('toggle-icon')) {
      e.preventDefault();
      return;
    }
    
    // Trouver l'élément LI
    const li = e.target.closest('li');
    
    if (!li) {
      return;
    }
    
    const nodeId = li.dataset.id;
    
    if (nodeId === "root") {
      return;
    }
    
    draggedElement = li;
    draggedNode = findById(data, nodeId);
    
    if (!draggedNode) {
      return;
    }
    
    // Ajouter la classe de drag
    draggedElement.classList.add('dragging');
    
    // Configurer le dataTransfer correctement
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedNode.id);
    e.dataTransfer.setData('application/json', JSON.stringify(draggedNode));
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const targetLi = e.target.closest('li');

    if (!targetLi || !draggedElement) {
      return;
    }

    const targetNode = findById(data, targetLi.dataset.id);

    if (!targetNode) {
      return;
    }

    // Ne pas changer les classes si la cible n'a pas changé
    if (dropTarget !== targetLi) {
      document.querySelectorAll('.drop-zone').forEach(el => {
        el.classList.remove('drag-over', 'drop-valid', 'drop-invalid');
      });
    }

    // Vérifier si le drop est valide
    const isValidDrop = isValidDropTarget(targetNode);

    if (isValidDrop) {
      targetLi.classList.add('drop-zone', 'drag-over', 'drop-valid');
      targetLi.classList.remove('drop-invalid');
    } else {
      targetLi.classList.add('drop-zone', 'drag-over', 'drop-invalid');
      targetLi.classList.remove('drop-valid');
    }

    dropTarget = targetLi;
  }

  function isValidDropTarget(targetNode) {
    if (!draggedNode) {
      return false;
    }

    // Le dossier racine peut recevoir des éléments (toujours autorisé)
    if (targetNode.id === "root") {
      return true;
    }

    // Seuls les dossiers peuvent recevoir des éléments
    if (targetNode.type !== "folder") {
      return false;
    }

    // Empêcher de déplacer un élément dans lui-même
    if (targetNode.id === draggedNode.id) {
      return false;
    }

    // Empêcher de déplacer un élément dans son parent actuel (inutile)
    const sourceParent = findParentNode(data, draggedNode.id);
    if (sourceParent && sourceParent.id === targetNode.id) {
      return false;
    }

    // Empêcher de déplacer un élément dans ses descendants
    function isDescendant(node, potentialDescendantId) {
      if (!node.children) return false;
      for (const child of node.children) {
        if (child.id === potentialDescendantId) return true;
        if (isDescendant(child, potentialDescendantId)) return true;
      }
      return false;
    }

    const isDesc = isDescendant(draggedNode, targetNode.id);

    return !isDesc;
  }

  function handleDragLeave(e) {
    const targetLi = e.target.closest('li');
    if (targetLi && targetLi !== dropTarget) {
      targetLi.classList.remove('drop-zone', 'drag-over', 'drop-valid', 'drop-invalid');
    }
    
    // Vérifier si on quitte complètement la zone de drop
    const relatedTarget = e.relatedTarget;
    if (!relatedTarget || !targetLi?.contains(relatedTarget)) {
      if (targetLi) {
        targetLi.classList.remove('drop-zone', 'drag-over', 'drop-valid', 'drop-invalid');
      }
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    
    if (!draggedElement || !dropTarget) {
      return;
    }
    
    const sourceId = draggedElement.dataset.id;
    const targetId = dropTarget.dataset.id;
    
    // Nettoyer les classes
    document.querySelectorAll('.drop-zone').forEach(el => {
      el.classList.remove('drop-zone', 'drag-over', 'drop-valid', 'drop-invalid');
    });
    
    // Effectuer le déplacement
    if (moveNode(sourceId, targetId)) {
      saveData();
      renderTree();
    }
    
    // Réinitialiser
    if (draggedElement) {
      draggedElement.classList.remove('dragging');
    }
    draggedElement = null;
    draggedNode = null;
    dropTarget = null;
  }

  function handleDragEnd(e) {
    if (draggedElement) {
      draggedElement.classList.remove('dragging');
    }
    
    // Nettoyer les classes
    document.querySelectorAll('.drop-zone').forEach(el => {
      el.classList.remove('drop-zone', 'drag-over', 'drop-valid', 'drop-invalid');
    });
    
    draggedElement = null;
    draggedNode = null;
    dropTarget = null;
  }

  function renderTree() {
    // Nettoyer les event listeners existants sur les éléments LI
    const existingLis = treeContainer.querySelectorAll('li');
    existingLis.forEach(li => {
      li.removeEventListener('dragstart', handleDragStart);
      li.removeEventListener('dragover', handleDragOver);
      li.removeEventListener('dragleave', handleDragLeave);
      li.removeEventListener('drop', handleDrop);
      li.removeEventListener('dragend', handleDragEnd);
    });
    
    // Nettoyer les variables de drag
    draggedElement = null;
    draggedNode = null;
    dropTarget = null;
    
    treeContainer.innerHTML = "";

    function createNodeElement(node, level = 0) {
      const li = document.createElement("li");
      li.dataset.id = node.id;
      li.style.marginLeft = (level * 12) + "px";

      // Rendre l'élément draggable (sauf le dossier racine)
      if (node.id !== "root") {
        li.draggable = true;
        li.classList.add('draggable');
        
        // Attacher les event listeners sur l'élément LI
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragover', handleDragOver);
        li.addEventListener('dragleave', handleDragLeave);
        li.addEventListener('drop', handleDrop);
        li.addEventListener('dragend', handleDragEnd);
      }

      // Test simple pour vérifier que l'élément est cliquable
      li.addEventListener('click', (e) => {
        if (e.target.closest('.drag-handle')) {
        }
      });

      const line = document.createElement("div");
      line.className = "tree-node-line";

      if (node.type === "folder") {
        // Ajouter le handle de drag (sauf pour le dossier racine)
        if (node.id !== "root") {
          const dragHandle = document.createElement("span");
          dragHandle.className = "drag-handle";
          dragHandle.innerHTML = "⋮⋮";
          dragHandle.title = "Glisser pour déplacer";
          line.appendChild(dragHandle);
        }

        const toggle = document.createElement("span");
        toggle.className = "toggle-icon";
        toggle.textContent = node.expanded ? "▼" : "▶";
        toggle.title = node.expanded ? "Réduire le dossier" : "Développer le dossier";
        toggle.style.cursor = "pointer";
        toggle.addEventListener("click", () => {
          node.expanded = !node.expanded;
          saveData();
          renderTree();
        });
        line.appendChild(toggle);

        const folderNameSpan = document.createElement("span");
        folderNameSpan.textContent = node.name;
        folderNameSpan.className = "folder-name";
        folderNameSpan.style.marginLeft = "5px";
        line.appendChild(folderNameSpan);

        const addFolderBtn = document.createElement("button");
        addFolderBtn.className = "btn-green btn-small";
        addFolderBtn.title = "Ajouter un sous-dossier";
        addFolderBtn.innerHTML = "📁➕";
        addFolderBtn.style.fontSize = "14px";
        addFolderBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          currentEditNode = null; // Reset pour création
          currentAddParentId = node.id;  // Important : on positionne le parent ici
          openEditFolderForm();
        });
        line.appendChild(addFolderBtn);

        const addChatBtn = document.createElement("button");
        addChatBtn.className = "btn-green btn-small";
        addChatBtn.title = "Ajouter un chat dans ce dossier";
        addChatBtn.innerHTML = "💬➕";
        addChatBtn.style.fontSize = "14px";
        addChatBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          currentEditNode = null; // Reset pour création
          currentAddParentId = node.id; // Important : idem, on garde bien le dossier cible
          openEditChatForm();
        });
        line.appendChild(addChatBtn);

        const editBtn = document.createElement("button");
        editBtn.innerHTML = "✏️";
        editBtn.className = "edit-btn";
        editBtn.title = "Modifier le nom du dossier";
        editBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          addToDebugZone("Edit button clicked for folder:", node.name);
          currentEditNode = node;
          addToDebugZone("currentEditNode set to:", currentEditNode);
          openEditFolderForm(node);
        });
        line.appendChild(editBtn);

        if (node.id !== "root") {
          const delBtn = document.createElement("button");
          delBtn.innerHTML = "🗑️";
          delBtn.className = "edit-btn";
          delBtn.title = "Supprimer ce dossier et son contenu";
          delBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (confirm(`Confirmer la suppression du dossier "${node.name}" et de tout son contenu ?`)) {
              if (deleteNodeById(data, node.id)) {
                saveData();
                renderTree();
                hideForms();
              }
            }
          });
          line.appendChild(delBtn);
        }

        li.appendChild(line);

        if (node.expanded && node.children && node.children.length) {
          // Tri : dossiers d'abord, puis chats, puis ordre alphabétique
          const sortedChildren = [...node.children].sort((a, b) => {
            if (a.type !== b.type) {
              return a.type === "folder" ? -1 : 1;
            }
            return a.name.localeCompare(b.name, 'fr', {sensitivity: 'base'});
          });
          const ul = document.createElement("ul");
          ul.style.listStyleType = "none";
          ul.style.paddingLeft = "0";
          for (const child of sortedChildren) {
            ul.appendChild(createNodeElement(child, level + 1));
          }
          li.appendChild(ul);
        }
      } else if (node.type === "chat") {
        // Ajouter le handle de drag pour les chats
        const dragHandle = document.createElement("span");
        dragHandle.className = "drag-handle";
        dragHandle.innerHTML = "⋮⋮";
        dragHandle.title = "Glisser pour déplacer";
        line.appendChild(dragHandle);

        const chatLinkSpan = document.createElement("span");
        chatLinkSpan.textContent = node.name;
        chatLinkSpan.className = "chat-name";
        chatLinkSpan.title = node.link;
        chatLinkSpan.addEventListener("click", () => {
          chrome.tabs.create({ url: node.link });
        });
        line.appendChild(chatLinkSpan);

        const editBtn = document.createElement("button");
        editBtn.innerHTML = "✏️";
        editBtn.className = "edit-btn";
        editBtn.title = "Modifier le chat";
        editBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          currentEditNode = node;
          openEditChatForm(node);
        });
        line.appendChild(editBtn);

        const delBtn = document.createElement("button");
        delBtn.innerHTML = "🗑️";
        delBtn.className = "edit-btn";
        delBtn.title = "Supprimer ce chat";
        delBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (confirm(`Confirmer la suppression du chat "${node.name}" ?`)) {
            if (deleteNodeById(data, node.id)) {
              saveData();
              renderTree();
              hideForms();
            }
          }
        });
        line.appendChild(delBtn);

        li.appendChild(line);
      }

      return li;
    }

    const ulRoot = document.createElement("ul");
    ulRoot.style.listStyleType = "none";
    ulRoot.style.paddingLeft = "0";

    // Créer un LI pour le dossier racine, qui sera droppable
    const rootLi = document.createElement("li");
    rootLi.dataset.id = data.id;
    rootLi.classList.add('drop-zone');
    rootLi.addEventListener('dragover', handleDragOver);
    rootLi.addEventListener('dragleave', handleDragLeave);
    rootLi.addEventListener('drop', handleDrop);
    rootLi.addEventListener('dragend', handleDragEnd);
    
    // Afficher l'arbre à partir du dossier racine (sans doublon du titre)
    rootLi.appendChild(createNodeElement(data));
    ulRoot.appendChild(rootLi);
    treeContainer.appendChild(ulRoot);
  }

  function hideForms() {
    addFolderForm.style.display = "none";
    addChatForm.style.display = "none";
    // Ne pas reset currentEditNode ici car on en a besoin pour l'édition
    // currentEditNode = null;
    // Ne pas reset currentAddParentId ici pour garder contexte si on veut ajouter plusieurs éléments dans même dossier
  }

  // Fonction pour ajouter un message à la zone de debug
  function addToDebugZone(message, data = null) {
    const debugZone = document.getElementById('debug-zone');
    const debugContent = document.getElementById('debug-content');
    
    if (debugZone && debugContent) {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = document.createElement('div');
      logEntry.style.marginBottom = '2px';
      logEntry.style.borderBottom = '1px solid #ddd';
      logEntry.style.paddingBottom = '2px';
      
      let content = `[${timestamp}] ${message}`;
      if (data) {
        content += `: ${JSON.stringify(data).substring(0, 100)}...`;
      }
      
      logEntry.textContent = content;
      debugContent.appendChild(logEntry);
      
      // Garder seulement les 10 derniers logs
      while (debugContent.children.length > 10) {
        debugContent.removeChild(debugContent.firstChild);
      }
      
      // Scroll vers le bas
      debugZone.scrollTop = debugZone.scrollHeight;
    }
  }

  function openEditFolderForm(node) {
    hideForms();
    addFolderForm.style.display = "block";
    
    // Debug temporaire
    addToDebugZone("openEditFolderForm called with node:", node);
    addToDebugZone("currentEditNode:", currentEditNode);
    
    if (node) {
      folderNameInput.value = node.name;
      addToDebugZone("Setting folder name to:", node.name);
    } else {
      folderNameInput.value = "";
      addToDebugZone("Clearing folder name");
    }
    folderNameInput.focus();

    addFolderForm.onsubmit = (e) => {
      e.preventDefault();
      const name = folderNameInput.value.trim();
      if (!name) return alert("Le nom du dossier est obligatoire.");

      addToDebugZone("Form submitted with name:", name);
      addToDebugZone("currentEditNode:", currentEditNode);

      if (currentEditNode) {
        addToDebugZone("Editing existing folder:", currentEditNode.name + " -> " + name);
        currentEditNode.name = name;
      } else {
        addToDebugZone("Creating new folder in parent:", currentAddParentId);
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
      currentEditNode = null; // Reset après édition/création
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

    addChatForm.onsubmit = (e) => {
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
  });

  // Fonction pour afficher/masquer la zone de debug
  function toggleDebugZone() {
    const debugZone = document.getElementById('debug-zone');
    if (debugZone) {
      if (debugZone.style.display === 'none') {
        debugZone.style.display = 'block';
      } else {
        debugZone.style.display = 'none';
      }
    }
  }

  // Fonction de debug pour tester le drag and drop
  function debugDragAndDrop() {
  }

  // Exposer les fonctions de debug globalement pour les tests
  window.debugDragAndDrop = debugDragAndDrop;
});
