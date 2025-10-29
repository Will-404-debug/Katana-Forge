# Exécution locale via Docker

Ce guide explique comment lancer Katana Forge et son PostgreSQL compagnon avec Docker pour reproduire un environnement proche de la CI.

## 1. Préparer les variables d'environnement

1. Copiez le modèle suivant dans un fichier `.env.docker` à la racine du projet :

   ```env
   # Application
   APP_URL=http://localhost:3000
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=change-me
   JWT_SECRET=change-me

   # Base de données (doit correspondre à docker-compose.yml)
   DATABASE_URL=postgresql://katana:katana@postgres:5432/katana?schema=public

   # SMTP local (Mailhog ou équivalent)
   SMTP_HOST=mailhog
   SMTP_PORT=1025
   SMTP_USER=
   SMTP_PASS=
   MAIL_FROM=Katana Forge <no-reply@kfor.ge>

   # Intégrations optionnelles
   STRIPE_SECRET_KEY=
   STRIPE_WEBHOOK_SECRET=
   RESEND_API_KEY=
   FEATURE_RESEND=false
   ```

2. Ajustez les secrets (`NEXTAUTH_SECRET`, `JWT_SECRET`, clés Stripe…) avant d'exposer l'environnement.

## 2. Construire et démarrer les conteneurs

```bash
docker compose up --build
```

- Le service `postgres` démarre en premier et expose le port `5432`.
- Le service `app` construit l'image Node.js, applique automatiquement `prisma migrate deploy`, puis lance `npm run start`.
- Les devis générés sont persistés dans le volume `storage-data`.

Pour arrêter l'environnement :

```bash
docker compose down
```

Ajoutez `--volumes` si vous souhaitez supprimer les données PostgreSQL.

## 3. Vérifications et dépannage

- Vérifiez l'application : `http://localhost:3000` doit répondre en moins d'une minute.
- Surveillez les logs : `docker compose logs -f app postgres`.
- Pour relancer uniquement l'application après modification du code :
  ```bash
  docker compose up --build app
  ```
- Vous pouvez lancer des commandes ponctuelles (tests, lint) dans le conteneur applicatif :
  ```bash
  docker compose run --rm app npm run test:unit
  ```

Ce flux est aligné sur le pipeline CI : lint, compilation et migrations fonctionnent dans la même image que celle utilisée pour la production.

