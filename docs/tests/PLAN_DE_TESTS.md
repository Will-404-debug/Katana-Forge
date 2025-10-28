# Plan de tests - Katana Forge

## Objectif
Garantir la stabilite fonctionnelle et securitaire de Katana Forge avant chaque release en couvrant les axes **unitaires**, **integration** (API) et **end-to-end** (UX). Les tests s'appuient sur la seed reference (`scripts/seed.mjs`) et sont executes via CI (Vitest + Playwright).

## Prerequis communs
- Base de donnee initialise e (`npm run db:init`) puis peuplee (`node scripts/seed.mjs`).
- Variables `.env.local` renseignees (BASE_PRICE, DATABASE_URL, JWT_SECRET).
- Navigateurs Playwright installes (`npx playwright install --with-deps`).
- Serveur Next.js accessible sur `http://127.0.0.1:3000` (Playwright demarre automatiquement si absent).

## Tests unitaires
- **Portee** : fonctions pures (`lib/validation`), stores (Zustand), DAO (`lib/db`), securite (sanitisation).
- **Outils** : Vitest (`npm run test:unit`).
- **Cas critiques couverts** :
  - Validation d'un payload devis -> cas limite (metalness/roughness).
  - Store panier : ajout multi items, suppression automatique si quantite <= 0.
  - DAO katanas : droits d'acces, transfert proprietaire, gestion erreurs (cf. `tests/unit/db/katanas.repo.test.ts`).
  - Auth schemas : refus mot de passe faible / email invalide.
  - Payload malicieux XSS/SQLi sur `/api/quotes` rejete (test securite).
- **Resultats attendus** : 100 % des scenarios passent, aucun snapshot a mettre a jour.

## Tests d'integration API
- **Portee** : routes Next API (`/api/auth`, `/api/quotes`, `/api/katanas`).
- **Outils** : Vitest + `NextRequest` simulé / Playwright APIRequest.
- **Cas critiques** :
  - Creation katana => accessible uniquement au proprietaire (DAO).
  - Endpoint `/api/quotes` rejette XSS, chiffre total selon formule.
  - Endpoint `/api/auth/login` renvoie bien cookie httpOnly (via tests e2e API).
- **Resultats attendus** : reponses HTTP conformes (statuts 200/201/401/422) et payloads nettoyes.

## Tests end-to-end
- **Portee** : parcours utilisateur complet (auth, devis, panier, acces restreint), regressions UI.
- **Outils** : Playwright (`npm run test:e2e`).
- **Cas critiques** :
  - Authentification -> acces `/profile`.
  - Acces interdit `/compte` => redirection login.
  - Flux checkout (panier -> adresse -> confirmation) avec dataset seed.
  - Regression UI : presence du header, CTA devis, composant 3D charge.
  - Gestion panier front (badge quantite, suppression item).
- **Resultats attendus** : navigation sans erreur JS, sections critiques visibles, temps de reponse < 3 s sur env local.

## Ancrage dans la CI
- **Pipeline** : lint -> `npm run test:unit` -> `npm run test:e2e`.
- **Gate** : merge bloque si un scenario echoue ou si couverture < objectif (a integrer).
- **Reporting** : exporter `playwright-report/` et `vitest` en JUnit (option a activer dans CI).

## Priorisation des regressions
| Criticite | Description | Action |
| --- | --- | --- |
| Bloquant | Fuite de donnees, connexion impossible, calcul devis incorrect | Hotfix immediat + ref tests |
| Majeur | UI degradée, acces restreints contournables, panier unusable | Correction sprint courant |
| Mineur | Style partiel, texte manquant | Backlog, correction lors des evolutions |

## Maintenance
- Revoir le plan chaque trimestre ou apres une refonte majeure.
- Ajouter un test pour chaque regression corrigee (test-driven hotfix).
- Capitaliser les jeux d'essai dans `docs/tests/JEUX_D_ESSAI.md` et `docs/tests/fixtures.json`.
