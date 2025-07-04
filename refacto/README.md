# ChatGPT Manager

Une extension Chrome pour organiser et gérer vos conversations ChatGPT et autres IA.

## Fonctionnalités

### Version 1.2.7
- **Option de taille de police** : Basculement entre taille normale et grande pour améliorer l'accessibilité
- **Préférences utilisateur** : Sauvegarde automatique des préférences de thème et taille de police
- **Interface adaptative** : Tous les éléments s'adaptent à la taille de police choisie
- **Mode sombre compatible** : Grande police compatible avec le thème sombre

### Version 1.2.6
- **Navigation clavier complète** : Navigation dans l'arbre avec les touches flèches
- **Navigation Tab** : Navigation entre les éléments interactifs avec Tab/Shift+Tab
- **Raccourcis clavier** : Ctrl+N (nouveau chat), Ctrl+Shift+N (nouveau dossier), Ctrl+F (recherche), Ctrl+E (modifier), Delete (supprimer)
- **Focus styles** : Indicateurs visuels pour la navigation clavier avec surbrillance bleue
- **Support des lecteurs d'écran** : ARIA labels complets pour tous les éléments interactifs
- **Amélioration de l'accessibilité** : Support complet de la navigation au clavier et des technologies d'assistance
- **Contrastes améliorés** : Meilleurs ratios de contraste pour l'accessibilité
- **Mode sombre compatible** : Tous les indicateurs de focus adaptés au thème sombre
- **Support des lecteurs d'écran** : ARIA labels complets pour tous les éléments interactifs
- **Amélioration de l'accessibilité** : Support complet de la navigation au clavier et des technologies d'assistance
- **Contrastes améliorés** : Meilleurs ratios de contraste pour l'accessibilité
- **Mode sombre compatible** : Tous les indicateurs de focus adaptés au thème sombre

### Version 1.2.5
- **Barre de recherche intelligente** : Recherche en temps réel dans les noms de chats et les tags
- **Recherche optimisée** : Indexation des données pour des performances optimales
- **Debounce intelligent** : Recherche déclenchée après 400ms d'inactivité pour éviter les calculs inutiles
- **Affichage des résultats** : Liste plate avec chemin complet et actions directes
- **Recherche à partir de 2 caractères** : Évite les recherches trop courtes et non pertinentes
- **Mode sombre compatible** : Interface de recherche adaptée au thème sombre
- **Actions intégrées** : Modification et suppression directement depuis les résultats

### Version 1.2.4
- **Tags pour les chats** : Ajout d'un champ tag optionnel lors de la création et modification de chats
- **Affichage des tags** : Les tags sont affichés à côté du nom du chat avec un style élégant
- **Champ non obligatoire** : Le tag est optionnel et n'est affiché que s'il a été renseigné
- **Style adaptatif** : Les tags s'adaptent au mode sombre/clair avec des couleurs cohérentes
- **Design cohérent** : Intégration harmonieuse dans l'interface existante

### Version 1.2.3
- **Boutons tout ouvrir/fermer** : Implémentation des fonctionnalités pour développer ou réduire tous les dossiers en une seule action
- **Navigation rapide** : Possibilité d'ouvrir ou fermer l'ensemble de l'arborescence instantanément
- **Sauvegarde automatique** : L'état d'ouverture/fermeture est sauvegardé automatiquement
- **Logs d'activité** : Les actions sont enregistrées dans les logs pour le suivi

### Version 1.2.2
- **Formulaires inline dans l'arbre** : Remplacement des formulaires modaux par des formulaires intégrés directement dans l'arbre
- **Design compact et cohérent** : Style simple avec fond gris, alignement horizontal et boutons icônes
- **Meilleure expérience utilisateur** : Les formulaires apparaissent juste en dessous du dossier parent
- **Structure simplifiée** : Champs avec placeholders et boutons check/close uniquement
- **Support mode sombre** : Couleurs adaptées pour le thème sombre

### Version 1.2.1
- **Icônes d'ajout plus explicites** : Remplacement des icônes génériques par des icônes plus descriptives
  - Ajout de chat : `chat_bubble_outline` (bulle de chat)
  - Ajout de dossier : `folder_open` (dossier ouvert)
