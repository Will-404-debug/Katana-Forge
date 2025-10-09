# Release Gate — Checklist avant merge du PR de release

- [ ] CI **verte** (lint, typecheck, build)
- [ ] PR “release-please” contient :
  - [ ] `CHANGELOG.md` généré
  - [ ] bump de version correct
- [ ] Aucun label `release:blocker` sur des issues liées
- [ ] Pages clés **OK** manuellement : `/`, `/atelier/demo`, `/compte`
- [ ] (si **MAJOR**) Breaking changes **documentés** + plan de migration
- [ ] (si pré-release) Tag `-rc.X` et case “Pre-release” cochée
