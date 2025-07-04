const SearchEngine = require('../services/SearchEngine');

describe('SearchEngine', () => {
  let engine;
  let mockTree;

  beforeEach(() => {
    engine = new SearchEngine();
    mockTree = {
      id: 'root',
      name: 'Accueil',
      type: 'folder',
      children: [
        {
          id: 'f1',
          name: 'Dossier1',
          type: 'folder',
          children: [
            { id: 'c1', name: 'Chat1', type: 'chat', link: 'http://example.com/1', tag: 'important' },
            { id: 'c2', name: 'Chat2', type: 'chat', link: 'http://example.com/2' }
          ]
        },
        {
          id: 'f2',
          name: 'Dossier2',
          type: 'folder',
          children: [
            { id: 'c3', name: 'Chat3', type: 'chat', link: 'http://example.com/3', tag: 'urgent' }
          ]
        }
      ]
    };
  });

  test('buildIndex crée l\'index de recherche', () => {
    engine.buildIndex(mockTree);
    expect(engine.searchIndex).toHaveLength(3);
    expect(engine.searchIndex[0].name).toBe('Chat1');
    expect(engine.searchIndex[0].path).toEqual(['Accueil', 'Dossier1', 'Chat1']);
  });

  test('search trouve les chats par nom', () => {
    engine.buildIndex(mockTree);
    const results = engine.search('Chat1');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Chat1');
  });

  test('search trouve les chats par tag', () => {
    engine.buildIndex(mockTree);
    const results = engine.search('important');
    expect(results).toHaveLength(1);
    expect(results[0].tag).toBe('important');
  });

  test('search ne trouve rien si requête trop courte', () => {
    engine.buildIndex(mockTree);
    const results = engine.search('a');
    expect(results).toHaveLength(0);
  });

  test('search est insensible à la casse', () => {
    engine.buildIndex(mockTree);
    const results = engine.search('CHAT1');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Chat1');
  });

  test('clearSearch efface l\'état de recherche', () => {
    engine.isSearchMode = true;
    engine.currentSearchQuery = 'test';
    engine.clearSearch();
    expect(engine.isSearchMode).toBe(false);
    expect(engine.currentSearchQuery).toBe('');
  });

  test('getSearchState retourne l\'état correct', () => {
    engine.buildIndex(mockTree);
    engine.isSearchMode = true;
    engine.currentSearchQuery = 'test';
    const state = engine.getSearchState();
    expect(state.isSearchMode).toBe(true);
    expect(state.currentQuery).toBe('test');
    expect(state.hasIndex).toBe(true);
  });
}); 