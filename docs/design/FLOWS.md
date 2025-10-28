# Flows utilisateurs

Les diagrammes suivants illustrent l'enchainement des ecrans principaux. Utiliser ces flows pour valider les stories avant maquettage detaille.

## Parcours 1 - Visiteur -> Devis
````ascii
Accueil -> Atelier 3D -> Connexion (si necessaire) -> Devis / Checkout -> Confirmation
````

```mermaid
flowchart LR
    home[Accueil]
    studio[Atelier 3D]
    login[Connexion / Creation]
    quote[Devis / Checkout]
    confirm[Confirmation devis envoye]
    home --> studio
    studio --> quote
    studio --> login
    login --> quote
    quote --> confirm
```

Points clefs :
- Collecter le consentement RGPD sur l'ecran Devis et rappeler les mentions dans le footer.
- Si l'utilisateur est deja connecte, sauter l'ecran Connexion et pre-remplir les donnees.

## Parcours 2 - Utilisateur connecte -> Gestion compte
````ascii
Connexion -> Espace compte -> Detail katana -> Historique devis -> Preferences RGPD
````

```mermaid
flowchart TB
    login[Connexion]
    account[Espace compte]
    detail[Detail katana]
    history[Historique de devis]
    privacy[Preferences RGPD / export]
    login --> account --> detail --> history --> privacy
```

Points clefs :
- Afficher la date de dernier consentement RGPD et proposer mise a jour.
- Fournir un bouton d'export simple (CSV/PDF) depuis le bloc preferences.

## Parcours 3 - Commercial interne
````ascii
Dashboard (Compte) -> Filtre devis -> Detail devis -> Contact client (via CRM)
````

```mermaid
flowchart LR
    board[Espace compte - onglet suivi]
    filter[Filtrer devis]
    detail[Detail devis + consentement]
    crm[Contact dans l'outil CRM]
    board --> filter --> detail --> crm
```

Points clefs :
- Toujours afficher le statut du consentement avant de contacter le client.
- Lien direct vers les mentions legales depuis le detail du devis.

