# Playbook — Hotfix

## Quand ?
Bug critique en production (sécurité, crash, perte de données, blocage).

## Étapes
1) Créer `hotfix/x.y.z` depuis `main`.
2) Commit : `fix(scope): …` (+ tests si possible).
3) PR vers `main` → CI verte.
4) Merge : Release Please ouvrira un PR de **patch** ⇒ merge du PR de release ⇒ tag `vx.y.z` et Release.
5) Post-mortem (court) : cause, détection, correctifs préventifs.

## Garde-fous
- Portée minimale, pas de refactor opportuniste.
- Communication courte (dev, produit, support).
