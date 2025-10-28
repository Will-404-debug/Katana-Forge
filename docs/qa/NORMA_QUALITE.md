# Norma qualite - Katana Forge

Ce cadre assure une experience homogene et facilite le suivi defini dans le [Plan de production](../project/PLAN_DE_PRODUCTION.md).

## Conventions de nommage
- [ ] Composants React en PascalCase (`SiteHeader`, `QuoteForm`).
- [ ] Hooks et utilitaires en camelCase (`useKatana`, `buildQuotePayload`).
- [ ] Fichiers de test suffixes par `.test.ts(x)` ou `.spec.ts(x)`.
- [ ] Scripts npm et workflows CI en kebab-case (`build-preview`, `lint-ci`).

## Lint et formatage
- `npm run lint` doit etre vert avant tout push.
- `npm run format` (si defini) a utiliser pour corriger automatiquement les ecarts.
- Aucun avertissement ESLint ne doit rester ignore sans justification dans la PR.

## Types et schemas
- TypeScript strict doit rester active (`tsconfig.json`).
- [ ] Types explicites pour les props (`type Props = { ... }`) et les retours d'API.
- [ ] Utiliser `zod` ou schemas Prisma pour valider les entrees critiques.
- [ ] Ajouter des tests de type (`expectTypeOf`) pour couvrir les points sensibles.

## Revue de code
- [ ] Toute PR dispose d'au moins un reviewer (voir `CONTRIBUTING.md`).
- [ ] Description claire avec contexte, captures lorsque pertinent et lien vers issue/epic.
- [ ] Checklist PR completee avant assignation en review :
  - [ ] Lint et tests locaux passes.
  - [ ] Documentation mise a jour (README, docs/).
  - [ ] Captures ou GIFs ajoutes pour les changements UI.
- [ ] Reviewer verifie la couverture de tests et le respect des normes ci-dessus.

## Qualite fonctionnelle
- [ ] Scenarios critiques testes sur les navigateurs supportes.
- [ ] Donnees de demo mises a jour pour refleter les cas d'usage.
- [ ] Points ouverts documentes dans le board GitHub Projects (colonne "Review").

## Suivi
- Les ecarts sont enregistres dans des issues etiquetees via [docs/release/LABELS.md](../release/LABELS.md).
- Les retro hebdomadaires analysent les tendances et ajustent cette norme si necessaire.

