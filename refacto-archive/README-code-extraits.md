# README-code-extraits.md

Ce dossier contient les extraits de code et modules JS issus de la refonte précédente, à réutiliser lors de la nouvelle refacto à partir de la branche main.

## Fichiers archivés

- **TreeManager.js** : gestion de l'arborescence, rendu DOM, actions sur les nœuds, formulaires inline, centralisation des états temporaires.
- **FullManager.js** : gestionnaire principal, coordination des modules, initialisation.
- **UIManager.js** : gestion des notifications, feedback utilisateur, mise à jour de l'UI globale.
- **full.js** : script d'entrée, gestion centralisée des événements, délégation sur le container, intégration avec FullManager.
- **EventBus.js** : bus d'événements custom pour la communication inter-modules.
- **StorageManager.js** : gestion du stockage local (localStorage, etc.).
- **SearchEngine.js** : moteur de recherche dans l'arborescence.

## Utilisation recommandée

- Utiliser ces fichiers comme base pour réintégrer progressivement les fonctionnalités dans la nouvelle refacto.
- Comparer chaque méthode/structure avec la version main pour éviter les régressions.
- S'inspirer des patterns de centralisation, modularité, et gestion des formulaires inline.
- Adapter le code si besoin pour coller à la structure cible décrite dans ARCHITECTURE.md.

## Astuce

- Ne pas copier/coller aveuglément : toujours valider le comportement par rapport à la version validée 1.2.7.
- Documenter chaque adaptation dans ce README si besoin. 