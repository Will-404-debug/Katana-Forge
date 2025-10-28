# Contributing - Katana Forge

Merci de contribuer a Katana Forge. Ce guide explique comment preparer vos branches, commits et pull requests afin de garder le projet stable.

## Branches et Pull Requests
- Creez une branche depuis `main` en suivant les prefixes autorises : `feat/*`, `fix/*`, `refactor/*`, `chore/*`, `ci/*`, `hotfix/*`.
- Pas de commit direct sur `main` (sauf urgence coordonnee avec les mainteneurs).
- Toute PR cible `main`, passe la CI et obtient au moins une review approuvee.

## Conventional Commits (obligatoire)
- Format : `type(scope): sujet`. Types autorises : `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.
- Rupture : utiliser `feat!:` ou ajouter un paragraphe `BREAKING CHANGE:`.
- Exemples :
  - `feat(configurator): add fullscreen toggle`
  - `fix(api): return 422 on invalid quote payload`
  - `refactor(auth): split helpers`

## Workflow PR
1. Mettre a jour la branche depuis `main` et resoudre les conflits localement.
2. Executer `npm ci`, `npm run lint`, `npm run build` et les tests pertinents (`npm run test`, `npm run test:e2e` le cas echeant).
3. Verifier la conformite avec [NORMA_QUALITE](docs/qa/NORMA_QUALITE.md) et les attentes du [Plan de production](docs/project/PLAN_DE_PRODUCTION.md).
4. Rediger une description claire : contexte, solution, tests, captures (UI) et reference vers issue/epic.
5. Completer la checklist PR et deplacer la carte correspondante sur le board GitHub Projects (`Review`), labels selon [docs/release/LABELS.md](docs/release/LABELS.md).
6. Assigner au moins un reviewer et rester disponible pour les retours. Un rebase et un squash final peuvent etre demandes avant merge.

## Tests manuels avant PR
- Lancer `npm ci && npm run build` (doit reussir).
- Tester manuellement les parcours critiques : `/`, `/atelier/demo`, `/compte`.
- Verifier qu'aucune migration Prisma destructive n'est introduite.

## Releases (automatique)
- A chaque merge sur `main`, `release-please` met a jour la branche de release et ouvre/actualise sa PR.
- Le merge de la PR de release cree le tag `vX.Y.Z`, la release GitHub et met a jour `CHANGELOG.md`.
- Un asset de build (`.tar.gz`) est attache automatiquement a la release publiee.

## Hotfix
- Base branche : `hotfix/x.y.z`, commits `fix: ...`.
- PR vers `main`, validations automatiques identiques au flux standard.
- La PR `release-please` generera ensuite un patch `x.y.z`.

## Code style et qualite
- TypeScript strict reste actif (`tsconfig.json`).
- `npm run lint` doit etre propre avant merge.
- Respecter l'architecture : `app/`, `components/`, `lib/`, `prisma/`, `scripts/`.
- Suivre les checklists du document [NORMA_QUALITE](docs/qa/NORMA_QUALITE.md) pour chaque contribution.

