// Utilitaires stockage
const STORAGE_FOLDERS = 'folders';
const STORAGE_CHATS = 'chats';

// Éléments DOM
const folderList = document.getElementById('folder-list');
const addFolderBtn = document.getElementById('add-folder-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const newChatForm = document.getElementById('new-chat-form');
const chatNameInput = document.getElementById('chat-name');
const chatUrlInput = document.getElementById('chat-url');
const chatFolderSelect = document.getElementById('chat-folder');
const saveChatBtn = document.getElementById('save-chat-btn');
const cancelChatBtn = document.getElementById('cancel-chat-btn');

let folders = [];
let chats = {};

// Charge données depuis chrome.storage
function loadData() {
  chrome.storage.local.get([STORAGE_FOLDERS, STORAGE_CHATS], data => {
    folders = data[STORAGE_FOLDERS] || [];
    chats = data[STORAGE_CHATS] || {};
    renderFolders();
  });
}

// Sauvegarde dans chrome.storage
function saveData() {
  chrome.storage.local.set({
    [STORAGE_FOLDERS]: folders,
    [STORAGE_CHATS]: chats
  });
}

// Rend la liste dossiers + chats
function renderFolders() {
  folderList.innerHTML = '';
  chatFolderSelect.innerHTML = '';

  // Remplir select dossiers pour formulaire nouveau chat
  folders.forEach(folder => {
    const opt = document.createElement('option');
    opt.value = folder.id;
    opt.textContent = folder.name;
    chatFolderSelect.appendChild(opt);
  });

  folders.forEach(folder => {
    const folderDiv = document.createElement('div');
    folderDiv.className = 'folder';

    // Titre dossier avec édition nom au clic (prompt)
    const folderTitle = document.createElement('div');
    folderTitle.className = 'folder-title';
    folderTitle.textContent = folder.name;
    folderTitle.onclick = () => {
      const newName = prompt('Renommer le dossier:', folder.name);
      if (newName && newName.trim()) {
        folder.name = newName.trim();
        saveData();
        renderFolders();
      }
    };
    folderDiv.appendChild(folderTitle);

    // Liste chats dans ce dossier
    folder.chatIds.forEach(chatId => {
      const chat = chats[chatId];
      if (!chat) return;

      const chatDiv = document.createElement('div');
      chatDiv.className = 'chat-item';
      chatDiv.textContent = chat.name;
      chatDiv.title = chat.url;
      chatDiv.onclick = () => {
        chrome.tabs.create({ url: chat.url });
      };
      // édition nom chat au clic droit
      chatDiv.oncontextmenu = e => {
        e.preventDefault();
        const newChatName = prompt('Renommer le chat:', chat.name);
        if (newChatName && newChatName.trim()) {
          chat.name = newChatName.trim();
          saveData();
          renderFolders();
        }
      };
      folderDiv.appendChild(chatDiv);
    });

    // Suppression dossier (si vide)
    if (folder.chatIds.length === 0) {
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Supprimer dossier';
      delBtn.onclick = () => {
        if (confirm(`Supprimer le dossier "${folder.name}" ?`)) {
          folders = folders.filter(f => f.id !== folder.id);
          saveData();
          renderFolders();
        }
      };
      folderDiv.appendChild(delBtn);
    }

    folderList.appendChild(folderDiv);
  });

  // Si aucun dossier, proposer d’en créer un automatiquement
  if (folders.length === 0) {
    addFolderBtn.click();
  }
}

// Ajoute un nouveau dossier
addFolderBtn.onclick = () => {
  const name = prompt('Nom du nouveau dossier ?');
  if (!name || !name.trim()) return;
  const folderId = Date.now().toString();
  folders.push({ id: folderId, name: name.trim(), chatIds: [] });
  saveData();
  renderFolders();
};

// Affiche formulaire nouveau chat
newChatBtn.onclick = () => {
  if (folders.length === 0) {
    alert('Créez d\'abord un dossier avant de créer un chat.');
    return;
  }
  chatNameInput.value = '';
  chatUrlInput.value = '';
  chatFolderSelect.value = folders[0].id;
  newChatForm.classList.remove('hidden');
};

// Annule la création de chat
cancelChatBtn.onclick = () => {
  newChatForm.classList.add('hidden');
};

// Enregistre un nouveau chat
saveChatBtn.onclick = () => {
  const name = chatNameInput.value.trim();
  const url = chatUrlInput.value.trim();
  const folderId = chatFolderSelect.value;

  if (!name) {
    alert('Nom du chat obligatoire.');
    return;
  }
  if (!url || !url.startsWith('https://chat.openai.com/chat/')) {
    alert('URL du chat ChatGPT invalide.');
    return;
  }
  const folder = folders.find(f => f.id === folderId);
  if (!folder) {
    alert('Dossier invalide.');
    return;
  }

  const chatId = Date.now().toString();
  chats[chatId] = { name, url };
  folder.chatIds.push(chatId);

  saveData();
  renderFolders();
  newChatForm.classList.add('hidden');
};

loadData();
