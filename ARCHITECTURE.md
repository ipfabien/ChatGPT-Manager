# ARCHITECTURE.md

## Principes d'architecture pour la refonte

- **POO JavaScript** : Utiliser des classes pour chaque composant principal (TreeManager, FullManager, UIManager, etc.).
- **Séparation des responsabilités** :
  - TreeManager : gestion de l'arborescence (données, rendu, actions sur les nœuds)
  - FullManager : coordination générale, initialisation, gestion des modules
  - UIManager : notifications, feedback utilisateur, gestion des états UI globaux
  - EventBus : communication entre modules via événements
- **Centralisation des événements** :
  - Un seul listener sur le container de l'arborescence pour toutes les actions (add, edit, delete, toggle, etc.)
  - Plus d'onclick inline
- **Structure DOM conforme au design validé** :
  - Utilisation de <ul>/<li> imbriqués pour l'arborescence
  - Icônes Material (span.material-icons) pour toutes les actions et types
  - Formulaires inline pour création/édition
  - Compteurs, tags, attributs ARIA pour l'accessibilité

## Conventions de nommage

- **Classes JS** : PascalCase (ex : TreeManager, FullManager)
- **Méthodes** : camelCase (ex : renderNode, addChat, startEditNode)
- **Variables** : camelCase (ex : treeContainer, nodeId)
- **Fichiers** : PascalCase pour les classes, kebab-case pour les scripts d'entrée (ex : TreeManager.js, full.js)
- **Attributs data-*** : kebab-case (ex : data-action, data-id)

## Bonnes pratiques spécifiques au projet

- Toujours nettoyer les états temporaires (isEditing, isCreatingChat, etc.) avant d'en ouvrir un nouveau
- Ne jamais manipuler le DOM directement hors des méthodes de rendu
- Toujours rerendre l'arborescence après une action modifiant les données
- Utiliser des événements custom pour la communication inter-modules (EventBus)
- Respecter l'accessibilité (tabindex, aria-label, roles, etc.)
- Préférer la modularité (fonctions utilitaires, classes séparées)
- Garder le code testable (éviter les dépendances cachées)

## Structure cible (exemple)

- FullManager
  - TreeManager
    - Méthodes : render, renderNode, addChat, addFolder, editNode, deleteNode, toggleFolder, etc.
  - UIManager
  - EventBus

## Points d'attention pour éviter les régressions

- Toujours comparer le DOM généré avec la version statique validée (reference-design-1.2.7.html)
- Valider chaque étape UX (formulaires inline, focus, validation, annulation)
- Tester toutes les actions (ajout, édition, suppression, navigation)
- Garder une sauvegarde des extraits de code validés dans code-extraits/
- Documenter chaque refacto dans le README-code-extraits.md

## Astuces et rappels

- Utiliser le fichier prompt.md pour chaque demande à l'assistant
- Ne jamais supprimer une fonctionnalité sans vérifier sa présence dans la version validée
- Préférer l'évolution incrémentale (micro-commits, tests fréquents) 