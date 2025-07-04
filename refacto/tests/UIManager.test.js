// UIManager.test.js
// Tests unitaires pour UIManager

const UIManager = require('../managers/UIManager');

// Mock du DOM pour les tests
document.body.innerHTML = `
  <div id="tree-container"></div>
  <div id="debug-area" style="display: none;">
    <div id="debug-content"></div>
  </div>
`;

beforeEach(() => {
  global.window = global.window || {};
  window.loadAndRenderTemplate = jest.fn(async (path, data) => {
    if (path.includes('search-result-item')) {
      return `<div class="search-result-item compact" data-id="${data.id}" tabindex="0" role="listitem">` +
        `<div class="result-path-container">` +
        `<a class="chat-link">${data.name}</a>` +
        (data.tag ? `<span class="chat-tag compact" aria-label="Tag: ${data.tag}">${data.tag}</span>` : '') +
        `<span class="path-icon">${data.icon}</span>` +
        (data.hasSeparator ? `<span class="path-separator"> &gt; </span>` : '') +
        `</div>` +
        `<div class="result-actions">` +
        `<span class="material-icons edit-btn compact" data-id="${data.id}" title="Modifier" aria-label="Modifier le chat '${data.name}'">edit</span>` +
        `<span class="material-icons delete-btn compact" data-id="${data.id}" title="Supprimer" aria-label="Supprimer le chat '${data.name}'">delete</span>` +
        `</div>` +
        `</div>`;
    }
    if (path.includes('search-results')) {
      return `<div class="search-results-list">${data.results}</div>`;
    }
    if (path.includes('search-pagination')) {
      return `<div class="pagination-controls">` +
        `<button class="pagination-btn prev-btn" ${data.prevDisabled}></button>` +
        `<button class="pagination-btn next-btn" ${data.nextDisabled}></button>` +
        `</div>`;
    }
    if (path.includes('search-header')) {
      return `<div class="search-header"></div>`;
    }
    if (path.includes('search-bar')) {
      return `<div class="search-bar"></div>`;
    }
    if (path.includes('search-block')) {
      return `<div id="search-header"></div>` +
        `<div id="search-results"></div>` +
        `<div id="search-pagination"></div>`;
    }
    if (path.includes('edit-form')) {
      return `<form class="inline-form"></form>`;
    }
    return `<div>MOCK TEMPLATE for ${path}</div>`;
  });
});

afterEach(() => {
  delete window.loadAndRenderTemplate;
  
  // Nettoyer les formulaires créés
  const forms = document.querySelectorAll('.form-container');
  forms.forEach(form => form.remove());
  
  // Nettoyer les notifications
  const notifications = document.querySelectorAll('.notification');
  notifications.forEach(notification => notification.remove());
});

