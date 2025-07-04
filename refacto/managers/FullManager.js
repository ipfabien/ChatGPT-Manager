// FullManager - gestionnaire principal
export class FullManager {
  constructor() {}
}

// Exposer globalement pour le navigateur
window.FullManager = FullManager;

// Exportation pour les tests Jest
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FullManager;
} 