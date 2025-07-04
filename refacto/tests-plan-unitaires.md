# Plan des tests unitaires pour la refacto JS (version étendue 1.3.0)

Ce document liste les modules et méthodes à tester en priorité, ainsi que les cas de test critiques à couvrir lors de la refacto.

---

## Modules et méthodes à tester en priorité

### 1. TreeManager
- addNode(parentId, node)
- deleteNode(nodeId)
- editNode(nodeId, data)
- moveNode(sourceId, targetId)
- sortChildren(children)
- countChatsInFolder(folder)
- findById(node, id)

### 2. SearchEngine
- buildIndex(tree)
- search(query)
- clearSearch()

### 3. StorageManager
- saveData(data)
- loadData()
- resetData()
- savePreferences(prefs)
- loadPreferences()

### 4. UIManager (logique métier uniquement)
- renderTree()
- showForm(type, node)
- hideForms()
- showNotification(message)

### 5. KeyboardManager
- handleNavigation(e)
- handleShortcuts(e)
- selectNode(nodeId)
- activateSelectedNode()

### 6. EventBus
- on(event, handler)
- off(event, handler)
- emit(event, data)

### 7. UserPreferences
- getPreferences()
- setPreferences(prefs)
- applyPreferences()

---

## Cas de test critiques à couvrir

### A. Drag & Drop (TreeManager, UIManager)
- Déplacement d'un chat/dossier dans un autre dossier
- Drag & drop interdit sur la racine ou sur un descendant de soi-même
- Feedback visuel lors du drag & drop
- Mise à jour correcte de l'arborescence et des données persistées

### B. Recherche (SearchEngine)
- Recherche avec différents types de requêtes (vide, partielle, complète, caractères spéciaux)
- Indexation correcte des chats et tags
- Affichage des résultats avec chemin complet
- Actions directes depuis les résultats (modifier, supprimer, naviguer)

### C. Sauvegarde et restauration (StorageManager)
- Sauvegarde automatique après chaque modification
- Chargement correct des données au démarrage
- Réinitialisation complète des données (reset)
- Gestion des erreurs de stockage

### D. Navigation et raccourcis clavier (KeyboardManager)
- Navigation dans l'arbre avec les flèches
- Activation/sélection d'un chat ou dossier
- Raccourcis clavier (Ctrl+N, Ctrl+Shift+N, Ctrl+F, Ctrl+E, Suppr)
- Focus et accessibilité

### E. Gestion des préférences utilisateur (UserPreferences)
- Sauvegarde et chargement des préférences (thème, taille de police)
- Application automatique des préférences

### F. Accessibilité et cas limites
- ARIA labels présents sur tous les éléments interactifs
- Navigation clavier possible partout
- Suppression récursive de dossiers avec sous-dossiers
- Gestion des erreurs (id inexistant, suppression racine, etc.)

---

Ce plan servira de base pour écrire les fichiers de tests unitaires (ex : TreeManager.test.js, SearchEngine.test.js, etc.) dans le dossier refacto/tests/. 