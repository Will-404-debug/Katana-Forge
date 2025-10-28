# Jeux d'essai - Katana Forge

Les scenarios suivants alimentent les campagnes de tests (unitaires, API et e2e). Les donnees sont synchronisees avec `docs/tests/fixtures.json`.

## Authentification
| Jeu | Entree | Attendu | Utilisation |
| --- | --- | --- | --- |
| `auth_valid_user` | email `aiko@example.com`, mot de passe `Katana!2025` | Connexion reussie, redirection `/profile` | Tests e2e auth |
| `auth_invalid_password` | email `aiko@example.com`, mot de passe `wrongpass` | HTTP 401, message erreur | Vitest schema + Playwright API |

## Devis / Quotes
| Jeu | Entree | Attendu | Utilisation |
| --- | --- | --- | --- |
| `quote_valid` | handle `#2b1d14`, blade `#d7d3c8`, metalness `0.65`, roughness `0.35` | Prix calcule `BASE_PRICE + 32.5 + 12.25`,  est. 5-6 semaines | Tests unitaires/service |
| `quote_malicious` | `"<script>alert(1)</script>"` dans `handleColor` | HTTP 422, aucune persistance | Test securite `/api/quotes` |

## Panier
| Jeu | Entree | Attendu | Utilisation |
| --- | --- | --- | --- |
| `cart_basic` | Ajout `kat_aiko_alpha` x2 puis `kat_kenji_master` x1 | Total = 3, badge mis a jour | Tests store + e2e badge |
| `cart_negative` | Mise a jour quantite -5 sur `kat_aiko_alpha` | Article supprime, total = 1 | Test store |

## Acces restreints
| Jeu | Entree | Attendu | Utilisation |
| --- | --- | --- | --- |
| `forbidden_profile` | Visiteur anonyme -> `/compte` | Redirection `/connexion` | Test e2e acces interdit |

## Regression UI
| Jeu | Entree | Attendu | Utilisation |
| --- | --- | --- | --- |
| `ui_header_cta` | Chargement `/` (seed) | Header visible, CTA "Entrer dans la forge" | Test e2e regression |

## Fixtures JSON
```json
{
  "source": "./docs/tests/fixtures.json"
}
```
