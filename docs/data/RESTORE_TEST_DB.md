# Sauvegarde et restauration de la base de test

Ce guide permet de repartir d'une base propre et de recharger le dataset fonctionnel fourni pour les tests.

## Pre-requis
- `DATABASE_URL` pointe vers votre instance de test (PostgreSQL local, Supabase, etc.).
- Les migrations Prisma sont compilees (`npm run db:init` disponible).

## Reinitialiser la base
1. Supprimer ou vider la base cible (DROP DATABASE, pgAdmin, etc.).
2. Reappliquer la migration initiale :
   ```bash
   npm run db:init
   ```

## Charger le dataset de demonstration
```bash
node scripts/seed.mjs
```

Ce script :
- Vide les tables dans l'ordre des dependances.
- Cree les utilisateurs de reference (Aiko, Kenji, Claire).
- Insere 3 katanas, un devis et une commande exemple.
- Met a jour le compteur de numerotation (`QuoteCounter`).

La commande est idempotente : vous pouvez la relancer sans creer de doublons.

## Verifications rapides
- Executer `npm run test:unit` pour confirmer que les tests DAO passent.
- Ouvrir Prisma Studio si besoin :
  ```bash
  npx prisma studio
  ```

## Sauvegarder / restaurer un snapshot
- Sauvegarde :
  ```bash
  pg_dump $DATABASE_URL --clean --file backups/katana-forge-test.sql
  ```
- Restauration :
  ```bash
  psql $DATABASE_URL -f backups/katana-forge-test.sql
  ```

Avant de partager un dump, penser a nettoyer ou anonymiser les donnees sensibles.