- **Icônes de drop cohérentes** : Utilisation d'icônes Material Design dans la charte graphique bleue
  - Icône "folder" bleue pour les dossiers
  - Icône "chat" bleue pour les chats (même icône qu'à gauche du nom)
  - Ombre portée ajoutée pour améliorer la visibilité de l'icône chat
- **Amélioration de la visibilité** : L'icône de drop pour les chats est maintenant plus visible grâce à une ombre portée

### Version 1.2.0
- **Nouveau design moderne** : Interface complètement repensée avec Material Design
- **Mode sombre/clair** : Basculement entre thème clair et sombre
- **Barre de recherche** : Interface pour rechercher chats et dossiers (à implémenter)
- **Boutons tout ouvrir/fermer** : Interface pour développer/réduire tous les dossiers (à implémenter)
- **Icônes Material Design** : Remplacement des emojis par des icônes professionnelles
- **Tags pour les chats** : Support visuel pour les tags (à implémenter)
- **Interface plus épurée** : Design moderne avec meilleure hiérarchie visuelle

### Version 1.1.1
- **Fenêtre dédiée** : Ouverture dans une fenêtre de 800x600 pixels au lieu d'une popup limitée
- **Version plein écran** : Nouveau fichier `full.html` pour une utilisation en mode plein écran
- **Interface épurée** : Boutons Reset et Logs masqués par défaut pour une interface plus propre

### Version 1.1.0
- **Compteur de chats** : Affichage du nombre de chats contenus dans chaque dossier (y compris les sous-dossiers)
- Badge bleu élégant avec effet hover pour une meilleure visibilité

### Version 1.0.7
- **Dossier racine renommé** : Le dossier principal s'appelle maintenant "🏠 Accueil" pour une meilleure compréhension
- **Bouton Reset** : Possibilité de réinitialiser complètement l'extension et toutes ses données

### Version 1.0.6
- **Drag and Drop** : Glissez-déposez les chats et dossiers pour les réorganiser facilement
- Utilisez l'icône ⋮⋮ pour déplacer les éléments
- Le dossier racine ne peut pas être déplacé
- Indicateurs visuels pour les zones de drop valides/invalides
- Tri automatique : dossiers d'abord, puis chats, le tout par ordre alphabétique

## Raccourcis Clavier

- **Flèches** : Navigation dans l'arbre
  - ↑/↓ : Naviguer entre les éléments
  - → : Développer un dossier ou naviguer vers le premier enfant
  - ← : Réduire un dossier ou naviguer vers le parent
- **Tab/Shift+Tab** : Navigation native entre tous les éléments interactifs (boutons, inputs, liens)
- **Entrée** : Ouvrir le chat sélectionné ou développer/réduire le dossier
- **Échap** : Effacer la sélection
- **Ctrl+N** : Nouveau chat
- **Ctrl+Shift+N** : Nouveau dossier
- **Ctrl+F** : Focus sur la recherche
- **Ctrl+E** : Modifier l'élément sélectionné
- **Suppr** : Supprimer l'élément sélectionné

### Fonctionnalités générales
- Création de dossiers pour organiser vos chats
- Ajout de liens vers vos conversations ChatGPT
- Interface intuitive avec arborescence
- Sauvegarde automatique des données
- Ouverture directe des chats dans de nouveaux onglets

## Installation

1. Téléchargez ou clonez ce repository
2. Ouvrez Chrome et allez dans `chrome://extensions/`
3. Activez le "Mode développeur"
4. Cliquez sur "Charger l'extension non empaquetée"
5. Sélectionnez le dossier de l'extension

## Utilisation

### Drag and Drop (v1.0.6)
- Cliquez et maintenez sur l'icône ⋮⋮ à côté d'un chat ou dossier
- Glissez vers un autre dossier pour le déplacer
- Les zones de drop valides sont mises en surbrillance en vert
- Les zones de drop invalides sont mises en surbrillance en rouge

### Gestion des dossiers
- Cliquez sur 📁➕ pour ajouter un sous-dossier
- Cliquez sur ✏️ pour modifier le nom d'un dossier
- Cliquez sur 🗑️ pour supprimer un dossier et son contenu

### Gestion des chats
- Cliquez sur 💬➕ pour ajouter un chat dans un dossier
- Cliquez sur le nom du chat pour l'ouvrir
- Cliquez sur ✏️ pour modifier un chat
- Cliquez sur 🗑️ pour supprimer un chat

### Réinitialisation
- Cliquez sur 🔄 Reset pour supprimer toutes les données et remettre l'extension dans son état initial
- Une confirmation sera demandée avant la suppression définitive

## Structure des données

L'extension sauvegarde vos données localement dans le stockage Chrome avec la structure suivante :

```json
{
  "id": "root",
  "name": "🏠 Accueil",
  "type": "folder",
  "children": [
    {
      "id": "unique_id",
      "name": "Nom du dossier",
      "type": "folder",
      "children": [...],
      "expanded": true
    },
    {
      "id": "unique_id",
      "name": "Nom du chat",
      "link": "https://chat.openai.com/...",
      "type": "chat"
    }
  ],
  "expanded": true
}
```

## Mode debug

Un mode debug est intégré à l'extension :
- Une zone de debug cachée permet d'afficher des logs détaillés sur les opérations internes (drag and drop, structure des données, etc.)
- Pour l'activer, il suffit d'appeler la fonction `toggleDebugZone()` dans la console de l'extension (clic droit sur la popup → Inspecter → Console), ou d'ajouter un bouton dans le HTML si besoin.
- Utile pour le diagnostic ou le développement avancé.

## Recommandations d'amélioration

### 🎯 Priorité haute - Accessibilité

#### Indicateurs visuels
- **Statut des chats** : Indicateur lu/non lu (point rouge)
- **Éléments récents** : Surbrillance des éléments ajoutés récemment
- **Progression** : Indicateur de chargement pour les actions longues

#### Actions contextuelles
- **Menu contextuel** : Clic droit pour actions rapides
- **Actions groupées** : Sélection multiple pour actions en lot
- **Favoris** : Système de favoris pour les chats importants
- **Historique** : Liste des derniers chats consultés

#### Fonctionnalités avancées
- **Undo/Redo** : Annuler/rétablir les actions importantes
- **Tri personnalisé** : Options de tri (nom, date, taille)

### 🚀 Priorité basse - Fonctionnalités avancées

#### Import/Export
- **Export JSON** : Sauvegarde des données au format JSON
- **Import JSON** : Restauration depuis un fichier JSON
- **Export CSV** : Export pour analyse dans Excel
- **Sauvegarde cloud** : Synchronisation avec Google Drive

#### Synchronisation
- **Multi-appareils** : Synchronisation entre différents navigateurs
- **Compte utilisateur** : Système de compte pour la synchronisation
- **Collaboration** : Partage de dossiers entre utilisateurs
- **Versioning** : Historique des modifications

#### Statistiques et analytics
- **Dashboard** : Vue d'ensemble avec statistiques
- **Graphiques** : Visualisation de l'utilisation
- **Rapports** : Export de rapports d'utilisation
- **Insights** : Suggestions d'organisation basées sur l'usage

### ⚡ Performance et optimisation

#### Lazy loading
- **Chargement à la demande** : Chargement des dossiers uniquement quand nécessaire
- **Virtualisation** : Affichage optimisé pour de gros volumes de données
- **Cache intelligent** : Mise en cache des données fréquemment utilisées
- **Compression** : Compression des données pour économiser l'espace

#### Optimisations techniques
- **Service Worker** : Fonctionnement hors ligne
- **IndexedDB** : Stockage local plus performant
- **Web Workers** : Traitement en arrière-plan
- **Bundle optimization** : Réduction de la taille du code

### 🎯 Feuille de route suggérée

#### Version 1.3.0 (Court terme)
- Système Undo/Redo

#### Version 2.0.0 (Long terme)
- Import/Export complet
- Synchronisation multi-appareils
- Dashboard avec statistiques

### 💡 Notes d'implémentation

- **Compatibilité** : Maintenir la compatibilité avec les versions existantes
- **Performance** : Tester les nouvelles fonctionnalités avec de gros volumes de données
- **UX** : Consulter les utilisateurs pour valider les nouvelles fonctionnalités
- **Documentation** : Mettre à jour la documentation pour chaque nouvelle fonctionnalité

Ces recommandations visent à transformer une excellente extension en une solution de référence pour la gestion de conversations IA.

## Versions

- **1.2.7** : Option de taille de police, préférences utilisateur, interface adaptative, mode sombre compatible
- **1.2.6** : Navigation clavier complète, raccourcis clavier, focus styles, support des lecteurs d'écran, amélioration de l'accessibilité, contrastes améliorés, mode sombre compatible
- **1.2.5** : Barre de recherche intelligente, recherche optimisée, debounce intelligent, affichage des résultats, recherche à partir de 2 caractères, mode sombre compatible, actions intégrées
- **1.2.4** : Tags pour les chats, affichage des tags, champ non obligatoire, style adaptatif, design cohérent
- **1.2.3** : Boutons tout ouvrir/fermer, navigation rapide, sauvegarde automatique, logs d'activité
- **1.2.2** : Formulaires inline dans l'arbre - design compact et cohérent, meilleure expérience utilisateur
- **1.2.1** : Améliorations graphiques - icônes d'ajout plus explicites, icônes de drop cohérentes dans la charte graphique bleue
- **1.2.0** : Nouveau design moderne avec Material Design, mode sombre/clair, interface épurée
- **1.1.1** : Fenêtre dédiée et version plein écran
- **1.1.0** : Compteur de chats dans les dossiers
- **1.0.7** : Renommage du dossier racine en "🏠 Accueil"
- **1.0.6** : Ajout du drag and drop pour réorganiser les chats et dossiers, tri automatique, mode debug
- **1.0.5** : Version de base avec gestion des dossiers et chats

# Architecture des templates de recherche

Les templates HTML pour l'affichage des résultats de recherche sont organisés ainsi :

- `refacto/templates/common/` : sous-templates mutualisés (barre de recherche, header, résultats, pagination)
- `refacto/templates/popup/` : template principal pour la popup (peut surcharger les sous-templates communs)
- `refacto/templates/full/` : template principal pour la version étendue (peut surcharger les sous-templates communs)

Le JS charge le template principal selon le contexte (popup ou full), puis injecte les données (résultats, pagination, etc.) dans les sous-templates. Les listeners sont attachés après injection.

L'objectif est d'assurer un affichage strictement identique entre la popup et la version étendue, tout en permettant des adaptations futures si besoin.

Aucune régression n'est tolérée sur les fonctionnalités ou l'affichage existants.