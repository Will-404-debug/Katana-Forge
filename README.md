# Katana Forge

Katana Forge est un prototype Next.js 14 (App Router) proposant un configurateur 3D pour katanas personnalises. La scene three.js repose sur **react-three-fiber** et **@react-three/drei**, tandis que la validation de configuration s appuie sur **Zod**.

## Fonctionnalites
- Atelier 3D charge uniquement cote client (dynamic import + SSR off)
- Ajustements en temps reel (couleurs tsuka/lame, metalness, roughness)
- Backend complet avec Prisma/SQLite, authentification par tokens HTTP-only et stockage des configurations
- Espace utilisateur : inscription/connexion, sauvegarde et gestion de ses katanas
- Endpoints REST `/api/auth/*`, `/api/katanas` et `/api/quotes` (persistant) proteges par verifications Serveur
- Theme visuel sombre aux accents rouge et or, inspire des forges japonaises
- TailwindCSS pour le style et Google Fonts integrees via `next/font`

## Prerequis
- Node.js >= 18.18
- npm 9+ ou pnpm / yarn equivalent

## Installation
```bash
npm install
npm run db:init   # applique la migration initiale et enregistre l etat
npx prisma generate
```

## Lancement du projet
```bash
npm run dev
```

Le serveur de developpement est accessible sur [http://localhost:3000](http://localhost:3000).

## Scripts disponibles
- `npm run dev` : demarre le serveur Next.js en mode developpement
- `npm run build` : genere le build de production
- `npm run start` : lance le serveur en production
- `npm run lint` : execute le linter Next.js
- `npm run db:init` : applique le schema initial (fallback sqlite sans `prisma migrate`)
- `npm run db:apply` : rejoue le SQL si necessaire (idempotent)
- `npm run db:resolve` : marque la migration comme appliquee
- `npx prisma migrate dev --name <nom>` : cree/applique une migration locale (si schema engine disponible)
- `npx prisma studio` : ouvre Prisma Studio pour inspecter la base

> :information_source: Sur certains environnements Windows/Node 22, `prisma migrate dev` peut echouer avec `Schema engine error`. Les commandes `npm run db:init` / `db:apply` contournent ce blocage en appliquant directement le SQL et en enregistrant la migration. Assurez-vous que `DATABASE_URL` est defini dans votre `.env` avant de lancer ces scripts.

## Variables d environnement
Copiez le fichier `.env.example` vers `.env` (ou `.env.local`) puis adaptez les valeurs :
```bash
cp .env.example .env
```

- `BASE_PRICE` : prix de base en EUR utilise par l API de devis et l estimateur UI (defaut 420)
- `DATABASE_URL` : URL SQLite (ex : `file:./dev.db`) ou autre base supportee par Prisma
- `JWT_SECRET` : secret utilise pour signer les tokens d authentification (generer une valeur robuste)

Apres creation du fichier d environnement, initialisez la base :
```bash
npm run db:init
npx prisma generate
```

## Arborescence cle
```
app/
  page.tsx                       # page d accueil
  atelier/[katanaId]/page.tsx    # atelier de configuration 3D
  compte/page.tsx                # espace utilisateur protege
  connexion/page.tsx             # page de connexion
  inscription/page.tsx           # page d inscription
  api/auth/*                     # endpoints d inscription/connexion/deconnexion/me
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
- `GET /api/auth/me` : retourne l utilisateur courant (401 sinon)
- `GET /api/katanas` : liste des katanas associes au compte connecte
- `POST /api/katanas` : creation d un katana (body `name` + configuration)
- `GET|PUT|DELETE /api/katanas/:id` : lecture/mise a jour/suppression (auth requise)
- `POST /api/quotes` : calcule un devis et journalise la demande (optionnellement rattache a un utilisateur)

## Aller plus loin
- Remplacer le modele placeholder par un katana detaille
- Connecter `/api/quotes` a un moteur de tarification metier
- Integrer des providers OAuth dans `/api/auth/*` (NextAuth, etc.)
- Ajouter une persistence supplementaire (PostgreSQL/MySQL) via Prisma

Bon forgeage !
