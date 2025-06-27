// Service Worker pour ChatGPT Manager
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Obtenir les informations sur l'onglet actuel
    const currentTab = await chrome.tabs.get(tab.id);
    
    // Obtenir les informations sur la fenêtre de l'onglet
    const currentWindow = await chrome.windows.get(currentTab.windowId);
    
    // Calculer la position centrée sur l'écran actuel
    const left = Math.round(currentWindow.left + (currentWindow.width - 800) / 2);
    const top = Math.round(currentWindow.top + (currentWindow.height - 600) / 2);
    
    // Ouvrir une fenêtre de 800x600 centrée sur l'écran actuel
    chrome.windows.create({
      url: 'popup.html',
      type: 'popup',
      width: 800,
      height: 600,
      left: left,
      top: top
    });
  } catch (error) {
    console.error('Erreur lors de l\'ouverture de la fenêtre:', error);
    // Fallback : ouvrir avec des coordonnées par défaut
    chrome.windows.create({
      url: 'popup.html',
      type: 'popup',
      width: 800,
      height: 600,
      left: 100,
      top: 100
    });
  }
}); 