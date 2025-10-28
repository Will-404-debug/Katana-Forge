# Cadre securite - Katana Forge

## Menaces principales
- **XSS (Cross-Site Scripting)** : injection via champs texte (nom katana, descriptions). Prevention : `react` escape auto, `sanitize-html` si rendu riche, `Content-Security-Policy`.
- **CSRF (Cross-Site Request Forgery)** : actions sensibles (`POST /api/quotes`, `DELETE /api/katanas`). Prevention : cookies HTTP-only `SameSite=Lax` ou `Strict`, tokens anti-CSRF pour formulaires publiques.
- **IDOR (Insecure Direct Object Reference)** : acces a un katana/devis d'un autre utilisateur via un ID. Prevention : verification systematique du proprietaire (`userId`) dans les services/DAO.
- **Vol de session** : cookies interceptes, reutilisation tokens. Prevention : rotation tokens, `Secure`, `HttpOnly`, `SameSite`, reauth sur actions critiques.
- **Brute force / enumeration** : tentatives massives connexion / devis. Prevention : rate limiting (middleware), captcha optionnel.

## Authentification & autorisation
- Utiliser `next-auth` (ou equivalent maison) avec cookies HTTP-only, TTL raisonnable et refresh tokens si besoin.
- Stocker les hash de mots de passe via `bcrypt` 12+ rounds.
- Autorisation centralisee dans la couche Service : `assertOwnership(resource, user)` et roles (`user`, `artisan`, `commercial`).
- Actions admin/commercial via scopes specifiques et verification de consentement (RGPD).

## Validation et normalisation des donnees
- Toutes les routes utilisent des schemas Zod (ex : `quotePayloadSchema`).
- Valider les types (string, number), longueurs (max 120 chars), regex sur email/tel, whitelists pour les materiaux.
- Nettoyage : trim, toLowerCase pour emails, clamp sur valeurs numeriques (metalness, roughness).
- Reponses API : standardiser via `z.object({ data, error })` pour eviter sur-exposition.

## Headers de securite recommandés
- `Content-Security-Policy`: `default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'`.
- `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`.
- `X-Content-Type-Options`: `nosniff`.
- `X-Frame-Options`: `DENY`.
- `Referrer-Policy`: `strict-origin-when-cross-origin`.
- `Permissions-Policy`: desactiver camera/micro sauf necessaire.

Configurer ces headers via `next.config.js` (`async headers()`) ou middleware.

## Politique de permissions
- **UI** : afficher/masquer les CTA selon role (ex : actions commerciales).
- **API** : middleware verifie la session et injecte `user.role`, `consents`.
- **Service** : fonction `canPerform(user, action, resource)` centralisant la logique.
- **DAO** : aucune logique de permission, mais filtre par `userId` avant requete.

## Surveillance et alertes
- Logs d'audit : creation/modification de devis, changement consentements, connexion.
- Alertes : 403/401 repetes, anomalies de rate limit, erreurs 5xx.
- Retours utilisateur : pages d'erreur generique, messages specifiques en console pour debug.

## Checklist securite
- [ ] Toutes les routes Zod-validees et schemas testes.
- [ ] Headers de securite configure s en production.
- [ ] Rate limiting actif sur `/api/auth/login` & `/api/quotes`.
- [ ] Tests d'autorisation couvrent lectures/ecritures (IDOR).
- [ ] Analyse SAST (p.ex. `npm audit`, `semgrep`) integree a la CI.
