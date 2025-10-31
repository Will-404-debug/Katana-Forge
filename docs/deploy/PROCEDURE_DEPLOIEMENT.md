# Procédure de déploiement – Katana Forge

Ce document décrit les prérequis, les réglages d'environnement et les étapes à suivre pour déployer Katana Forge sur un environnement de production ou de préproduction. Les commandes sont données pour un shell POSIX ; adaptez-les à votre contexte si nécessaire.

## 1. Prérequis

- Node.js `>= 18.18.0` et npm (utilisez de préférence `npm` pour garantir la compatibilité avec le lockfile).
- Accès à une base de données compatible Prisma (PostgreSQL en production, SQLite possible pour des environnements éphémères).
- Accès réseau vers les services externes configurés (Stripe, Google OAuth, Resend, SMTP, Mailhog…).
- Droits d'exécution sur le serveur cible et possibilité de gérer les secrets (fichier `.env` ou magasin de secrets).

## 2. Variables d'environnement

Créez un fichier `.env` à partir de `.env.example` et renseignez les valeurs sensibles. Les variables marquées "Obligatoire" doivent être définies avant le démarrage de l'application.

| Nom | Description | Obligatoire | Notes |
| --- | --- | --- | --- |
| `APP_URL` | URL publique de l'application (utilisée pour les callbacks OAuth et les liens e-mails). | ✅ | Exemple : `https://app.katanaforge.fr` |
| `BASE_PRICE` | Prix de base des katanas personnalisés. | ✅ | Valeur entière en centimes. |
| `DATABASE_URL` | Chaîne de connexion Prisma. | ✅ | Préférez un backend PostgreSQL (`postgresql://…`). |
| `JWT_SECRET` | Secret JWT pour la génération de tokens applicatifs. | ✅ | Générer une chaîne aléatoire robuste. |
| `NEXTAUTH_SECRET` | Secret NextAuth pour la gestion de session. | ✅ | Peut être la même valeur que `JWT_SECRET`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Identifiants OAuth Google. | ✅ si login Google activé | Obtenus depuis Google Cloud Console. |
| `STRIPE_SECRET_KEY` | Clé privée Stripe. | ✅ si paiement en ligne activé | Clé LIVE ou TEST selon l'environnement. |
| `STRIPE_WEBHOOK_SECRET` | Secret du webhook Stripe. | ✅ si webhooks configurés | Généré via `stripe listen` ou le tableau de bord Stripe. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Paramètres SMTP pour l'envoi de courriels. | ✅ si livraison e-mail en production | Pour Mailhog, utiliser `localhost:1025` sans authentification. |
| `MAIL_FROM` | Adresse d'expédition. | ✅ | Format recommandé : `Nom <adresse@domaine>` |
| `PDF_STORAGE_PROVIDER` | Backend de stockage des PDF (`fs`, `gcs`, `blob`). | ✅ | Utiliser `blob` sur Vercel, `fs` uniquement en local. |
| `PDF_STORAGE_DIR` | Répertoire où stocker les devis PDF générés. | ✅ | Assurez-vous que le dossier est inscriptible pour `fs`. |
| `PDF_STORAGE_BUCKET` | Nom du bucket GCS. | Optionnel | Obligatoire avec le provider `gcs`. |
| `PDF_STORAGE_PREFIX` | Préfixe commun pour les chemins distants. | Optionnel | Peut servir pour `gcs` et `blob` (ex. `quotes`). |
| `BLOB_READ_WRITE_TOKEN` | Jeton d'accès Vercel Blob. | ✅ si provider `blob` | Généré via le dashboard Vercel Blob. |
| `RESEND_API_KEY`, `FEATURE_RESEND` | Configuration du provider Resend. | Optionnel | Mettre `FEATURE_RESEND=true` pour activer l'envoi via Resend. |
| `COMPANY_*` | Informations légales affichées sur les devis/factures. | ✅ | Adapter aux coordonnées de votre entreprise. |

> 💡 **Conseil** : centralisez la gestion des secrets via GitHub Actions Secrets, Vault ou AWS SSM, puis injectez-les dans l'environnement d'exécution.

## 3. Préparation du build

1. Installer les dépendances :
   ```bash
   npm ci
   ```
2. Vérifier le lint et le typage avant de déployer :
   ```bash
   npm run lint
   npx tsc --noEmit
   ```
3. Générer le build Next.js :
   ```bash
   npm run build
   ```
   Les artefacts sont produits dans `.next/` et seront emballés lors du déploiement.

## 4. Migrations Prisma

Les migrations doivent être appliquées **avant** de démarrer le serveur applicatif.

1. Exécuter les migrations sur la base ciblée :
   ```bash
   npx prisma migrate deploy --schema prisma/schema.prisma
   ```
2. Vérifier l'état des migrations :
   ```bash
   npx prisma migrate status --schema prisma/schema.prisma
   ```
   Le statut doit indiquer que toutes les migrations sont appliquées. En cas de premier déploiement, vous pouvez initialiser des données avec `npm run db:init` si nécessaire.

## 5. Démarrage de l'application

1. Exporter les variables d'environnement (fichier `.env` ou injection via le système de déploiement).
2. Lancer le serveur Next.js :
   ```bash
   npm run start -- --hostname 0.0.0.0 --port 3000
   ```
3. Configurer un reverse proxy (Nginx, Caddy…) pour exposer l'application via HTTPS si besoin.

## 6. Vérifications de santé

Après redémarrage, exécutez ces contrôles pour valider le déploiement :

- **Disponibilité HTTP** : `curl -f https://app.katanaforge.fr/` doit retourner `200 OK` avec le contenu HTML principal.
- **Connexion à la base** : `npx prisma db push --schema prisma/schema.prisma --dry-run` doit s'exécuter sans erreur, confirmant que la base est accessible.
- **Webhook Stripe (optionnel)** : si les webhooks Stripe sont configurés, utilisez `stripe trigger payment_intent.succeeded` en environnement de test pour vérifier la réception.
- **Journalisation** : surveillez les logs d'application pour détecter d'éventuelles erreurs (authentification, envoi SMTP, génération de PDF).

Documentez tout incident rencontré et mettez à jour ce guide au fil des retours d'expérience.

