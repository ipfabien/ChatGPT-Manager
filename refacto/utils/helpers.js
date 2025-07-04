// Fonctions utilitaires diverses 

/**
 * Charge un template HTML depuis un fichier et remplace les placeholders {{...}} par les valeurs fournies.
 * @param {string} path - Chemin du fichier template
 * @param {Object} data - Données à injecter
 * @returns {Promise<string>} - HTML généré
 */
async function loadAndRenderTemplate(path, data = {}) {
  const response = await fetch(path);
  let template = await response.text();
  // Remplacement simple des {{key}}
  for (const key in data) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(regex, data[key]);
  }
  return template;
}

window.loadAndRenderTemplate = loadAndRenderTemplate;

// Fonction de log centralisée à utiliser partout dans le projet. Supprimer toutes les autres définitions locales de debugLog.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = factory();
  } else {
    // Navigateur/global
    root.debugLog = factory().debugLog;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  function debugLog(...args) {
    if (typeof window !== 'undefined' && window.__DEBUG__ !== false) {
      console.log('[DEBUG]', ...args);
    }
  }
  return { debugLog };
})); 