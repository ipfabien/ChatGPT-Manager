const UserPreferences = require('../services/UserPreferences');

describe('UserPreferences', () => {
  let prefs;
  let mockStorageManager;

  beforeEach(() => {
    mockStorageManager = {
      loadPreferences: jest.fn(),
      savePreferences: jest.fn()
    };
    prefs = new UserPreferences(mockStorageManager);
  });

  test('constructor initialise avec les préférences par défaut', () => {
    expect(prefs.getPreferences()).toEqual({
      theme: 'light',
      fontSize: 'normal'
    });
  });

  test('loadPreferences charge les préférences sauvegardées', async () => {
    const savedPrefs = { theme: 'dark', fontSize: 'large' };
    mockStorageManager.loadPreferences.mockResolvedValue(savedPrefs);
    
    const result = await prefs.loadPreferences();
    expect(result).toEqual(savedPrefs);
    expect(prefs.getPreferences()).toEqual(savedPrefs);
  });

  test('loadPreferences utilise les valeurs par défaut si pas de stockage', async () => {
    mockStorageManager.loadPreferences.mockResolvedValue(null);
    
    const result = await prefs.loadPreferences();
    expect(result).toEqual({
      theme: 'light',
      fontSize: 'normal'
    });
  });

  test('savePreferences sauvegarde les nouvelles préférences', async () => {
    const newPrefs = { theme: 'dark' };
    await prefs.savePreferences(newPrefs);
    
    expect(mockStorageManager.savePreferences).toHaveBeenCalledWith({
      theme: 'dark',
      fontSize: 'normal'
    });
  });

  test('setTheme valide et sauvegarde le thème', async () => {
    await prefs.setTheme('dark');
    expect(prefs.getPreferences().theme).toBe('dark');
    expect(mockStorageManager.savePreferences).toHaveBeenCalled();
  });

  test('setTheme rejette un thème invalide', async () => {
    await expect(prefs.setTheme('invalid')).rejects.toThrow('Thème invalide');
  });

  test('setFontSize valide et sauvegarde la taille', async () => {
    await prefs.setFontSize('large');
    expect(prefs.getPreferences().fontSize).toBe('large');
    expect(mockStorageManager.savePreferences).toHaveBeenCalled();
  });

  test('setFontSize rejette une taille invalide', async () => {
    await expect(prefs.setFontSize('invalid')).rejects.toThrow('Taille de police invalide');
  });

  test('resetPreferences remet les valeurs par défaut', async () => {
    prefs.currentPreferences = { theme: 'dark', fontSize: 'large' };
    await prefs.resetPreferences();
    
    expect(prefs.getPreferences()).toEqual({
      theme: 'light',
      fontSize: 'normal'
    });
  });

  test('fonctionne sans StorageManager', () => {
    const prefsWithoutStorage = new UserPreferences();
    expect(prefsWithoutStorage.getPreferences()).toEqual({
      theme: 'light',
      fontSize: 'normal'
    });
  });
}); 