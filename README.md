# Site Web de l'association CLEAN

Ce dépôt contient le code source du site web de l'association CLEAN (Conservation de L'Eau À Nantes).

## Implémentation des événements

Les événements sont gérés via des fichiers markdown stockés dans le dossier `_events/`. Voici comment fonctionne le système:

### Structure des fichiers markdown

Chaque événement est défini dans un fichier markdown avec le format suivant:

```markdown
---
title: Titre de l'événement
date: Date affichée (ex: À venir, 15 Juin 2025)
description: Description détaillée de l'événement
image: /images/uploads/image.jpg
link: URL pour en savoir plus (ou #contact)
linkText: Texte du lien (ex: Plus d'informations)
publishDate: 2025-01-01T00:00:00.000Z
order: 1
---
Contenu optionnel en markdown qui peut être utilisé pour une page détaillée.
```

### Chargement dynamique via une fonction Netlify

Les événements sont chargés dynamiquement dans la page d'accueil via JavaScript qui appelle une fonction Netlify (`get-events.js`). Cette fonction lit directement les fichiers markdown et renvoie les données au format JSON.

#### Avantages de cette approche:
- Les mises à jour sont immédiatement visibles sans nécessité de regénérer un fichier JSON intermédiaire
- Possibilité d'exploiter le contenu markdown complet pour des pages détaillées
- Meilleure cohérence entre les données dans Netlify CMS et l'affichage sur le site

## Développement local

1. Cloner ce dépôt
2. Installer les dépendances: `npm install`
3. Démarrer le serveur de développement: `npm run dev`

## Gestion du contenu

Le contenu du site est géré via Netlify CMS, accessible à l'adresse `/admin`. Les événements peuvent être créés, modifiés et supprimés via cette interface. 