const { renderSearchResultItem, renderSearchResults, renderAddChatForm } = require('../../utils/templates');

describe('Templates utilitaires', () => {
  test('renderSearchResultItem génère le bon HTML pour un chat', () => {
    const result = { id: '1', name: 'Chat 1', type: 'chat', link: '#', tag: 'demo' };
    const html = renderSearchResultItem(result);
    expect(html).toContain('Chat 1');
    expect(html).toContain('chat');
    expect(html).toContain('demo');
    expect(html).toContain('data-action="editNode"');
    expect(html).toContain('data-action="deleteNode"');
    expect(html).toContain('tree-node-line');
    expect(html).toContain('edit-btns');
  });

  test('renderSearchResults affiche "Aucun résultat" si vide', () => {
    const html = renderSearchResults([]);
    expect(html).toContain('Aucun résultat');
  });

  test('renderAddChatForm génère le formulaire avec select dossier en mode popup', () => {
    const dossiers = [ { id: 'root', name: 'Accueil' }, { id: 'd1', name: 'Projets' } ];
    const html = renderAddChatForm(dossiers, { modePopup: true });
    expect(html).toContain('<select');
    expect(html).toContain('Accueil');
    expect(html).toContain('Projets');
    expect(html).toContain('Ajouter');
  });

  test('renderAddChatForm génère le formulaire sans select dossier en mode étendu', () => {
    const html = renderAddChatForm([], { modePopup: false });
    expect(html).not.toContain('<select');
    expect(html).toContain('Ajouter');
  });
}); 