// utils/templates.js
// Fonctions utilitaires pour générer les templates HTML réutilisables (popup & version étendue)

/**
 * Génère le HTML pour un résultat de recherche (même design que la version étendue)
 * @param {Object} result - Un objet résultat (chat ou dossier)
 * @param {Object} [options] - Options d'affichage (ex: modePopup)
 * @returns {string}
 */
function renderSearchResultItem(result, options = {}) {
  // Construction du chemin avec pictos dossiers et séparateurs (même style que l'arbre)
  let pathHtml = '';
  if (Array.isArray(result.path) && result.path.length > 1) {
    for (let i = 0; i < result.path.length - 1; i++) {
      const folderIcon = i === 0 ? 'home' : 'folder';
      pathHtml += `<span class="material-icons" aria-hidden="true">${folderIcon}</span><span class="folder-name">${result.path[i]}</span><span class="path-separator"> &gt; </span>`;
    }
  }
  
  // Nom du résultat (dossier ou chat) - même structure que l'arbre
  let nameHtml = '';
  if (result.type === 'chat') {
    nameHtml = `<span class="material-icons" aria-hidden="true">chat</span><a href="${result.link}" class="chat-link" target="_blank" aria-label="Ouvrir le chat '${result.name}'">${result.name}</a>`;
  } else {
    nameHtml = `<span class="material-icons" aria-hidden="true">folder</span><span class="folder-name">${result.name}</span>`;
  }
  
  // Tag si présent (même style que l'arbre)
  const tagHtml = result.tag ? `<span class="chat-tag" aria-label="Tag: ${result.tag}">${result.tag}</span>` : '';
  
  // Actions (édition, suppression) - même structure que l'arbre
  const actionsHtml = `
    <div class="edit-btns">
      <span class="material-icons" data-action="editNode" data-id="${result.id}" title="Modifier" aria-label="Modifier">edit</span>
      <span class="material-icons" data-action="deleteNode" data-id="${result.id}" title="Supprimer" aria-label="Supprimer">delete</span>
    </div>
  `;
  
  return `
    <div class="tree-node-line search-result" data-id="${result.id}" tabindex="0">
      ${pathHtml}${nameHtml}${tagHtml}${actionsHtml}
    </div>
  `;
}

/**
 * Génère le HTML pour la liste des résultats de recherche
 * @param {Array} results - Liste des résultats
 * @param {Object} [options] - Options d'affichage (ex: modePopup)
 * @returns {string}
 */
function renderSearchResults(results, options = {}) {
  if (!results || results.length === 0) {
    return `<div class="search-no-result">Aucun résultat</div>`;
  }
  return results.map(r => renderSearchResultItem(r, options)).join('');
}

/**
 * Génère le formulaire d'ajout de chat (version étendue ou popup)
 * @param {Array} dossiers - Liste des dossiers pour le select (optionnel)
 * @param {Object} [options] - Options d'affichage (ex: modePopup)
 * @returns {string}
 */
function renderAddChatForm(dossiers = [], options = {}) {
  // Si modePopup, on affiche un select pour choisir le dossier
  const dossierSelect = options.modePopup ? `
    <label for="chat-folder">Dossier :</label>
    <select id="chat-folder" name="chat-folder" required>
      ${dossiers.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
    </select>
    <button type="button" id="add-folder-btn">+ Nouveau dossier</button>
  ` : '';
  return `
    <form id="add-chat-form">
      <label for="chat-name">Nom du chat :</label>
      <input type="text" id="chat-name" name="chat-name" required />
      <label for="chat-link">Lien du chat :</label>
      <input type="url" id="chat-link" name="chat-link" required />
      ${dossierSelect}
      <button type="submit" class="btn-green">Ajouter</button>
      <button type="button" id="cancel-add-chat">Annuler</button>
    </form>
  `;
}

// Export pour Node/Jest et navigateur
if (typeof module !== 'undefined') {
  module.exports = {
    renderSearchResultItem,
    renderSearchResults,
    renderAddChatForm
  };
} else {
  window.Templates = {
    renderSearchResultItem,
    renderSearchResults,
    renderAddChatForm
  };
} 