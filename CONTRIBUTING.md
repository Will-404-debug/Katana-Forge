# Contributing — Katana Forge

Merci de contribuer ! Ce guide couvre les **commits**, **PR**, et la **politique de release**.

## 1. Branches & PR

- **Branches** : `feat/*`, `fix/*`, `refactor/*`, `chore/*`, `ci/*`.
- **Base** : PR vers `main`, 1 review minimum, CI verte requise.
- **Interdits** : commit direct sur `main` (hors cas d’urgence coordonné).

## 2. Conventional Commits (obligatoire)

Format : `type(scope): sujet`. Types autorisés :
- `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`
- Rupture : `feat!:` _ou_ ajouter un paragraphe `BREAKING CHANGE: …`

Exemples :
- `feat(configurator): add fullscreen toggle`
- `fix(api): return 422 on invalid quote payload`
- `refactor(auth): split helpers`

## 3. Tests manuels avant PR

- Lancer `npm ci && npm run build` (doit passer).
- Tester les pages : `/`, `/atelier/demo`, `/compte`.
- Vérifier qu’aucune migration Prisma **destructive** n’est introduite.

## 4. Releases (automatique)

- A **chaque push** sur `main`, le bot ouvre/actualise un **PR “release-please”**.
- **Merge** du PR de release ⇒ création du **tag** `vX.Y.Z`, **Release GitHub** et `CHANGELOG.md` mis à jour.
- Un workflow joint un **asset de build** (`.tar.gz`) à la Release publiée.

## 5. Hotfix

- Branche `hotfix/x.y.z`, commit `fix: …`, PR vers `main`.
- Le PR “release-please” proposera un **patch** (`x.y.z`).

## 6. Code style

- TypeScript strict activé.
- Lint : `npm run lint` (Next lint config).
- Respect de l’architecture : `app/`, `components/`, `lib/`, `prisma/`, `scripts/`.

Merci !
