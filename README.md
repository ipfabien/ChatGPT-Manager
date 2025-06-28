# ChatGPT Manager

Une extension Chrome pour organiser et gérer vos conversations ChatGPT et autres IA.

## Fonctionnalités

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

## Versions

- **1.2.3** : Boutons tout ouvrir/fermer, navigation rapide, sauvegarde automatique, logs d'activité
- **1.2.2** : Formulaires inline dans l'arbre - design compact et cohérent, meilleure expérience utilisateur
- **1.2.1** : Améliorations graphiques - icônes d'ajout plus explicites, icônes de drop cohérentes dans la charte graphique bleue
- **1.2.0** : Nouveau design moderne avec Material Design, mode sombre/clair, interface épurée
- **1.1.1** : Fenêtre dédiée et version plein écran
- **1.1.0** : Compteur de chats dans les dossiers
- **1.0.7** : Renommage du dossier racine en "🏠 Accueil"
- **1.0.6** : Ajout du drag and drop pour réorganiser les chats et dossiers, tri automatique, mode debug
- **1.0.5** : Version de base avec gestion des dossiers et chats