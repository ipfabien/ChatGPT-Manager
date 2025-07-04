Contexte:
Pour rappel on a actuellement une version 1.2.7 qui possède une popup de 800x600 centrée.
On veut avoir une popup avec des choses minémalistes de 400x175 (standard de chrome extension) avec des fonctionnalités et des liens vers la version étendues plein écran.
Cette version étendue doit être l'exacte copie de la version actuelle 1.2.7.
On veut également refacto tout le code en respectant l'architecture décrite dans le ficher ARCHITECTURE.md et en se référant au fichier refacto-archive/README-code-extraits.md.
Pour la refacto du js il faut se référer aux fonctionnalités décrites dans refacto/modules.md et les détails dans refacto/refacto/plan-modules-refacto.md, et baser sur le fichier refacto/refacto/tests-plan-unitaires.md  pour les tests unitaire.
Pendant la refacto du js il faudra ajouter des tests unitaires sous Jest.

Plan d'actions:
1) un dossier "refacto" a été créé pour la nouvelle version 1.3.0 de l'extension. On va la développer dans ce dossier afin de garder la version actuelle 1.2.7 à la racine. Il y a dedans seulement les fichiers pour la version statique html/css de cette popup qui sera la popup 400x175.
2) On fait des captures d'écran de la popup actuelle qui va devenir la version étendue, et une capture d'écran de la popup 400x175 contenu dans le dossier refacto. On le fait seulement si tu y trouves une utilité.
3) tu crées tous les fichiers dans refacto dont tu as besoin pour l'extension (manifest, readme, etc..) même s'ils sont vierge.
4) on teste dans chrome cette extension pour voir si on a bien la popup 400x175 qui s'affiche correctement
5) tu crées toute l'arborescence de la nouvelle archi que tu as besoin, avec des fichiers vierges
6) tu remplis les fichiers pour que l'extension fonctionne. Mais pas de refato du js, juste le html/css et faut avoir le lien vers la page étendue qui sera vide pour le moment
7) création de la page étendue avec le html/css/js dans le dossier racine qui est la version 1.7.2 qui fonctionne.
8) on vérifie si ça marche dans l'extension chrome
9) refacto du html/css de la page étendue (donc mise en commun de ce qui doit l'être). Pour rappel le js n'est toujours pas refacto et on aura 2 js, un pour la popop et un pour la version étendue
10) on vérifie que ça fonctionne dans l'extension
11) on va réflechir à un plan d'action pour la refacto du js.
12 A) Mettre en place tout ce qu'on a besoin pour faire les tests unitaires avec Jest 
12 B) Préparer la migration du JS :
    - Lister tous les fichiers JS de la version 1.2.7 à migrer.
    - Identifier les modules/fonctions à transformer en classes ou services selon l'architecture cible.
    - Créer un plan de migration module par module (ex : UIManager, StorageManager, etc.).

13) Migrer le JS de la version étendue (full) :
    - Copier le JS de la version 1.2.7 dans le dossier refacto/full.js (ou dans les nouveaux fichiers selon l'architecture).
    - Refactorer progressivement chaque module/fonction en classe POO, en respectant l'architecture (voir ARCHITECTURE.md et les extraits dans refacto-archive/).
    - Après chaque refacto de module, tester la version étendue pour s'assurer que tout fonctionne.

14) Mettre en place des tests unitaires :
    - Choisir un framework de test adapté (ex : Jest, Mocha).
    - Créer un dossier tests/ dans refacto/.
    - Écrire des tests unitaires pour chaque classe/service refactoré (au moins pour les méthodes critiques).
    - Lancer les tests à chaque étape de migration/refacto.

15) Mettre le js POO et tout ce qui est factorisé pour la le full.html

16) Préparation avant de s'attaquer à la popup
    1. dentifier les fonctionnalités à intégrer dans la popup minimaliste.
    2. Factorisation des templates HTML
Les templates de formulaires (add/edit) sont écrits en dur dans _showForm.
Action : Extraire ces templates dans des méthodes utilitaires ou des fichiers séparés pour plus de clarté.
    3. Typage et validation
Les objets passés à UIManager (résultats, nœuds) ne sont pas typés ni validés.
Action : Ajouter des vérifications de type (ou utiliser JSDoc plus strictement).
    4. Séparation stricte UI/Logique
Certaines méthodes UIManager font à la fois de la logique et du DOM.
Action : Séparer la logique pure (ex : tri, pagination) dans des helpers purs, pour faciliter la réutilisation (popup, tests).
    5. DRY sur les formulaires
Les formulaires d'ajout et d'édition sont très similaires.
Action : Mutualiser la génération des champs communs.
    6. Accessibilité et internationalisation
Les labels ARIA sont présents, mais il pourrait y avoir une factorisation ou une centralisation des textes pour préparer l'i18n.
    7. S'assurer que UIManager, StorageManager, etc. sont bien découplés de la page (pas de dépendance au DOM global, pas de singleton).
    8. érifier que chaque manager/service est dans le bon dossier (managers/, services/, utils/), et que les points d'entrée JS sont clairs.
    9. Commencer à documenter les méthodes publiques des classes, pour faciliter la prise en main lors de la mutualisation.

17) Ajouter le JS dans la popup 400x175 :
    - Créer ou adapter le JS pour la popup, en important/réutilisant les classes/services déjà refactorés.
    - Ajouter les liens vers la version étendue.
    - Tester la popup dans Chrome pour vérifier le bon fonctionnement.

18) Mutualiser le code entre popup et version étendue :
    - S'assurer que les classes/services sont bien réutilisables entre les deux interfaces.
    - Factoriser le code commun (éviter les duplications).
    - Adapter les points d'entrée (bootstrap JS) pour chaque version.

19) Finaliser la migration et la refacto :
    - Vérifier que toutes les fonctionnalités de la version étendue sont bien présentes et fonctionnelles.
    - Vérifier que la popup minimaliste fonctionne et propose les liens/fonctionnalités attendues.
    - Nettoyer le code, supprimer les anciens fichiers inutiles.

20) Renforcer la couverture de tests :
    - Ajouter des tests unitaires supplémentaires si besoin.
    - Tester les cas limites et les erreurs.

21) Mettre à jour la documentation :
    - Documenter l'architecture, les classes/services, et les points d'entrée.
    - Mettre à jour le README et tout fichier utile pour la prise en main du projet.

22) Validation finale :
    - Tester l'extension dans Chrome (popup et version étendue).
    - Vérifier la conformité avec les besoins initiaux.
    - Corriger les derniers bugs éventuels.
    
23) Définir les fonctionnalités de la popup

24) Mettre en place les fonctionnalités de la popup

25) passer refacto à la racine

26) Tester l'extension dans chrome et commit/push cette version 1.3.0

Version 1.4 :

27) Passer l'extension en responsif (css natif)

Version

Versions à venir : 

28) Analyse des fonctionnalités à améliorer.

29) Analyse des fonctionnalités à ajouter
