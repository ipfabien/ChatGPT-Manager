// Ce fichier est exécuté avant chaque test pour désactiver les logs (console.log, etc.)
// Cela évite la pollution de la sortie des tests.

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  if (typeof window !== 'undefined') {
    window.__DEBUG__ = false;
  }
});

afterAll(() => {
  console.log.mockRestore();
  console.warn.mockRestore();
  console.error.mockRestore();
  if (typeof window !== 'undefined') {
    window.__DEBUG__ = true;
  }
}); 