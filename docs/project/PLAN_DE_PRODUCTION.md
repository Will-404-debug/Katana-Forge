# Plan de production - Katana Forge

## Objectifs
- [ ] Livrer une premiere version stable de la forge d'ici quatre semaines.
- [ ] Capitaliser une documentation produit et technique partageable par l'equipe.
- [ ] Mettre en place une boucle de feedback continue avec les utilisateurs pilotes.

## Perimetre
- Interface Next.js pour la configuration et la demande de lames personnalisees.
- API interne existante, sans extension majeure des schemas Prisma.
- Automatisation CI/CD actuelle (voir `README.md`) et hygiene detaillee dans [NORMA_QUALITE](../qa/NORMA_QUALITE.md).

## Jalons (4 semaines)
### Semaine 1 - Cadrage et backlog
- [ ] Finaliser les user stories critiques et estimer les dependances.
- [ ] Configurer le board GitHub Projects ("Backlog", "En cours", "Review", "Done").
- [ ] Creer les labels de suivi selon [docs/release/LABELS.md](../release/LABELS.md).

### Semaine 2 - Squelettes fonctionnels
- [ ] Implementer la navigation principale et l'authentification de base.
- [ ] Ajouter les premiers tests end-to-end sur le flux critique.
- [ ] Valider la definition du Done avec l'equipe projet.

### Semaine 3 - Iteration produit
- [ ] Couvrir les cas d'erreur utilisateurs et la gestion d'etats offline.
- [ ] Executer une revue croisee UX / QA sur les nouveaux ecrans.
- [ ] Mettre a jour la documentation fonctionnelle et technique.

### Semaine 4 - Stabilisation et release pilote
- [ ] Completer la couverture de tests (lint, unitaires, E2E) et corriger les regressions.
- [ ] Realiser une demonstration pilote et collecter les retours priorises.
- [ ] Tagger la release candidata et pre-remplir la note de version.

## Risques et mitigation
| Risque | Impact | Mitigation |
| --- | --- | --- |
| Charge sous-estimee sur les integrations API | Glissement calendrier | Revue quotidienne du burndown et arbitrage des stories optionnelles. |
| Dette technique front accumulee | Qualite degradee | Limiter les TODOs et planifier un refactoring budgetise chaque semaine. |
| Disponibilite limitee de la QA | Tests incomplets | Prioriser les checklists [NORMA_QUALITE](../qa/NORMA_QUALITE.md) et automatiser le regression pack critique. |
| Communication inter-equipes insuffisante | Bloqueurs non resolus | Point hebdomadaire RACI et canal Slack dedie (#katana-forge). |

## Outils et rituels
- Daily stand-up 15 minutes (Teams).
- Revue de backlog hebdomadaire (Product Owner + Tech Lead).
- Retro en fin de sprint, template Miro.
- Suivi synchronise dans GitHub Projects et documentation versionnee dans `docs/`.

## RACI (extrait)
| Activite | Responsable (R) | Appui (A) | Consultes (C) | Informes (I) |
| --- | --- | --- | --- | --- |
| Priorisation backlog | Product Owner | Tech Lead | QA Lead | Stakeholders |
| Implementation features | Developpeur.trice assigne.e | Tech Lead | QA Lead | Product Owner |
| Revue de code | Tech Lead | Pair reviewer | Developpeur.trice | Product Owner |
| Recette fonctionnelle | QA Lead | Developpeur.trice | Product Owner | Stakeholders |
| Publication release | Tech Lead | DevOps | QA Lead | Stakeholders |

## Definition of Done (DoD)
- [ ] Story acceptee dans le board ("Review" -> "Done") et checklist fonctionnelle validee.
- [ ] Code conforme aux normes [NORMA_QUALITE](../qa/NORMA_QUALITE.md) et lint/CI verts.
- [ ] Tests pertinents (unitaires, integration, E2E) ajoutes ou mis a jour.
- [ ] Documentation utilisateur ou technique actualisee (`README.md`, `docs/` concernes).
- [ ] Feature flag ou rollback plan documente si applicable.

