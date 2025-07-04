# Plan de migration JS (refacto 1.3.0)

## 1. Fichiers JS de la version 1.2.7 à migrer
- popup.js (code principal de la popup, sert de base à la version étendue)
- (full.js n'existe pas, la version étendue utilisera le code refactoré de popup.js)

## 2. Modules/fonctions à transformer en classes/services
Basé sur l'analyse des fonctionnalités et du code existant :

- UIManager (gestion de l'interface, DOM, notifications, thèmes, formulaires)
- TreeManager (gestion de l'arborescence, CRUD, drag & drop, tri)
- SearchEngine (recherche, indexation, résultats)
- StorageManager (sauvegarde, chargement, reset, préférences)
- KeyboardManager (navigation et raccourcis clavier)
- EventBus (bus d'événements inter-modules)
- UserPreferences (gestion des préférences utilisateur)
- Debug/Logs (gestion des logs et de la zone de debug)

## 3. Plan de migration module par module

1. **EventBus**
   - Créer la classe EventBus (service central)
   - Tester la communication inter-modules

2. **StorageManager**
   - Créer la classe StorageManager
   - Migrer la logique de sauvegarde/chargement/reset
   - Tester la persistance des données

3. **TreeManager**
   - Créer la classe TreeManager
   - Migrer la gestion de l'arborescence, CRUD, tri, drag & drop
   - Tester les opérations sur l'arbre

4. **SearchEngine**
   - Créer la classe SearchEngine
   - Migrer la logique de recherche et d'indexation
   - Tester la recherche et les résultats

5. **UserPreferences**
   - Créer la classe UserPreferences
   - Migrer la gestion des préférences (thème, police)
   - Tester la sauvegarde et l'application des préférences

6. **KeyboardManager**
   - Créer la classe KeyboardManager
   - Migrer la navigation et les raccourcis clavier
   - Tester la navigation clavier

7. **UIManager**
   - Créer la classe UIManager
   - Migrer la gestion du DOM, affichage, formulaires, notifications
   - Tester l'affichage et les interactions

8. **Debug/Logs**
   - Créer la classe Debug/Logs
   - Migrer la gestion des logs et de la zone de debug
   - Tester l'affichage et la journalisation

## 4. Conseils
- Migrer et tester chaque module indépendamment avant intégration globale
- Ajouter des tests unitaires à chaque étape
- Documenter les signatures et interactions dans le code

---

Ce plan servira de feuille de route pour la migration progressive du JS vers l'architecture modulaire POO. 