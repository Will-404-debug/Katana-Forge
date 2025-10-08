# Katana Forge

Katana Forge est un prototype Next.js 14 (App Router) proposant un configurateur 3D pour katanas personnalisés. La scene three.js repose sur **react-three-fiber** et **@react-three/drei**, tandis que la validation de configuration s appuie sur **Zod**.

## Fonctionnalités
- Atelier 3D charge uniquement cote client (dynamic import + SSR off)
- Ajustements en temps réel (couleurs tsuka/lame, metalness, roughness)
- Backend complet avec Prisma/SQLite, authentification par tokens HTTP-only et stockage des configurations
- Espace utilisateur : inscription/connexion, sauvegarde et gestion de ses katanas
- Endpoints REST `/api/auth/*`, `/api/katanas` et `/api/quotes` (persistant) protégés par verifications Serveur
- Theme visuel sombre aux accents rouge et or, inspiré des forges japonaises
- TailwindCSS pour le style et Google Fonts integrees via `next/font`

## Prérequis
- Node.js >= 18.18
- npm 9+ ou pnpm / yarn equivalent

## Installation
```bash
npm install
npm run db:init   # applique la migration initiale et enregistre l'état
npx prisma generate
```

## Lancement du projet
```bash
npm run dev
```

Le serveur de developpement est accessible sur [http://localhost:3000](http://localhost:3000).

## Scripts disponibles
- `npm run dev` : demarre le serveur Next.js en mode developpement
- `npm run build` : génère le build de production
- `npm run start` : lance le serveur en production
- `npm run lint` : execute le linter Next.js
- `npm run db:init` : applique le schema initial (fallback sqlite sans `prisma migrate`)
- `npm run db:apply` : rejoue le SQL si necessaire (idempotent)
- `npm run db:resolve` : marque la migration comme appliquée
- `npx prisma migrate dev --name <nom>` : crée/applique une migration locale (si schema engine disponible)
- `npx prisma studio` : ouvre Prisma Studio pour inspecter la base

> :information_source: Sur certains environnements Windows/Node 22, `prisma migrate dev` peut echouer avec `Schema engine error`. Les commandes `npm run db:init` / `db:apply` contournent ce blocage en appliquant directement le SQL et en enregistrant la migration. Assurez-vous que `DATABASE_URL` est défini dans votre `.env` avant de lancer ces scripts.

## Variables d environnement
Copiez le fichier `.env.example` vers `.env` (ou `.env.local`) puis adaptez les valeurs :
```bash
cp .env.example .env
```

- `BASE_PRICE` : prix de base en EUR utilise par l'API de devis et l'estimateur UI (defaut 420)
- `DATABASE_URL` : URL SQLite (ex : `file:./dev.db`) ou autre base supportée par Prisma
- `JWT_SECRET` : secret utilise pour signer les tokens d'authentification (generer une valeur robuste)

Apres creation du fichier d'environnement, initialisez la base :
```bash
npm run db:init
npx prisma generate
```

## Arborescence clé
```
app/
  page.tsx                       # page d'accueil
  atelier/[katanaId]/page.tsx    # atelier de configuration 3D
  compte/page.tsx                # espace utilisateur protege
  connexion/page.tsx             # page de connexion
  inscription/page.tsx           # page d'inscription
  api/auth/*                     # endpoints d'inscription/connexion/deconnexion/me
  api/katanas/route.ts           # gestion CRUD des katanas (auth requise)
  api/quotes/route.ts            # endpoint calcul devis + persistance
components/configurator/
  KatanaCanvas.tsx               # wrapper Canvas (dynamic import)
  KatanaScene.tsx                # chargement/parametrage du modele GLB
  UIControls.tsx                 # sliders et color pickers
components/auth/                 # provider + formulaires d auth
components/layout/SiteHeader.tsx # navigation reactive selon la session
components/providers/            # AppProviders wrapping
lib/validation.ts                # schema Zod et configuration par defaut
public/models/katana.glb         # modele 3D placeholder (lame + tsuka)
```

## API REST
- `POST /api/auth/register` : inscription + ouverture de session (body `{ email, password, name }`)
- `POST /api/auth/login` : authentification email/mot de passe, set cookie `auth_token`
- `POST /api/auth/logout` : suppression du cookie d authentification
- `GET /api/auth/me` : retourne l'utilisateur courant (401 sinon)
- `GET /api/katanas` : liste des katanas associes au compte connecte
- `POST /api/katanas` : creation d un katana (body `name` + configuration)
- `GET|PUT|DELETE /api/katanas/:id` : lecture/mise à jour/suppression (auth requise)
- `POST /api/quotes` : calcule un devis et journalise la demande (optionnellement rattache à un utilisateur)

## Releases & Tags (automatique)

Ce dépôt utilise **Release Please** pour gérer **versioning SemVer**, **tags** (`vX.Y.Z`), **release GitHub** et **CHANGELOG.md** automatiquement.

### 🧭 Comment ça marche
1. Utilise des **Conventional Commits** lors de tes PR/commits vers `main` :
   - `feat: …` → incrémente **minor** (ex: 0.1.0 → 0.2.0)
   - `fix: …` → incrémente **patch** (ex: 0.1.0 → 0.1.1)
   - `feat!: …` ou mention **BREAKING CHANGE:** → **major**
2. À chaque push sur `main`, **Release Please** ouvre/actualise un **PR de release**.
3. **Merge** ce PR → GitHub crée automatiquement :
   - le **tag** `vX.Y.Z`
   - la **Release** “Katana Forge vX.Y.Z”
   - le **CHANGELOG.md** mis à jour
4. À la publication de la Release, la CI **attache un build** (`.tar.gz`) en asset.

> Badge : _CI: Release Please — enabled_

### 🚀 Démarrer rapidement
- Crée une branche d’installation des workflows, merge sur `main`.
- Fais un commit conventionnel (ex: `feat: test release flow`) et merge.
- Ouvre/merge le PR “release-please…” → vérifie la Release, le tag et l’asset.

### 🔑 Rappels utiles
- **Aucune variable secrète** requise pour ces workflows.
- **Ne pousse pas de tag manuellement** si tu utilises Release Please (elle gère le tag).
- Les **pré-releases** sont possibles en créant une release marquée pré-release (ex: `v1.0.0-rc.1`) ; l’asset sera quand même joint.

### ❓FAQ
- **Pourquoi Conventional Commits ?** Pour dériver automatiquement la version et rédiger un changelog propre.
- **Puis-je déclencher à la main ?** Oui, le workflow “Release Please” expose `workflow_dispatch`.
- **Puis-je changer la stratégie ?** Oui, modifie `.github/workflows/release-please.yml` (sections `release-type`, `changelog-types`, etc.).

Bon forgeage !