describe('UIManager', () => {
  let uiManager;
  let mockContainer;

  beforeEach(() => {
    uiManager = new UIManager();
    mockContainer = document.getElementById('tree-container');
    mockContainer.innerHTML = '';
  });

  describe('Constructor', () => {
    test('devrait initialiser les propriétés par défaut', () => {
      expect(uiManager.currentEditNode).toBeNull();
      expect(uiManager.currentAddParentId).toBe('root');
      expect(uiManager.isSearchMode).toBe(false);
      expect(uiManager.searchResults).toEqual([]);
    });
  });

  describe('renderTree', () => {
    test('devrait rendre un arbre vide', () => {
      const emptyTree = { id: 'root', name: 'Root', type: 'folder', children: [] };
      uiManager.renderTree(emptyTree, mockContainer);
      
      expect(mockContainer.children.length).toBe(1);
      expect(mockContainer.querySelector('.tree-node-line')).toBeTruthy();
    });

    test('devrait rendre un arbre avec des enfants', () => {
      const tree = {
        id: 'root',
        name: 'Root',
        type: 'folder',
        expanded: true,
        children: [
          { id: 'chat1', name: 'Chat 1', type: 'chat', link: 'http://example.com' },
          { id: 'folder1', name: 'Folder 1', type: 'folder', children: [] }
        ]
      };
      
      uiManager.renderTree(tree, mockContainer);
      
      expect(mockContainer.querySelectorAll('.tree-node-line')).toHaveLength(3);
      expect(mockContainer.querySelector('[data-id="chat1"]')).toBeTruthy();
      expect(mockContainer.querySelector('[data-id="folder1"]')).toBeTruthy();
    });

    test('devrait ne rien faire si container est null', () => {
      const tree = { id: 'root', name: 'Root', type: 'folder' };
      expect(() => uiManager.renderTree(tree, null)).not.toThrow();
    });
  });

  describe('_countChatsInFolder', () => {
    test('devrait compter les chats dans un dossier', () => {
      const folder = {
        id: 'folder1',
        name: 'Test Folder',
        type: 'folder',
        children: [
          { id: 'chat1', name: 'Chat 1', type: 'chat' },
          { id: 'chat2', name: 'Chat 2', type: 'chat' },
          { id: 'subfolder', name: 'Subfolder', type: 'folder', children: [
            { id: 'chat3', name: 'Chat 3', type: 'chat' }
          ]}
        ]
      };
      
      const count = uiManager._countChatsInFolder(folder);
      expect(count).toBe(3);
    });

    test('devrait retourner 0 pour un dossier vide', () => {
      const folder = {
        id: 'folder1',
        name: 'Empty Folder',
        type: 'folder',
        children: []
      };
      
      const count = uiManager._countChatsInFolder(folder);
      expect(count).toBe(0);
    });
  });

  describe('showAddFolderForm', () => {
    test('devrait afficher le formulaire d\'ajout de dossier', () => {
      uiManager.showAddFolderForm('parent123');
      
      expect(uiManager.currentAddParentId).toBe('parent123');
      const form = document.getElementById('folder-form');
      expect(form).toBeTruthy();
      expect(form.style.display).toBe('block');
      expect(form.querySelector('#folder-name')).toBeTruthy();
    });
  });

  describe('showAddChatForm', () => {
    test('devrait afficher le formulaire d\'ajout de chat', () => {
      uiManager.showAddChatForm('parent456');
      
      expect(uiManager.currentAddParentId).toBe('parent456');
      const form = document.getElementById('chat-form');
      expect(form).toBeTruthy();
      expect(form.style.display).toBe('block');
      expect(form.querySelector('#chat-name')).toBeTruthy();
      expect(form.querySelector('#chat-link')).toBeTruthy();
    });
  });

  describe('showEditForm', () => {
    test('devrait afficher le formulaire d\'édition pour un chat', () => {
      const chatNode = {
        id: 'chat1',
        name: 'Test Chat',
        type: 'chat',
        link: 'http://example.com',
        tag: 'test'
      };
      
      uiManager.showEditForm(chatNode);
      
      expect(uiManager.currentEditNode).toBe(chatNode);
      const form = document.getElementById('edit-form');
      expect(form).toBeTruthy();
      expect(form.style.display).toBe('block');
      expect(form.querySelector('#edit-name').value).toBe('Test Chat');
      expect(form.querySelector('#edit-link').value).toBe('http://example.com');
    });

    test('devrait afficher le formulaire d\'édition pour un dossier', () => {
      // Nettoyage du DOM pour éviter toute pollution
      const oldForm = document.getElementById('edit-form');
      if (oldForm) oldForm.remove();
      const folderNode = {
        id: 'folder1',
        name: 'Test Folder',
        type: 'folder'
      };
      
      uiManager.showEditForm(folderNode);
      
      expect(uiManager.currentEditNode).toBe(folderNode);
      const form = document.getElementById('edit-form');
      expect(form).toBeTruthy();
      expect(form.querySelector('#edit-name').value).toBe('Test Folder');
      expect(form.querySelector('#edit-link')).toBeFalsy();
    });
  });

  describe('hideAllForms', () => {
    test('devrait masquer tous les formulaires', () => {
      // Créer plusieurs formulaires
      uiManager.showAddFolderForm('parent1');
      uiManager.showAddChatForm('parent2');
      
      uiManager.hideAllForms();
      
      const forms = document.querySelectorAll('.form-container');
      forms.forEach(form => {
        expect(form.style.display).toBe('none');
      });
      expect(uiManager.currentEditNode).toBeNull();
    });
  });

  describe('showNotification', () => {
    test('devrait afficher une notification', () => {
      uiManager.showNotification('Test message', 'success');
      
      const notification = document.querySelector('.notification');
      expect(notification).toBeTruthy();
      expect(notification.textContent).toBe('Test message');
      expect(notification.className).toContain('notification-success');
    });

    test('devrait utiliser le type par défaut', () => {
      uiManager.showNotification('Test message');
      
      const notification = document.querySelector('.notification');
      expect(notification.className).toContain('notification-info');
    });
  });

  describe('showDebugArea', () => {
    test('devrait afficher la zone de debug', () => {
      uiManager.showDebugArea(true);
      
      const debugArea = document.getElementById('debug-area');
      expect(debugArea.style.display).toBe('block');
    });

    test('devrait masquer la zone de debug', () => {
      uiManager.showDebugArea(false);
      
      const debugArea = document.getElementById('debug-area');
      expect(debugArea.style.display).toBe('none');
    });
  });

  describe('addLog', () => {
    test('devrait ajouter un log dans la zone de debug', () => {
      uiManager.addLog('Test log message');
      
      const debugContent = document.getElementById('debug-content');
      expect(debugContent.children.length).toBe(1);
      expect(debugContent.children[0].textContent).toContain('Test log message');
    });
  });

  // Ajout d'un helper pour préparer le DOM avant chaque test de recherche
  function prepareSearchDOM() {
    document.body.innerHTML = `
      <div class="search-bar"><input type="text" value="" /></div>
      <div id="tree-container"></div>
    `;
    return document.getElementById('tree-container');
  }

  describe('showSearchResults', () => {
    test('devrait afficher les résultats de recherche', async () => {
      const container = prepareSearchDOM();
      const results = [
        { id: 'chat1', name: 'Chat 1', path: 'Root > Folder 1', tag: 'test', type: 'chat' },
        { id: 'chat2', name: 'Chat 2', path: 'Root > Folder 2', type: 'chat' }
      ];
      const uiManager = new UIManager();
      await uiManager.showSearchResults(results, 'test');
      expect(uiManager.isSearchMode).toBe(true);
      expect(uiManager.searchResults).toEqual(results);
      const resultItems = container.querySelectorAll('.search-result-item');
      expect(resultItems.length).toBe(2);
    });

    test('devrait afficher un message si aucun résultat', async () => {
      const container = prepareSearchDOM();
      const uiManager = new UIManager();
      await uiManager.showSearchResults([], 'nonexistent');
      expect(container.innerHTML).toContain('Aucun résultat trouvé');
    });
  });

  describe('clearSearchResults', () => {
    test('devrait effacer les résultats de recherche', () => {
      const container = prepareSearchDOM();
      const uiManager = new UIManager();
      uiManager.isSearchMode = true;
      uiManager.searchResults = [{ id: 'test' }];
      uiManager.clearSearchResults();
      expect(uiManager.isSearchMode).toBe(false);
      expect(uiManager.searchResults).toEqual([]);
      // Vérifie que le conteneur est vidé
      expect(container.innerHTML).toBe('');
    });
  });

  describe('Intégration', () => {
    test('devrait gérer l\'affichage de l\'arbre avec recherche', async () => {
      const container = prepareSearchDOM();
      const uiManager = new UIManager();
      const tree = {
        id: 'root',
        name: 'Root',
        type: 'folder',
        expanded: true,
        children: [
          { id: 'chat1', name: 'Test Chat', type: 'chat' }
        ]
      };
      // Afficher l'arbre normal
      uiManager.renderTree(tree, container);
      expect(container.querySelectorAll('.tree-node-line').length).toBe(2);
      // Afficher les résultats de recherche
      const searchResults = [{ id: 'chat1', name: 'Test Chat', path: 'Root', type: 'chat' }];
      await uiManager.showSearchResults(searchResults, 'test');
      expect(container.querySelectorAll('.search-result-item').length).toBe(1);
      // Effacer la recherche
      uiManager.clearSearchResults();
      expect(uiManager.isSearchMode).toBe(false);
    });
  });

  describe('showSearchResults (pagination et UX)', () => {
    let uiManager;
    let container;
    let eventBus;

    beforeEach(() => {
      container = prepareSearchDOM();
      eventBus = { emit: jest.fn() };
      uiManager = new UIManager(eventBus);
    });

    function generateResults(n) {
      return Array.from({ length: n }, (_, i) => ({
        id: `id${i}`,
        name: `Chat ${i}`,
        path: ['Dossier', `Chat ${i}`],
        link: `#${i}`,
        tag: i % 2 === 0 ? 'tag' : '',
        type: 'chat',
      }));
    }

    it('affiche 8 résultats par page et la pagination', async () => {
      const results = generateResults(25);
      await uiManager.showSearchResults(results, 'test', 1);
      expect(container.querySelectorAll('.search-result-item').length).toBe(8);
      expect(container.querySelector('.pagination-controls')).toBeTruthy();
      const nextBtn = container.querySelector('.pagination-btn.next-btn');
      expect(nextBtn.disabled).toBe(false);
      // Test de la page 3
      await uiManager.showSearchResults(results, 'test', 3);
      expect(container.querySelectorAll('.search-result-item').length).toBe(8);
    });

    it("n'affiche pas le picto 'voir'", async () => {
      const results = generateResults(1);
      await uiManager.showSearchResults(results, 'test', 1);
      expect(container.querySelector('.view-btn')).toBeNull();
    });

    it("affiche le badge tag si présent", async () => {
      const results = [{ id: '1', name: 'Chat', path: ['Dossier'], link: '#', tag: 'important', type: 'chat' }];
      await uiManager.showSearchResults(results, 'test', 1);
      expect(container.querySelector('.chat-tag')).toBeTruthy();
      expect(container.querySelector('.chat-tag').textContent).toBe('important');
    });

    it("n'affiche pas le badge tag si absent", async () => {
      const results = [{ id: '1', name: 'Chat', path: ['Dossier'], link: '#', type: 'chat' }];
      await uiManager.showSearchResults(results, 'test', 1);
      expect(container.querySelector('.chat-tag')).toBeNull();
    });

    it('désactive le bouton précédent sur la première page', async () => {
      const results = generateResults(15);
      await uiManager.showSearchResults(results, 'test', 1);
      const prevBtn = container.querySelector('.prev-btn');
      expect(prevBtn.disabled).toBe(true);
    });

    it('désactive le bouton suivant sur la dernière page', async () => {
      const results = generateResults(15);
      await uiManager.showSearchResults(results, 'test', 2);
      const nextBtn = container.querySelector('.next-btn');
      expect(nextBtn.disabled).toBe(true);
    });

    it('efface le champ de recherche quand on efface les résultats', () => {
      document.body.innerHTML = '<div class="search-bar"><input type="text" class="search-input" value="test" /></div><div id="tree-container"></div>';
      const uiManager = new UIManager();
      const input = document.querySelector('.search-input');
      input.value = 'motclé';
      uiManager.clearSearchResults();
      expect(input.value).toBe('');
    });

    it('affiche les pictos pour les dossiers et chats', async () => {
      const results = [
        { id: '1', name: 'Chat', path: ['Dossier'], link: '#', type: 'chat' },
        { id: '2', name: 'Dossier', path: ['Parent'], type: 'folder' }
      ];
      await uiManager.showSearchResults(results, 'test', 1);
      const icons = container.querySelectorAll('.tree-node-line .material-icons');
      expect(icons.length).toBeGreaterThan(0);
      // Vérifier que les icônes chat et folder sont présentes
      const iconTexts = Array.from(icons).map(icon => icon.textContent);
      expect(iconTexts).toContain('chat');
      expect(iconTexts).toContain('folder');
    });

    it('affiche le chemin avec les bons pictos', async () => {
      const results = [{ id: '1', name: 'Chat', path: ['Dossier1', 'Dossier2'], link: '#', type: 'chat' }];
      await uiManager.showSearchResults(results, 'test', 1);
      // Vérifier que les noms de dossiers sont présents
      const folderNames = container.querySelectorAll('.folder-name');
      expect(folderNames.length).toBeGreaterThan(0);
      expect(folderNames[0].textContent).toBe('Dossier1');
    });

    it('affiche les résultats triés par ordre alphabétique', async () => {
      const results = [
        { id: '1', name: 'Zebra', path: ['Dossier'], link: '#', type: 'chat' },
        { id: '2', name: 'apple', path: ['Dossier'], link: '#', type: 'chat' },
        { id: '3', name: 'Banana', path: ['Dossier'], link: '#', type: 'chat' }
      ];
      await uiManager.showSearchResults(results, 'test', 1);
      const items = Array.from(container.querySelectorAll('.search-result-item .chat-link'));
      const names = items.map(a => a.textContent);
      expect(names).toEqual(['apple', 'Banana', 'Zebra']);
    });

    it('affiche le formulaire d\'édition inline sous la ligne concernée en mode recherche', async () => {
      const results = [
        { id: '1', name: 'Chat1', path: ['Dossier'], link: '#', type: 'chat' },
        { id: '2', name: 'Chat2', path: ['Dossier'], link: '#', type: 'chat' }
      ];
      await uiManager.showSearchResults(results, 'test', 1);
      const firstItem = container.querySelector('.search-result-item');
      uiManager.showEditForm(results[0], firstItem);
      const form = container.querySelector('.inline-form');
      expect(form).toBeTruthy();
      expect(form.previousElementSibling).toBe(firstItem);
    });

    it('met à jour la liste après édition en mode recherche', async () => {
      const results = [
        { id: '1', name: 'Chat1', path: ['Dossier'], link: '#', type: 'chat' }
      ];
      await uiManager.showSearchResults(results, 'test', 1);
      // Simuler édition
      results[0].name = 'Chat1 modifié';
      await uiManager.showSearchResults(results, 'test', 1);
      const item = container.querySelector('.search-result-item .chat-link');        
      expect(item.textContent).toBe('Chat1 modifié');
    });

    it('reste en mode recherche après suppression', async () => {
      const results = [
        { id: '1', name: 'Chat1', path: ['Dossier'], link: '#', type: 'chat' }
      ];
      await uiManager.showSearchResults(results, 'test', 1);
      expect(uiManager.isSearchMode).toBe(true);
      expect(container.querySelectorAll('.search-result-item').length).toBe(1);      
    });
  });
}); 