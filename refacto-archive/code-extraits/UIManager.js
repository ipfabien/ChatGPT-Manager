/**
 * UIManager - Gestion de l'interface utilisateur
 */
export class UIManager {
  constructor() {
    this.isInitialized = false;
  }

  async init() {
    this.isInitialized = true;
    console.log('✅ UIManager initialisé');
  }

  /**
   * Afficher une notification
   */
  showNotification(message, type = 'info', duration = 3000) {
    console.log(`💬 Notification [${type}]: ${message}`);
    
    // Créer une notification simple
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 1000;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Supprimer après la durée spécifiée
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, duration);
  }

  /**
   * Mettre à jour le statut (placeholder)
   */
  updateStatus() {
    // Placeholder - sera implémenté plus tard
    console.log('📊 Statut mis à jour');
  }

  /**
   * Mettre à jour la sélection (placeholder)
   */
  updateSelection(nodeId) {
    console.log('🎯 Sélection mise à jour:', nodeId);
  }

  /**
   * Appliquer un thème
   */
  applyTheme(theme) {
    document.body.className = theme === 'dark' ? 'dark-mode' : 'light-mode';
    console.log('🎨 Thème appliqué:', theme);
  }

  /**
   * Sauvegarder les préférences utilisateur
   */
  async saveUserPreferences(prefs) {
    console.log('💾 Préférences sauvegardées:', prefs);
  }

  /**
   * Afficher les résultats de recherche
   */
  displaySearchResults(results) {
    console.log('🔍 Résultats affichés:', results.length);
  }

  /**
   * Obtenir l'état du gestionnaire
   */
  getState() {
    return {
      isInitialized: this.isInitialized
    };
  }

  /**
   * Nettoyer les ressources
   */
  destroy() {
    this.isInitialized = false;
    console.log('✅ UIManager détruit');
  }
} 