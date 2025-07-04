const StorageManager = require('../core/StorageManager');

describe('StorageManager', () => {
  let mockStorage, manager;

  beforeEach(() => {
    mockStorage = {
      set: jest.fn((obj, cb) => cb && cb()),
      get: jest.fn((keys, cb) => cb({ chatManagerData: { foo: 'bar' }, chatManagerPrefs: { theme: 'dark' } })),
      remove: jest.fn((keys, cb) => cb && cb()),
    };
    global.chrome = { runtime: {}, storage: { local: mockStorage } };
    manager = new StorageManager(mockStorage);
  });

  afterEach(() => {
    delete global.chrome;
  });

  test('saveData appelle storage.set', async () => {
    await expect(manager.saveData({ foo: 'bar' })).resolves.toBeUndefined();
    expect(mockStorage.set).toHaveBeenCalledWith({ chatManagerData: { foo: 'bar' } }, expect.any(Function));
  });

  test('loadData appelle storage.get et retourne les données', async () => {
    await expect(manager.loadData()).resolves.toEqual({ foo: 'bar' });
    expect(mockStorage.get).toHaveBeenCalledWith(["chatManagerData"], expect.any(Function));
  });

  test('resetData appelle storage.remove', async () => {
    await expect(manager.resetData()).resolves.toBeUndefined();
    expect(mockStorage.remove).toHaveBeenCalledWith(["chatManagerData"], expect.any(Function));
  });

  test('savePreferences appelle storage.set', async () => {
    await expect(manager.savePreferences({ theme: 'dark' })).resolves.toBeUndefined();
    expect(mockStorage.set).toHaveBeenCalledWith({ chatManagerPrefs: { theme: 'dark' } }, expect.any(Function));
  });

  test('loadPreferences appelle storage.get et retourne les prefs', async () => {
    await expect(manager.loadPreferences()).resolves.toEqual({ theme: 'dark' });
    expect(mockStorage.get).toHaveBeenCalledWith(["chatManagerPrefs"], expect.any(Function));
  });

  test('saveData échoue si storage non dispo', async () => {
    const m = new StorageManager(null);
    await expect(m.saveData({})).rejects.toMatch('Storage non disponible');
  });
}); 