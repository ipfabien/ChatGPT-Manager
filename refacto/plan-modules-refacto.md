# Plan détaillé de refacto JS (version étendue 1.3.0)

Ce document synthétise l'analyse du code de la popup 1.2.7 pour préparer la refacto POO de la version étendue 1.3.0.

---

## 1. Découpage en modules (classes/services)

### UIManager
- **Rôle** : Gestion de l'affichage, interactions utilisateur, DOM, notifications, thèmes, formulaires.
- **Méthodes attendues** :
  - renderTree()
  - renderNode(node, level)
  - showForm(type, node)
  - hideForms()
  - updateTheme(theme)
  - updateFontSize(size)
  - showNotification(message)
  - showDebugArea()
  - showLogs()
- **Interactions** :
  - Appelle TreeManager pour obtenir/mettre à jour l'arborescence
  - Écoute EventBus pour les changements de données, thèmes, etc.
  - Utilise StorageManager pour charger/sauver préférences UI
- **Cas particuliers** :
  - Accessibilité (ARIA, focus, contrastes)
  - Affichage dynamique selon le mode (popup/étendu)

### TreeManager
- **Rôle** : Gestion de la structure de données (arbre dossiers/chats), opérations CRUD, drag & drop, tri.
- **Méthodes attendues** :
  - addNode(parentId, node)
  - deleteNode(nodeId)
  - editNode(nodeId, data)
  - moveNode(sourceId, targetId)
  - sortChildren(children)
  - countChatsInFolder(folder)
  - findById(node, id)
- **Interactions** :
  - Notifie UIManager via EventBus après modification
  - Utilise StorageManager pour persister l'arbre
  - Utilise EventBus pour drag & drop
- **Cas particuliers** :
  - Suppression récursive de dossiers
  - Drag & drop sécurisé (pas de cycles, racine non déplaçable)

### SearchEngine
- **Rôle** : Indexation et recherche dans les noms de chats/tags, gestion des résultats, actions rapides.
- **Méthodes attendues** :
  - buildIndex(tree)
  - search(query)
  - clearSearch()
  - displayResults(results)
- **Interactions** :
  - Utilise TreeManager pour accéder à l'arbre
  - Notifie UIManager pour affichage des résultats
- **Cas particuliers** :
  - Debounce sur la recherche
  - Recherche à partir de 2 caractères

### StorageManager
- **Rôle** : Persistance des données (arbre, préférences) dans chrome.storage.local.
- **Méthodes attendues** :
  - saveData(data)
  - loadData()
  - resetData()
  - savePreferences(prefs)
  - loadPreferences()
- **Interactions** :
  - Utilisé par TreeManager, UIManager, UserPreferences
  - Notifie via EventBus après chargement/sauvegarde
- **Cas particuliers** :
  - Gestion des erreurs de stockage

### KeyboardManager
- **Rôle** : Navigation et raccourcis clavier dans l'arbre et l'UI.
- **Méthodes attendues** :
  - handleNavigation(e)
  - handleShortcuts(e)
  - selectNode(nodeId)
  - activateSelectedNode()
- **Interactions** :
  - Notifie UIManager pour focus/activation
  - Utilise TreeManager pour navigation logique
- **Cas particuliers** :
  - Accessibilité, gestion du focus, raccourcis contextuels

### EventBus
- **Rôle** : Bus d'événements pour la communication inter-modules.
- **Méthodes attendues** :
  - on(event, handler)
  - off(event, handler)
  - emit(event, data)
- **Interactions** :
  - Utilisé par tous les modules pour la synchro
- **Cas particuliers** :
  - Gestion des abonnements/désabonnements

### UserPreferences
- **Rôle** : Gestion des préférences utilisateur (thème, taille de police).
- **Méthodes attendues** :
  - getPreferences()
  - setPreferences(prefs)
  - applyPreferences()
- **Interactions** :
  - Utilise StorageManager pour persister
  - Notifie UIManager pour appliquer

### Debug/Logs
- **Rôle** : Gestion de la zone de debug et des logs d'activité.
- **Méthodes attendues** :
  - addLog(message)
  - showLogs()
  - clearLogs()
- **Interactions** :
  - Utilisé par TreeManager, UIManager, etc.

---

## 2. Interactions entre modules
- UIManager ↔ TreeManager : affichage, édition, suppression, drag & drop
- UIManager ↔ SearchEngine : recherche, affichage des résultats
- TreeManager ↔ StorageManager : persistance de l'arbre
- UIManager, TreeManager, SearchEngine, StorageManager ↔ EventBus : synchro des actions
- UIManager ↔ UserPreferences : application des préférences
- Tous modules ↔ Debug/Logs : journalisation des actions

---

## 3. Cas particuliers et accessibilité
- **Accessibilité** : ARIA labels, navigation clavier, contrastes, focus visible
- **Drag & drop** : gestion des zones valides, feedback visuel, sécurité
- **Suppression** : confirmation, suppression récursive, gestion des erreurs
- **Recherche** : debounce, résultats interactifs, navigation au clavier
- **Stockage** : gestion des erreurs, reset, persistance immédiate

---

## 4. Points d'entrée JS (bootstrap)
- Un point d'entrée principal pour la version étendue (ex : `full.js` ou `main.js`)
- Initialisation des modules, branchement des événements, chargement des données et préférences

---

## 5. À faire lors de la refacto
- Pour chaque module, détailler les signatures des méthodes et les cas de test unitaires à prévoir
- Adapter le découpage si besoin lors de la migration concrète
- Documenter les interactions et les cas particuliers dans le code et la doc technique 