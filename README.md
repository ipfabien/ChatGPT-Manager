# ChatGPT Manager

Une extension Chrome pour organiser et gérer vos conversations ChatGPT et autres IA.

## Fonctionnalités

### Version 1.1.1
- **Fenêtre dédiée** : Ouverture dans une fenêtre de 800x600 pixels au lieu d'une popup limitée
- **Version plein écran** : Nouveau fichier `full.html` pour une utilisation en mode plein écran

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

- **1.0.7** : Renommage du dossier racine en "🏠 Accueil"
- **1.0.6** : Ajout du drag and drop pour réorganiser les chats et dossiers, tri automatique, mode debug
- **1.0.5** : Version de base avec gestion des dossiers et chats