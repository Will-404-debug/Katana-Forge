# Expression des besoins - Katana Forge

## Synthese rapide
- Objectif : proposer un configurateur de katanas personnalises avec devis rapide et suivi client.
- Public cible : amateurs d'arts martiaux, artisans partenaires et equipe commerciale interne.
- Contraintes : experience fluide sur desktop/tablette, acces rapide aux infos legales (RGPD) et respect des criteres RGAA.

## Personas
### Aiko, passionnee d'arts martiaux (B2C)
- Veut visualiser son katana en 3D, comparer les finitions et commander un devis.
- Dispose de peu de temps ; cherche une interface claire, rassurante et responsive.
- Souhaite etre rassuree sur la securite de ses donnees personnelles.

### Kenji, artisan partenaire (B2B)
- Consulte les demandes de devis et partage son expertise technique.
- Besoin d'un espace compte pour suivre les commandes et mettre a jour les options de forge.
- Attentif aux specifications materiaux et aux delais communiques au client.

### Claire, commerciale interne
- Gere les leads entrants et suit les conversions devis -> commande.
- A besoin d'un tableau de bord simple : listes de katanas en cours, statut des devis, consentements utilisateurs.
- Doit pouvoir exporter les informations en respectant RGPD.

## User stories principales
- En tant que visiteur, je vois une page d'accueil qui explique la proposition de valeur et me propose un CTA vers l'atelier.
- En tant que passionnee, je configure mon katana en 3D, vois le prix estime en temps reel et demande un devis.
- En tant qu'utilisateur connecte, je retrouve mes configurations, mes devis, et je peux mettre a jour mes preferences RGPD.
- En tant que commerciale, je filtre les devis par statut et j'accede aux consentements lies pour recontacter les prospects.
- En tant qu'artisan partenaire, je consulte les fiches techniques envoye es via l'espace compte et j'ajoute mes commentaires.

## Contraintes fonctionnelles et techniques
- Application Next.js 14, TypeScript strict, rendu hybride (SSR + client components pour la 3D).
- Atelier 3D charge uniquement sur desktop/tablette modernes (WebGL obligatoire) avec alternative texte pour accessibility.
- Authentification securisee (cookies HTTP-only), enregistrement des consentements avec empreinte temporelle.
- Gestion offline minimale : informer l'utilisateur si la sauvegarde echoue et proposer une relance.
- Contenus indispensables dans le footer : mentions legales RGPD, lien vers politique de confidentialite, accesibilite.

## RGPD - Donnees traitees
- Donnees collecte es : nom, email, telephone (optionnel), preferences katana, historique devis.
- Base legale : consentement (newsletter), execution pre-contractuelle (devis) et interet legitime (amelioration produit).
- Conservation : 3 ans pour les leads sans commande, suppression automatique ou anonymisation.
- Droits utilisateurs : acces, rectification, suppression, portabilite ; mettre a disposition un formulaire de contact et un email dedie (ex : `privacy@katanalab.test`).
- Traçabilite : stocker la date, la version du texte de consentement et l'adresse IP lors de la validation.

## RGAA - Points d'attention
- Respecter les criteres de niveau AA : contrastes suffisant (> 4.5:1), navigation clavier, focus visibles.
- Fournir des descriptions textuelles alternatives pour toutes les vues 3D (et message de secours si WebGL indisponible).
- Assurer la compatibilite avec lecteurs d'ecran (landmarks ARIA, titres de page pertinents).
- Tester chaque ecran avec la checklist RGAA (voir `docs/design/MAQUETTES.md` et `docs/design/FLOWS.md` pour le contexte).

## Checklist RGAA a valider
- [ ] Contrastes conformes (4.5:1 minimum, 3:1 pour texte large).
- [ ] Navigation 100 % clavier : focus visible, ordre logique, echappement des modales.
- [ ] Alternatives textuelles pour les elements graphiques (dont canvas 3D) et transcription pour les videos.
- [ ] Titres et balises ARIA coherents, liens explicites (pas de "cliquez ici").
- [ ] Formulaires accessibles : labels associes, messages d'erreur lisibles, champs requis identifies.

## Mentions legales RGPD a afficher
- [ ] Lien footer : Politique de confidentialite, Mentions legales, Contact RGPD (`privacy@katanalab.test`).
- [ ] Texte de consentement : description des finalites (devis, communication), reference a la politique de confidentialite, droit de retrait.
- [ ] Case a cocher explicite pour la prospection marketing (non cochee par defaut).
- [ ] Rappel de la duree de conservation (3 ans) et de la possibilite d'exercer ses droits.
- [ ] Date/heure et version du texte stockees lors de la validation.
