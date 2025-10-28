# Labels GitHub - Katana Forge

Labels recommandes pour structurer le board GitHub Projects (Backlog, En cours, Review, Done) et les issues.

| Label | Couleur (hex) | Usage principal |
| --- | --- | --- |
| `priority:high` | `#D32F2F` | Bloqueurs ou travail critique pour la release en cours. |
| `priority:medium` | `#F9A825` | Stories importantes a traiter dans le sprint courant. |
| `priority:low` | `#388E3C` | Ameliorations ou dettes planifiables plus tard. |
| `type:feature` | `#1976D2` | Nouvelle fonctionnalite utilisateur. |
| `type:bug` | `#C2185B` | Correction de bug identifie en production ou staging. |
| `type:chore` | `#455A64` | Maintenance, clean-up, taches outillage. |
| `type:qa` | `#7B1FA2` | Sujets lies aux scenarios de tests ou a la qualite. |
| `status:blocked` | `#5D4037` | Tache dependante d'un externe ou d'une decision. |
| `status:ready` | `#00796B` | Pret a etre pris dans la colonne "En cours". |

## Bonnes pratiques
- [ ] Limiter a trois labels par issue pour rester lisible.
- [ ] Synchroniser les colonnes du board avec les etats declares dans les issues.
- [ ] Nettoyer les labels non utilises lors de chaque retro de sprint.
- [ ] Documenter tout nouveau label ajoute dans ce fichier et dans le [Plan de production](../project/PLAN_DE_PRODUCTION.md) si impact planning.

