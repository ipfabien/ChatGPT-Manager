document.addEventListener("DOMContentLoaded", () => {
  const treeContainer = document.getElementById("tree-container");
  const addFolderForm = document.getElementById("add-folder-form");
  const addChatForm = document.getElementById("add-chat-form");
  const cancelFolderBtn = document.getElementById("cancel-folder");
  const cancelChatBtn = document.getElementById("cancel-chat");
  const folderNameInput = document.getElementById("folder-name");
  const chatNameInput = document.getElementById("chat-name");
  const chatLinkInput = document.getElementById("chat-link");

  let data = null;
  let currentEditNode = null;
  let currentAddParentId = "root"; // dossier où on ajoute un nouvel élément

  function saveData() {
    chrome.storage.local.set({ chatManagerData: data });
  }

  function loadData() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["chatManagerData"], (result) => {
        if (!result.chatManagerData) {
          data = {
            id: "root",
            name: "Mes Chats",
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

  function renderTree() {
    treeContainer.innerHTML = "";

    function createNodeElement(node, level = 0) {
      const li = document.createElement("li");
      li.dataset.id = node.id;
      li.style.marginLeft = (level * 12) + "px";

      const line = document.createElement("div");
      line.className = "tree-node-line";

      if (node.type === "folder") {
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
          currentEditNode = node;
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
          const ul = document.createElement("ul");
          ul.style.listStyleType = "none";
          ul.style.paddingLeft = "0";
          for (const child of node.children) {
            ul.appendChild(createNodeElement(child, level + 1));
          }
          li.appendChild(ul);
        }
      } else if (node.type === "chat") {
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
    ulRoot.appendChild(createNodeElement(data));
    treeContainer.appendChild(ulRoot);
  }

  function hideForms() {
    addFolderForm.style.display = "none";
    addChatForm.style.display = "none";
    currentEditNode = null;
    // Ne pas reset currentAddParentId ici pour garder contexte si on veut ajouter plusieurs éléments dans même dossier
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

    addFolderForm.onsubmit = (e) => {
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
});
