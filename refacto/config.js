// config.js
// Fichier de configuration global de l'extension

(function() {
  var config = {
    DEBUG: true, // Active les logs et outils de debug
    // D'autres options pourront être ajoutées ici (ex: API_URL, THEME, etc.)
  };

  if (typeof module !== 'undefined') {
    module.exports = config; // Pour Jest ou Node
  } else {
    window.CONFIG = config; // Pour le navigateur
  }
})(); 