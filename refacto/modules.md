# Détail des modules et fonctionnalités (v1.2.7)

Ce document liste les fonctionnalités de la version 1.2.7, organisées par modules pour la refonte POO.

## 1. UIManager (Gestion de l'interface)
- Affichage de l'arborescence des chats et dossiers
- Affichage dynamique (DOM) des dossiers/chats, badges, tags
- Affichage/masquage des formulaires (ajout/modif dossier/chat)
- Affichage des logs et de la zone de debug
- Gestion des thèmes (clair/sombre) et de la taille de police
- Affichage des notifications/messages d'information

## 2. TreeManager (Gestion de l'arborescence)
- Structure de données en arbre (dossiers/chats)
- Ajout, modification, suppression de dossiers et chats
- Drag & Drop pour réorganiser dossiers/chats
- Tri automatique (dossiers puis chats, ordre alphabétique)
- Compteur de chats par dossier (y compris sous-dossiers)
- Navigation rapide (tout ouvrir/tout fermer)

## 3. SearchEngine (Recherche)
- Barre de recherche avec indexation des noms de chats et tags
- Recherche en temps réel (avec debounce)
- Affichage des résultats avec chemin complet
- Actions directes depuis les résultats (modifier, supprimer, naviguer)

## 4. StorageManager (Stockage)
- Sauvegarde automatique des données dans chrome.storage.local
- Chargement des données au démarrage
- Réinitialisation complète des données (bouton Reset)

## 5. KeyboardManager (Navigation et raccourcis clavier)
- Navigation dans l'arbre avec les flèches
- Tab/Shift+Tab pour naviguer entre éléments interactifs
- Raccourcis :
  - Ctrl+N : Nouveau chat
  - Ctrl+Shift+N : Nouveau dossier
  - Ctrl+F : Recherche
  - Ctrl+E : Modifier
  - Suppr : Supprimer
- Focus styles et accessibilité (ARIA labels)

## 6. EventBus (Gestion des événements)
- Communication entre modules (UI, Tree, Storage, etc.)
- Gestion des événements personnalisés (drag, update, etc.)

## 7. Debug/Logs
- Zone de debug affichant les logs d'activité (drag & drop, structure, etc.)
- Affichage/masquage des logs (bouton Logs)

## 8. UserPreferences
- Sauvegarde et chargement des préférences utilisateur (thème, taille de police)
- Application automatique des préférences au chargement

## 9. Accessibilité
- ARIA labels pour tous les éléments interactifs
- Contrastes adaptés, navigation clavier, support lecteurs d'écran

---

Chaque module ci-dessus correspondra à une classe/service dans la refacto POO. Les fonctionnalités seront testées unitairement et intégrées progressivement dans la nouvelle architecture.

Pour chaque module, un mapping précis des méthodes/fonctions sera fait lors de la migration. 