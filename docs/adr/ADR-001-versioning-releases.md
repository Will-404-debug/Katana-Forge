# ADR-001 — Versioning & Releases

**Contexte.** Katana Forge (Next.js 14, TypeScript, Prisma). Objectif : des releases **fiables**, **traçables** et **automatisées**.

## Décisions

- **Versioning** : SemVer `MAJOR.MINOR.PATCH`.
  - `feat:` → MINOR ; `fix:` → PATCH ; `feat!:` ou `BREAKING CHANGE:` → MAJOR.
- **Branches** :
  - `main` = production.
  - Travail sur `feat/*`, `fix/*`, `chore/*`, `refactor/*` via PR vers `main`.
- **Automatisation** : GitHub Actions **Release Please** (PR de release, `CHANGELOG.md`, tag `vX.Y.Z`, Release).
- **Pré-releases** : support `-rc.X` (release candidate) cochée “Pre-release”.
- **Qualité avant release** :
  - CI verte (lint / typecheck / build).
  - Pages clés stables : `/`, `/atelier/demo`, `/compte`.
  - Aucune migration Prisma **destructive**.
- **Autorité** : merge du PR de release validé par 1 reviewer **min.**.

## Conséquences

- Discipline de commit (Conventional Commits).
- Historique clair (CHANGELOG + tags).
- Rétro / rollback simplifié via tags.

## Statut

Accepté (date : YYYY-MM-DD).
