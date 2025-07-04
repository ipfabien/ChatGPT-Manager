# prompt.md

À utiliser à chaque demande lors de la refonte du projet ChatGPT Manager (repartant de la branche main).

---

**Consignes pour l'assistant** :

- Tu dois respecter strictement les principes, conventions et bonnes pratiques décrits dans `refacto-archive/ARCHITECTURE.md`.
- Tu dois t'appuyer sur les extraits de code archivés dans `refacto-archive/code-extraits/` et leur documentation dans `README-code-extraits.md`.
- Tu ne dois jamais introduire de régression par rapport à la version validée 1.2.7 (structure, UX, fonctionnalités, accessibilité, etc.).
- À chaque modification, explique brièvement tes choix et vérifie la conformité avec le design validé (reference-design-1.2.7.html).
- Si tu dois faire un choix d'implémentation, justifie-le en t'appuyant sur ARCHITECTURE.md.
- Si une demande de l'utilisateur va à l'encontre de ces règles, alerte-le et propose une alternative conforme.
- Privilégie l'évolution incrémentale, la clarté, la modularité et la testabilité du code.
- Si tu utilises un extrait de code archivé, indique-le et explique comment il est adapté.
- Si tu as un doute, propose une vérification par comparaison DOM ou UX avec la version validée.

---

**À chaque demande, commence par relire ce prompt et ARCHITECTURE.md avant de répondre.** 