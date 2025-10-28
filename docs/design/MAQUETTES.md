# Maquettes basse fidelite

Chaque ecran dispose d'un wireframe ASCII, d'un schema Mermaid (exportable en PNG) et d'une capture generique en PNG generee automatiquement (`docs/design/img/`).

## Accueil
````ascii
┌──────────────────────────────────────────────────────────────┐
│                       HERO + CTA                             │
├──────────────────────────────────────────────────────────────┤
│  Config rapide                    │  Temoignages clients      │
│  (3 etapes)                       │  (quotes courtes)         │
├──────────────────────────────────────────────────────────────┤
│  Avantages forge (3 colonnes)     │  Mise en avant atelier    │
├──────────────────────────────────────────────────────────────┤
│ Footer : mentions legales, RGPD, acces RGAA                   │
└──────────────────────────────────────────────────────────────┘
````

```mermaid
flowchart TB
    hero[Hero + CTA principal]
    quick[Bloc configurateur rapide]
    proof[Temoignages]
    benefits[Avantages forge]
    footer[Footer RGPD & RGAA]
    hero --> quick --> proof --> benefits --> footer
```

![Wireframe accueil](img/wireframe-home.png)

## Atelier 3D
````ascii
┌──────────────────────────────────────────────────────────────┐
│ Toolbar / Fil d'Ariane                                       │
├───────────────┬──────────────────────────────────────────────┤
│   Zone 3D     │  Parametres lame                             │
│   interactive │  Parametres tsuka                            │
│               │  Resume prix + CTA devis                     │
├───────────────┴──────────────────────────────────────────────┤
│ Footer : infos support & accessibilite                       │
└──────────────────────────────────────────────────────────────┘
````

```mermaid
flowchart LR
    toolbar[Toolbar]
    zone[Zone 3D temps reel]
    blade[Parametres lame]
    handle[Parametres tsuka]
    summary[Resume prix + CTA devis]
    toolbar --> zone
    zone --> blade --> handle --> summary
```

![Wireframe atelier 3D](img/wireframe-atelier.png)

## Connexion
````ascii
┌─────────────────────────────┐
│ Logo + accroche             │
├─────────────────────────────┤
│ Champ email                 │
│ Champ mot de passe          │
│ Bouton connexion            │
├─────────────────────────────┤
│ Lien mot de passe oublie    │
│ CTA SSO / creation compte   │
├─────────────────────────────┤
│ Mentions RGPD + consentement│
└─────────────────────────────┘
````

```mermaid
flowchart TB
    header[Logo & message]
    form[Formulaire de connexion]
    helpers[Liens d'aide]
    consent[Bloc RGPD]
    header --> form --> helpers --> consent
```

![Wireframe connexion](img/wireframe-login.png)

## Espace compte
````ascii
┌──────────────────────────────────────────────────────────────┐
│ Header compte + navigation secondaire                        │
├───────────────┬──────────────────────────────────────────────┤
│ Liste katanas │ Détails selection + Historique devis         │
│ + favoris     │                                              │
├───────────────┴──────────────────────────────────────────────┤
│ Bloc preferences : consentements, RGPD, export donnees       │
└──────────────────────────────────────────────────────────────┘
````

```mermaid
flowchart LR
    header[Navigation compte]
    list[Liste katanas]
    details[Details / Historique]
    prefs[Bloc preferences & RGPD]
    header --> list --> details --> prefs
```

![Wireframe espace compte](img/wireframe-account.png)

## Devis / Checkout
````ascii
┌──────────────────────────────────────────────────────────────┐
│ Resume katana + titre devis                                  │
├───────────────┬──────────────────────────────────────────────┤
│ Formulaire    │ Details prix + options livraison              │
│ infos client  │                                              │
├───────────────┴──────────────────────────────────────────────┤
│ Consentement RGPD + accessibilite RGAA                       │
├──────────────────────────────────────────────────────────────┤
│ CTA confirmer + generation PDF                               │
└──────────────────────────────────────────────────────────────┘
````

```mermaid
flowchart TB
    resume[Resume katana]
    form[Formulaire client]
    pricing[Details prix]
    consent[Consentement RGPD/RGAA]
    action[CTA confirmation]
    resume --> form
    resume --> pricing
    form --> consent --> action
    pricing --> consent
```

![Wireframe devis / checkout](img/wireframe-quote.png)

