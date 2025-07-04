const TreeManager = require('../managers/TreeManager');

describe('TreeManager', () => {
  let manager;
  beforeEach(() => {
    manager = new TreeManager();
  });

  test('addNode ajoute un dossier à la racine', () => {
    const folder = { id: 'f1', name: 'Dossier', type: 'folder', children: [] };
    expect(manager.addNode('root', folder)).toBe(true);
    expect(manager.root.children[0]).toEqual(folder);
  });

  test('addNode ajoute un chat dans un dossier', () => {
    const folder = { id: 'f1', name: 'Dossier', type: 'folder', children: [] };
    manager.addNode('root', folder);
    const chat = { id: 'c1', name: 'Chat', type: 'chat' };
    expect(manager.addNode('f1', chat)).toBe(true);
    expect(folder.children[0]).toEqual(chat);
  });

  test('editNode modifie un noeud', () => {
    const folder = { id: 'f1', name: 'Dossier', type: 'folder', children: [] };
    manager.addNode('root', folder);
    expect(manager.editNode('f1', { name: 'Nouveau nom' })).toBe(true);
    expect(folder.name).toBe('Nouveau nom');
  });

  test('deleteNode supprime un noeud', () => {
    const folder = { id: 'f1', name: 'Dossier', type: 'folder', children: [] };
    manager.addNode('root', folder);
    expect(manager.deleteNode('f1')).toBe(true);
    expect(manager.root.children.length).toBe(0);
  });

  test('deleteNode ne supprime pas la racine', () => {
    expect(manager.deleteNode('root')).toBe(false);
  });

  test('moveNode déplace un chat dans un dossier', () => {
    const folder1 = { id: 'f1', name: 'Dossier1', type: 'folder', children: [] };
    const folder2 = { id: 'f2', name: 'Dossier2', type: 'folder', children: [] };
    const chat = { id: 'c1', name: 'Chat', type: 'chat' };
    manager.addNode('root', folder1);
    manager.addNode('root', folder2);
    manager.addNode('f1', chat);
    expect(manager.moveNode('c1', 'f2')).toBe(true);
    expect(folder2.children[0]).toEqual(chat);
    expect(folder1.children.length).toBe(0);
  });

  test('sortChildren trie dossiers et chats', () => {
    const children = [
      { id: 'c2', name: 'B', type: 'chat' },
      { id: 'f2', name: 'B', type: 'folder', children: [] },
      { id: 'c1', name: 'A', type: 'chat' },
      { id: 'f1', name: 'A', type: 'folder', children: [] },
    ];
    const sorted = manager.sortChildren(children);
    expect(sorted[0].id).toBe('f1');
    expect(sorted[1].id).toBe('f2');
    expect(sorted[2].id).toBe('c1');
    expect(sorted[3].id).toBe('c2');
  });

  test('countChatsInFolder compte les chats récursivement', () => {
    const folder = { id: 'f1', name: 'Dossier', type: 'folder', children: [
      { id: 'c1', name: 'Chat1', type: 'chat' },
      { id: 'sf1', name: 'Sous-dossier', type: 'folder', children: [
        { id: 'c2', name: 'Chat2', type: 'chat' }
      ]}
    ]};
    expect(manager.countChatsInFolder(folder)).toBe(2);
  });
}); 